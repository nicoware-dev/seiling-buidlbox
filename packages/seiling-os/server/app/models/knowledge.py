"""Knowledge base models for Seiling OS"""

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class KnowledgeSource(BaseModel):
    """Knowledge source model (e.g., Sei docs)"""

    __tablename__ = "knowledge_sources"

    title: Mapped[str] = mapped_column(nullable=False)
    url: Mapped[str] = mapped_column(nullable=False)
    source_type: Mapped[str] = mapped_column(default="website")  # website, pdf, etc.
    crawled_at: Mapped[str | None] = mapped_column(default=None)


class KnowledgeChunk(BaseModel):
    """Chunk of knowledge for vector search"""

    __tablename__ = "knowledge_chunks"

    source_id: Mapped[str] = mapped_column(nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, default=None)  # JSON string (renamed from metadata - SQLAlchemy reserved)
    vector_id: Mapped[str | None] = mapped_column(default=None)  # Qdrant vector ID

