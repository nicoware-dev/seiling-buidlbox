"""RAG service for knowledge base queries"""

import json
import os
from typing import Any

from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge import KnowledgeChunk
from app.services.qdrant_client import QdrantService


class RAGService:
    """Service for RAG queries using Qdrant"""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.qdrant = QdrantService()
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY", ""),
        )

    async def search_knowledge(
        self, query: str, limit: int = 5
    ) -> tuple[bool, dict[str, Any]]:
        """
        Search knowledge base using RAG.

        Args:
            query: Search query
            limit: Number of results to return

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            # Create embedding for query
            embedding = await self._create_embedding(query)
            if not embedding:
                return False, {"error": "Failed to create embedding"}

            # Search in Qdrant
            results = self.qdrant.search_vectors(embedding, limit=limit)

            # Fetch full chunk data from database
            chunk_ids = [r["id"] for r in results]
            if not chunk_ids:
                return True, {"results": [], "query": query}

            db_results = await self.session.execute(
                select(KnowledgeChunk).where(KnowledgeChunk.id.in_(chunk_ids))
            )
            chunks = db_results.scalars().all()

            # Combine Qdrant results with DB chunks
            results_with_content = []
            chunk_map = {chunk.id: chunk for chunk in chunks}

            for result in results:
                chunk = chunk_map.get(str(result["id"]))
                if chunk:
                    metadata = {}
                    try:
                        if chunk.metadata_json:
                            metadata = json.loads(chunk.metadata_json)
                    except:
                        pass
                    results_with_content.append({
                        "content": chunk.content,
                        "score": result["score"],
                        "metadata": metadata,
                        "chunk_id": chunk.id,
                    })

            return True, {"results": results_with_content, "query": query}
        except Exception as e:
            return False, {"error": f"Error searching knowledge: {str(e)}"}

    async def _create_embedding(self, text: str) -> list[float] | None:
        """Create embedding using OpenAI"""
        try:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None

    async def index_chunks(
        self, chunk_ids: list[str]
    ) -> tuple[bool, dict[str, Any]]:
        """
        Index chunks in Qdrant (create embeddings and store).

        Args:
            chunk_ids: List of chunk IDs to index

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            # Fetch chunks from database
            db_results = await self.session.execute(
                select(KnowledgeChunk).where(KnowledgeChunk.id.in_(chunk_ids))
            )
            chunks = db_results.scalars().all()

            if not chunks:
                return False, {"error": "No chunks found"}

            # Create embeddings for all chunks
            points = []
            for chunk in chunks:
                embedding = await self._create_embedding(chunk.content)
                if not embedding:
                    continue

                metadata = json.loads(chunk.metadata_json) if chunk.metadata_json else {}
                points.append({
                    "id": chunk.id,
                    "vector": embedding,
                    "payload": {
                        "content": chunk.content[:500],  # Store snippet
                        "source_id": chunk.source_id,
                        **metadata,
                    },
                })

                # Update chunk with vector_id
                chunk.vector_id = chunk.id
                await self.session.flush()

            # Upsert to Qdrant
            success = self.qdrant.upsert_vectors(points)

            if success:
                await self.session.commit()
                return True, {
                    "message": f"Indexed {len(points)} chunks",
                    "chunks_indexed": len(points),
                }
            else:
                await self.session.rollback()
                return False, {"error": "Failed to index chunks in Qdrant"}

        except Exception as e:
            await self.session.rollback()
            return False, {"error": f"Error indexing chunks: {str(e)}"}

