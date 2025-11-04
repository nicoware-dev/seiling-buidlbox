"""Tasks API router for Seiling OS"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    """Request model for creating a task"""

    title: str
    description: str | None = None
    done: bool = False


class UpdateTaskRequest(BaseModel):
    """Request model for updating a task"""

    title: str | None = None
    description: str | None = None
    done: bool | None = None


@router.get("")
async def list_tasks(
    done: bool | None = None, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """List all tasks, optionally filtered by done status"""
    success, result = await TaskService.list_tasks(session, done=done)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result


@router.post("")
async def create_task(
    request: CreateTaskRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Create a new task"""
    success, result = await TaskService.create_task(
        session,
        title=request.title,
        description=request.description,
        done=request.done,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=result
        )

    return result


@router.get("/{task_id}")
async def get_task(
    task_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get a task by ID"""
    success, result = await TaskService.get_task(session, task_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=result
        )

    return result


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    request: UpdateTaskRequest,
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Update a task"""
    success, result = await TaskService.update_task(
        session,
        task_id=task_id,
        title=request.title,
        description=request.description,
        done=request.done,
    )

    if not success:
        error_detail = result.get("error", "Unknown error")
        if "not found" in error_detail.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=result
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=result
        )

    return result


@router.delete("/{task_id}")
async def delete_task(
    task_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Delete a task"""
    success, result = await TaskService.delete_task(session, task_id)

    if not success:
        error_detail = result.get("error", "Unknown error")
        if "not found" in error_detail.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=result
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result

