"""Run panel API router for Seiling OS"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.run_service import RunService

router = APIRouter(prefix="/api/runs", tags=["runs"])


class ExecuteN8NRequest(BaseModel):
    """Request model for executing n8n workflow"""

    workflow_id: str
    input_data: dict[str, Any] | None = None


class ExecuteFlowiseRequest(BaseModel):
    """Request model for executing Flowise agent"""

    agent_id: str
    input_data: dict[str, Any] | None = None


class ExecuteMCPRequest(BaseModel):
    """Request model for executing MCP tool"""

    tool_name: str
    input_data: dict[str, Any] | None = None


@router.post("/n8n")
async def execute_n8n(
    request: ExecuteN8NRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Execute an n8n workflow"""
    run_service = RunService(session)
    try:
        success, result = await run_service.execute_n8n_workflow(
            request.workflow_id, request.input_data
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
            )
        return result
    finally:
        await run_service.close()


@router.post("/flowise")
async def execute_flowise(
    request: ExecuteFlowiseRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Execute a Flowise agent"""
    run_service = RunService(session)
    try:
        success, result = await run_service.execute_flowise_agent(
            request.agent_id, request.input_data
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
            )
        return result
    finally:
        await run_service.close()


@router.post("/mcp")
async def execute_mcp(
    request: ExecuteMCPRequest, session: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Execute an MCP tool"""
    run_service = RunService(session)
    try:
        success, result = await run_service.execute_mcp_tool(
            request.tool_name, request.input_data
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
            )
        return result
    finally:
        await run_service.close()


@router.get("/history")
async def list_executions(
    execution_type: str | None = None,
    limit: int = 50,
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """List execution history"""
    run_service = RunService(session)
    try:
        success, result = await run_service.list_executions(
            execution_type=execution_type, limit=limit
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result
            )
        return result
    finally:
        await run_service.close()

