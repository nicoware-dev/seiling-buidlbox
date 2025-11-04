"""Task service for Seiling OS"""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


class TaskService:
    """Service for task CRUD operations"""

    @staticmethod
    async def create_task(
        session: AsyncSession,
        title: str,
        description: str | None = None,
        done: bool = False,
    ) -> tuple[bool, dict[str, Any]]:
        """Create a new task"""
        try:
            if not title or not isinstance(title, str) or len(title.strip()) == 0:
                return False, {"error": "Task title is required and must be a non-empty string"}

            task = Task(
                id=str(uuid.uuid4()),
                title=title.strip(),
                description=description.strip() if description else None,
                done=done,
            )

            session.add(task)
            await session.commit()
            await session.refresh(task)

            return True, {
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "done": task.done,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error creating task: {str(e)}"}

    @staticmethod
    async def get_task(
        session: AsyncSession, task_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Get a task by ID"""
        try:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()

            if not task:
                return False, {"error": "Task not found"}

            return True, {
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "done": task.done,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                }
            }
        except Exception as e:
            return False, {"error": f"Error getting task: {str(e)}"}

    @staticmethod
    async def list_tasks(
        session: AsyncSession, done: bool | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """List all tasks, optionally filtered by done status"""
        try:
            query = select(Task)

            if done is not None:
                query = query.where(Task.done == done)

            query = query.order_by(Task.created_at.desc())

            result = await session.execute(query)
            tasks = result.scalars().all()

            return True, {
                "tasks": [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "done": task.done,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                    }
                    for task in tasks
                ]
            }
        except Exception as e:
            return False, {"error": f"Error listing tasks: {str(e)}"}

    @staticmethod
    async def update_task(
        session: AsyncSession,
        task_id: str,
        title: str | None = None,
        description: str | None = None,
        done: bool | None = None,
    ) -> tuple[bool, dict[str, Any]]:
        """Update a task"""
        try:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()

            if not task:
                return False, {"error": "Task not found"}

            if title is not None:
                if not isinstance(title, str) or len(title.strip()) == 0:
                    return False, {"error": "Task title must be a non-empty string"}
                task.title = title.strip()

            if description is not None:
                task.description = description.strip() if description else None

            if done is not None:
                task.done = done

            await session.commit()
            await session.refresh(task)

            return True, {
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "done": task.done,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error updating task: {str(e)}"}

    @staticmethod
    async def delete_task(
        session: AsyncSession, task_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Delete a task"""
        try:
            result = await session.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()

            if not task:
                return False, {"error": "Task not found"}

            await session.delete(task)
            await session.commit()

            return True, {"message": "Task deleted successfully"}
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error deleting task: {str(e)}"}

