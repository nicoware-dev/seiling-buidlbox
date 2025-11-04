"""Notes API router for Seiling OS"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.note_service import NoteService

router = APIRouter(prefix="/api/notes", tags=["notes"])


class CreateNoteRequest(BaseModel):
    """Request model for creating a note"""

    title: str
    body: str = ""


class UpdateNoteRequest(BaseModel):
    """Request model for updating a note"""

    title: str | None = None
    body: str | None = None


@router.get("")
async def list_notes(
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """List all notes"""
    success, result = await NoteService.list_notes(session)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result


@router.post("")
async def create_note(
    request: CreateNoteRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Create a new note"""
    success, result = await NoteService.create_note(
        session, title=request.title, body=request.body
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=result
        )

    return result


@router.get("/{note_id}")
async def get_note(
    note_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get a note by ID"""
    success, result = await NoteService.get_note(session, note_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=result
        )

    return result


@router.put("/{note_id}")
async def update_note(
    note_id: str,
    request: UpdateNoteRequest,
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Update a note"""
    success, result = await NoteService.update_note(
        session,
        note_id=note_id,
        title=request.title,
        body=request.body,
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


@router.delete("/{note_id}")
async def delete_note(
    note_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Delete a note"""
    success, result = await NoteService.delete_note(session, note_id)

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

