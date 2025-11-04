"""Note model for Seiling OS"""

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class Note(BaseModel):
    """Note model: id, title, body, created_at, updated_at"""

    __tablename__ = "notes"

    title: Mapped[str] = mapped_column(nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")

