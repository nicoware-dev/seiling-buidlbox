"""Task model for Seiling OS"""

from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class Task(BaseModel):
    """Task model: id, title, description, done, created_at, updated_at"""

    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(default=None)
    done: Mapped[bool] = mapped_column(default=False, nullable=False)

