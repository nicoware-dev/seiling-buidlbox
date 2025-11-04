"""Artifact model for Seiling OS"""

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class Artifact(BaseModel):
    """Artifact model: id, name, type, content, created_at, updated_at"""

    __tablename__ = "artifacts"

    name: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)  # e.g., "prompt", "rule", "context"
    content: Mapped[str] = mapped_column(Text, nullable=False)

