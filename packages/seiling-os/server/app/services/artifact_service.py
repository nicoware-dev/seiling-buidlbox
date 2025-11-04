"""Artifact service for Seiling OS"""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artifact import Artifact


class ArtifactService:
    """Service for artifact CRUD operations"""

    @staticmethod
    async def create_artifact(
        session: AsyncSession,
        name: str,
        type: str,
        content: str,
    ) -> tuple[bool, dict[str, Any]]:
        """Create a new artifact"""
        try:
            if not name or not isinstance(name, str) or len(name.strip()) == 0:
                return False, {"error": "Artifact name is required and must be a non-empty string"}

            if not type or not isinstance(type, str) or len(type.strip()) == 0:
                return False, {"error": "Artifact type is required and must be a non-empty string"}

            artifact = Artifact(
                id=str(uuid.uuid4()),
                name=name.strip(),
                type=type.strip(),
                content=content or "",
            )

            session.add(artifact)
            await session.commit()
            await session.refresh(artifact)

            return True, {
                "artifact": {
                    "id": artifact.id,
                    "name": artifact.name,
                    "type": artifact.type,
                    "content": artifact.content,
                    "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                    "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error creating artifact: {str(e)}"}

    @staticmethod
    async def get_artifact(
        session: AsyncSession, artifact_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Get an artifact by ID"""
        try:
            result = await session.execute(select(Artifact).where(Artifact.id == artifact_id))
            artifact = result.scalar_one_or_none()

            if not artifact:
                return False, {"error": "Artifact not found"}

            return True, {
                "artifact": {
                    "id": artifact.id,
                    "name": artifact.name,
                    "type": artifact.type,
                    "content": artifact.content,
                    "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                    "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
                }
            }
        except Exception as e:
            return False, {"error": f"Error getting artifact: {str(e)}"}

    @staticmethod
    async def list_artifacts(
        session: AsyncSession, type: str | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """List all artifacts, optionally filtered by type"""
        try:
            query = select(Artifact)

            if type:
                query = query.where(Artifact.type == type)

            query = query.order_by(Artifact.updated_at.desc())

            result = await session.execute(query)
            artifacts = result.scalars().all()

            return True, {
                "artifacts": [
                    {
                        "id": artifact.id,
                        "name": artifact.name,
                        "type": artifact.type,
                        "content": artifact.content,
                        "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                        "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
                    }
                    for artifact in artifacts
                ]
            }
        except Exception as e:
            return False, {"error": f"Error listing artifacts: {str(e)}"}

    @staticmethod
    async def update_artifact(
        session: AsyncSession,
        artifact_id: str,
        name: str | None = None,
        type: str | None = None,
        content: str | None = None,
    ) -> tuple[bool, dict[str, Any]]:
        """Update an artifact"""
        try:
            result = await session.execute(select(Artifact).where(Artifact.id == artifact_id))
            artifact = result.scalar_one_or_none()

            if not artifact:
                return False, {"error": "Artifact not found"}

            if name is not None:
                if not isinstance(name, str) or len(name.strip()) == 0:
                    return False, {"error": "Artifact name must be a non-empty string"}
                artifact.name = name.strip()

            if type is not None:
                if not isinstance(type, str) or len(type.strip()) == 0:
                    return False, {"error": "Artifact type must be a non-empty string"}
                artifact.type = type.strip()

            if content is not None:
                artifact.content = content

            await session.commit()
            await session.refresh(artifact)

            return True, {
                "artifact": {
                    "id": artifact.id,
                    "name": artifact.name,
                    "type": artifact.type,
                    "content": artifact.content,
                    "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                    "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
                }
            }
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error updating artifact: {str(e)}"}

    @staticmethod
    async def delete_artifact(
        session: AsyncSession, artifact_id: str
    ) -> tuple[bool, dict[str, Any]]:
        """Delete an artifact"""
        try:
            result = await session.execute(select(Artifact).where(Artifact.id == artifact_id))
            artifact = result.scalar_one_or_none()

            if not artifact:
                return False, {"error": "Artifact not found"}

            await session.delete(artifact)
            await session.commit()

            return True, {"message": "Artifact deleted successfully"}
        except Exception as e:
            await session.rollback()
            return False, {"error": f"Error deleting artifact: {str(e)}"}

