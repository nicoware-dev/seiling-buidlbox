"""Qdrant client for vector storage"""

import os
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams


class QdrantService:
    """Service for Qdrant vector database operations"""

    def __init__(self):
        """Initialize Qdrant client"""
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.client = QdrantClient(url=qdrant_url)
        self.collection_name = "seiling_knowledge"
        self._ensure_collection()

    def _ensure_collection(self):
        """Ensure the collection exists"""
        collections = self.client.get_collections()
        collection_names = [c.name for c in collections.collections]

        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE),  # OpenAI embedding size
            )

    def upsert_vectors(
        self, points: list[dict[str, Any]]
    ) -> bool:
        """Upsert vectors to Qdrant (synchronous)"""
        try:
            qdrant_points = [
                PointStruct(
                    id=point["id"],
                    vector=point["vector"],
                    payload=point.get("payload", {}),
                )
                for point in points
            ]
            self.client.upsert(collection_name=self.collection_name, points=qdrant_points)
            return True
        except Exception as e:
            print(f"Error upserting vectors: {e}")
            return False

    def search_vectors(
        self, query_vector: list[float], limit: int = 5
    ) -> list[dict[str, Any]]:
        """Search for similar vectors"""
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
            )
            return [
                {
                    "id": result.id,
                    "score": result.score,
                    "payload": result.payload,
                }
                for result in results
            ]
        except Exception as e:
            print(f"Error searching vectors: {e}")
            return []

