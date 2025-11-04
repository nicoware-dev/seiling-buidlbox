"""Note service for Seiling OS"""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note


class NoteService:
    """Service for note CRUD operations"""

    @staticmethod
    async def create_note(
        session: AsyncSession, title: str, body: str = ""
    ) -> tuple[bool, dict[str, Any]]:
        """Create a new note"""
        try:
            if not title or not isinstance(title, str) or len(title.strip()) == 0:
                return False, {"error": "Note title is required and must be a non-empty string"}

            note = Note(
                id=str(uuid.uuid4()),
                title=title.strip(),
                body=body or "",
            )

            session.add(note)
            await session.commit()
            await session.refresh(note)

            return True, {
                "note": {
                    "id": note.id,
                    "title": note.title,
                    "body": note.body,
                    "created_at": note.created_at.isoformat() if note.created_at else None,
                    "updated_at": note.updated_at.isoformat() if note.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error creating note: {str(e)}"}

    @staticmethod
    async def get_note(
        session: AsyncSession, note_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Get a note by ID"""
        try:
            result = await session.execute(select(Note).where(Note.id == note_id))
            note = result.scalar_one_or_none()

            if not note:
                return False, {"error": "Note not found"}

            return True, {
                "note": {
                    "id": note.id,
                    "title": note.title,
                    "body": note.body,
                    "created_at": note.created_at.isoformat() if note.created_at else None,
                    "updated_at": note.updated_at.isoformat() if note.updated_at else None,
                }
            }
        except Exception as e:
            return False, {"error": f"Error getting note: {str(e)}"}

    @staticmethod
    async def list_notes(session: AsyncSession) -> tuple[bool, dict[str, Any]]:
        """List all notes"""
        try:
            query = select(Note).order_by(Note.updated_at.desc())
            result = await session.execute(query)
            notes = result.scalars().all()

            return True, {
                "notes": [
                    {
                        "id": note.id,
                        "title": note.title,
                        "body": note.body,
                        "created_at": note.created_at.isoformat() if note.created_at else None,
                        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
                    }
                    for note in notes
                ]
            }
        except Exception as e:
            return False, {"error": f"Error listing notes: {str(e)}"}

    @staticmethod
    async def update_note(
        session: AsyncSession,
        note_id: str,
        title: str | None = None,
        body: str | None = None,
    ) -> tuple[bool, dict[str, Any]]:
        """Update a note"""
        try:
            result = await session.execute(select(Note).where(Note.id == note_id))
            note = result.scalar_one_or_none()

            if not note:
                return False, {"error": "Note not found"}

            if title is not None:
                if not isinstance(title, str) or len(title.strip()) == 0:
                    return False, {"error": "Note title must be a non-empty string"}
                note.title = title.strip()

            if body is not None:
                note.body = body

            await session.commit()
            await session.refresh(note)

            return True, {
                "note": {
                    "id": note.id,
                    "title": note.title,
                    "body": note.body,
                    "created_at": note.created_at.isoformat() if note.created_at else None,
                    "updated_at": note.updated_at.isoformat() if note.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error updating note: {str(e)}"}

    @staticmethod
    async def delete_note(
        session: AsyncSession, note_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Delete a note"""
        try:
            result = await session.execute(select(Note).where(Note.id == note_id))
            note = result.scalar_one_or_none()

            if not note:
                return False, {"error": "Note not found"}

            await session.delete(note)
            await session.commit()

            return True, {"message": "Note deleted successfully"}
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error deleting note: {str(e)}"}

