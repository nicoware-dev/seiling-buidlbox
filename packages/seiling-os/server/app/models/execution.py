"""Execution history models for Run Panel"""

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import BaseModel


class Execution(BaseModel):
    """Execution history for n8n/Flowise/MCP runs"""

    __tablename__ = "executions"

    execution_type: Mapped[str] = mapped_column(nullable=False)  # n8n, flowise, mcp
    name: Mapped[str] = mapped_column(nullable=False)  # workflow/agent/tool name
    status: Mapped[str] = mapped_column(default="running")  # running, success, error
    input_data: Mapped[str | None] = mapped_column(Text, default=None)  # JSON string
    output_data: Mapped[str | None] = mapped_column(Text, default=None)  # JSON string
    error_message: Mapped[str | None] = mapped_column(Text, default=None)
    task_id: Mapped[str | None] = mapped_column(default=None, index=True)  # Link to task

