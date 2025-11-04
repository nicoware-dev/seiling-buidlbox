"""Run service for n8n/Flowise/MCP execution"""

import json
import os
import uuid
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.execution import Execution

# Service URLs
N8N_URL = os.getenv("N8N_URL", "http://localhost:5001")
FLOWISE_URL = os.getenv("FLOWISE_URL", "http://localhost:5003")


class RunService:
    """Service for executing n8n/Flowise/MCP workflows and agents"""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.client = httpx.AsyncClient(timeout=60.0)

    async def execute_n8n_workflow(
        self, workflow_id: str, input_data: dict[str, Any] | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """
        Execute an n8n workflow.

        Args:
            workflow_id: n8n workflow ID
            input_data: Optional input data

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            # Create execution record
            execution = Execution(
                id=str(uuid.uuid4()),
                execution_type="n8n",
                name=workflow_id,
                status="running",
                input_data=json.dumps(input_data) if input_data else None,
            )
            self.session.add(execution)
            await self.session.flush()

            # Execute workflow via n8n API
            # Note: n8n API structure may vary - this is a simplified version
            n8n_api_key = os.getenv("N8N_API_KEY", "")
            headers = {}
            if n8n_api_key:
                headers["X-N8N-API-KEY"] = n8n_api_key

            response = await self.client.post(
                f"{N8N_URL}/api/v1/workflows/{workflow_id}/execute",
                json={"data": input_data or {}},
                headers=headers,
            )

            if response.is_success:
                result_data = response.json()
                execution.status = "success"
                execution.output_data = json.dumps(result_data)
            else:
                execution.status = "error"
                execution.error_message = response.text

            await self.session.commit()
            await self.session.refresh(execution)

            return True, {
                "execution": {
                    "id": execution.id,
                    "status": execution.status,
                    "output_data": execution.output_data,
                    "error_message": execution.error_message,
                }
            }
        except Exception as e:
            await self.session.rollback()
            return False, {"error": f"Error executing n8n workflow: {str(e)}"}

    async def execute_flowise_agent(
        self, agent_id: str, input_data: dict[str, Any] | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """
        Execute a Flowise agent.

        Args:
            agent_id: Flowise agent ID
            input_data: Optional input data

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            # Create execution record
            execution = Execution(
                id=str(uuid.uuid4()),
                execution_type="flowise",
                name=agent_id,
                status="running",
                input_data=json.dumps(input_data) if input_data else None,
            )
            self.session.add(execution)
            await self.session.flush()

            # Execute agent via Flowise API
            flowise_username = os.getenv("FLOWISE_USERNAME", "admin")
            flowise_password = os.getenv("FLOWISE_PASSWORD", "")

            auth = (flowise_username, flowise_password) if flowise_password else None

            response = await self.client.post(
                f"{FLOWISE_URL}/api/v1/prediction/{agent_id}",
                json=input_data or {},
                auth=auth,
            )

            if response.is_success:
                result_data = response.json()
                execution.status = "success"
                execution.output_data = json.dumps(result_data)
            else:
                execution.status = "error"
                execution.error_message = response.text

            await self.session.commit()
            await self.session.refresh(execution)

            return True, {
                "execution": {
                    "id": execution.id,
                    "status": execution.status,
                    "output_data": execution.output_data,
                    "error_message": execution.error_message,
                }
            }
        except Exception as e:
            await self.session.rollback()
            return False, {"error": f"Error executing Flowise agent: {str(e)}"}

    async def execute_mcp_tool(
        self, tool_name: str, input_data: dict[str, Any] | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """
        Execute an MCP tool (via sei-mcp-server).

        Args:
            tool_name: MCP tool name
            input_data: Optional input data

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            # Create execution record
            execution = Execution(
                id=str(uuid.uuid4()),
                execution_type="mcp",
                name=tool_name,
                status="running",
                input_data=json.dumps(input_data) if input_data else None,
            )
            self.session.add(execution)
            await self.session.flush()

            # Execute via MCP server
            # This is a simplified version - actual MCP integration may be more complex
            mcp_url = os.getenv("MCP_SERVER_URL", "http://localhost:3000")

            response = await self.client.post(
                f"{mcp_url}/api/tools/{tool_name}/execute",
                json=input_data or {},
            )

            if response.is_success:
                result_data = response.json()
                execution.status = "success"
                execution.output_data = json.dumps(result_data)
            else:
                execution.status = "error"
                execution.error_message = response.text

            await self.session.commit()
            await self.session.refresh(execution)

            return True, {
                "execution": {
                    "id": execution.id,
                    "status": execution.status,
                    "output_data": execution.output_data,
                    "error_message": execution.error_message,
                }
            }
        except Exception as e:
            await self.session.rollback()
            return False, {"error": f"Error executing MCP tool: {str(e)}"}

    async def list_executions(
        self, execution_type: str | None = None, limit: int = 50
    ) -> tuple[bool, dict[str, Any]]:
        """List execution history"""
        try:
            from sqlalchemy import select

            query = select(Execution).order_by(Execution.created_at.desc()).limit(limit)

            if execution_type:
                query = query.where(Execution.execution_type == execution_type)

            result = await self.session.execute(query)
            executions = result.scalars().all()

            return True, {
                "executions": [
                    {
                        "id": ex.id,
                        "execution_type": ex.execution_type,
                        "name": ex.name,
                        "status": ex.status,
                        "input_data": json.loads(ex.input_data)
                        if ex.input_data
                        else None,
                        "output_data": json.loads(ex.output_data)
                        if ex.output_data
                        else None,
                        "error_message": ex.error_message,
                        "task_id": ex.task_id,
                        "created_at": ex.created_at.isoformat() if ex.created_at else None,
                    }
                    for ex in executions
                ]
            }
        except Exception as e:
            return False, {"error": f"Error listing executions: {str(e)}"}

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

