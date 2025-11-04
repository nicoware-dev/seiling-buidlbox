"""Artifacts API router for Seiling OS"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])


class CreateArtifactRequest(BaseModel):
    """Request model for creating an artifact"""

    name: str
    type: str
    content: str = ""


class UpdateArtifactRequest(BaseModel):
    """Request model for updating an artifact"""

    name: str | None = None
    type: str | None = None
    content: str | None = None


@router.get("")
async def list_artifacts(
    type: str | None = None, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """List all artifacts, optionally filtered by type"""
    success, result = await ArtifactService.list_artifacts(session, type=type)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
        )

    return result


@router.post("")
async def create_artifact(
    request: CreateArtifactRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Create a new artifact"""
    success, result = await ArtifactService.create_artifact(
        session,
        name=request.name,
        type=request.type,
        content=request.content,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=result
        )

    return result


@router.get("/{artifact_id}")
async def get_artifact(
    artifact_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get an artifact by ID"""
    success, result = await ArtifactService.get_artifact(session, artifact_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=result
        )

    return result


@router.put("/{artifact_id}")
async def update_artifact(
    artifact_id: str,
    request: UpdateArtifactRequest,
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Update an artifact"""
    success, result = await ArtifactService.update_artifact(
        session,
        artifact_id=artifact_id,
        name=request.name,
        type=request.type,
        content=request.content,
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


@router.delete("/{artifact_id}")
async def delete_artifact(
    artifact_id: str, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Delete an artifact"""
    success, result = await ArtifactService.delete_artifact(session, artifact_id)

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

