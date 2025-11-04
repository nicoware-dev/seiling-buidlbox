"""Knowledge base API router for Seiling OS"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.knowledge_crawler import KnowledgeCrawlerService
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class CrawlRequest(BaseModel):
    """Request model for crawling"""

    url: str
    max_pages: int = 10


class SearchRequest(BaseModel):
    """Request model for knowledge search"""

    query: str
    limit: int = 5


@router.post("/crawl")
async def crawl_docs(
    request: CrawlRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Crawl Sei documentation"""
    crawler = KnowledgeCrawlerService(session)
    try:
        success, result = await crawler.crawl_sei_docs(
            request.url, max_pages=request.max_pages
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=result
            )
        return result
    finally:
        await crawler.close()


@router.post("/search")
async def search_knowledge(
    request: SearchRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Search knowledge base using RAG"""
    rag_service = RAGService(session)
    success, result = await rag_service.search_knowledge(
        request.query, limit=request.limit
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result


@router.post("/index")
async def index_chunks(
    chunk_ids: list[str], session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Index chunks in vector database"""
    rag_service = RAGService(session)
    success, result = await rag_service.index_chunks(chunk_ids)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result

