"""
title: Eliza Agent Pipe (N8N Pattern)
author: Seiling Buidlbox
author_url: https://www.github.com/0xn1c0/seiling-buildbox
version: 2.0.0

This module defines a Pipe class that follows the exact working N8N workflow pattern
"""

from typing import Optional, Callable, Awaitable
from pydantic import BaseModel, Field
import os
import time
import requests
import json


def extract_event_info(event_emitter) -> tuple[Optional[str], Optional[str]]:
    if not event_emitter or not event_emitter.__closure__:
        return None, None
    for cell in event_emitter.__closure__:
        if isinstance(request_info := cell.cell_contents, dict):
            chat_id = request_info.get("chat_id")
            message_id = request_info.get("message_id")
            return chat_id, message_id
    return None, None


class Pipe:
    class Valves(BaseModel):
        eliza_url: str = Field(
            default="http://seiling-eliza:3000",
            description="Base URL for Eliza API"
        )
        wait_time: int = Field(
            default=8,
            description="Seconds to wait for agent response (N8N uses 10)"
        )
        emit_interval: float = Field(
            default=2.0, description="Interval in seconds between status emissions"
        )
        enable_status_indicator: bool = Field(
            default=True, description="Enable or disable status indicator emissions"
        )

    def __init__(self):
        self.type = "pipe"
        self.id = "eliza_pipe_n8n"
        self.name = "Eliza Agent Pipe (N8N Pattern)"
        self.valves = self.Valves()
        self.last_emit_time = 0

    async def emit_status(
        self,
        __event_emitter__: Callable[[dict], Awaitable[None]],
        level: str,
        message: str,
        done: bool,
    ):
        current_time = time.time()
        if (
            __event_emitter__
            and self.valves.enable_status_indicator
            and (
                current_time - self.last_emit_time >= self.valves.emit_interval or done
            )
        ):
            await __event_emitter__(
                {
                    "type": "status",
                    "data": {
                        "status": "complete" if done else "in_progress",
                        "level": level,
                        "description": message,
                        "done": done,
                    },
                }
            )
            self.last_emit_time = current_time

    async def pipe(
        self,
        body: dict,
        __user__: Optional[dict] = None,
        __event_emitter__: Callable[[dict], Awaitable[None]] = None,
        __event_call__: Callable[[dict], Awaitable[dict]] = None,
    ) -> Optional[dict]:
        await self.emit_status(
            __event_emitter__, "info", "Starting Eliza workflow...", False
        )
        
        messages = body.get("messages", [])
        if not messages:
            return {"error": "No messages found in the request body"}

        user_content = messages[-1]["content"]
        
        try:
            # Step 1: Get Eliza Server (like N8N workflow)
            await self.emit_status(__event_emitter__, "info", "Getting Eliza server info...", False)
            
            server_response = requests.get(
                f"{self.valves.eliza_url}/api/messaging/central-servers",
                timeout=10
            )
            
            if server_response.status_code != 200:
                return {"error": f"Failed to get server info: {server_response.text}"}
            
            server_data = server_response.json()
            if not server_data.get("success") or not server_data.get("data", {}).get("servers"):
                return {"error": "No servers found in Eliza"}
            
            server_id = server_data["data"]["servers"][0]["id"]
            
            # Step 2: List Agents (like N8N workflow)
            await self.emit_status(__event_emitter__, "info", "Getting agent list...", False)
            
            agents_response = requests.get(
                f"{self.valves.eliza_url}/api/agents",
                timeout=10
            )
            
            if agents_response.status_code != 200:
                return {"error": f"Failed to get agents: {agents_response.text}"}
            
            agents_data = agents_response.json()
            if not agents_data.get("success") or not agents_data.get("data", {}).get("agents"):
                return {"error": "No agents found in Eliza"}
            
            agent_id = agents_data["data"]["agents"][0]["id"]
            
            # Step 3: Create Channel (like N8N workflow)
            await self.emit_status(__event_emitter__, "info", "Creating communication channel...", False)
            
            create_channel_payload = {
                "name": "openwebui_channel",
                "serverId": server_id,
                "description": "OpenWebUI chat",
                "type": "text"
            }
            
            channel_response = requests.post(
                f"{self.valves.eliza_url}/api/messaging/channels",
                json=create_channel_payload,
                timeout=10
            )
            
            if channel_response.status_code not in [200, 201]:
                return {"error": f"Failed to create channel: {channel_response.text}"}
            
            channel_data = channel_response.json()
            channel_id = channel_data["data"]["channel"]["id"]
            
            # Step 4: Add Agent to Channel (like N8N workflow)
            await self.emit_status(__event_emitter__, "info", "Adding agent to channel...", False)
            
            add_agent_payload = {
                "agentId": agent_id
            }
            
            add_agent_response = requests.post(
                f"{self.valves.eliza_url}/api/messaging/central-channels/{channel_id}/agents",
                json=add_agent_payload,
                timeout=10
            )
            
            if add_agent_response.status_code not in [200, 201]:
                return {"error": f"Failed to add agent to channel: {add_agent_response.text}"}
            
            # Step 5: Send Message (EXACT N8N payload structure)
            await self.emit_status(__event_emitter__, "info", "Sending message to agent...", False)
            
            # Use the EXACT payload from your working N8N workflow
            message_payload = {
                "channel_id": channel_id,
                "server_id": server_id,
                "author_id": server_id,  # N8N uses server_id as author_id
                "content": user_content,
                "source_type": "user_message",
                "raw_message": {},
                "metadata": {
                    "channelType": "DM",
                    "isDm": True,
                    "targetUserId": agent_id
                }
            }
            
            send_response = requests.post(
                f"{self.valves.eliza_url}/api/messaging/submit",
                json=message_payload,
                timeout=10
            )
            
            if send_response.status_code not in [200, 201]:
                return {"error": f"Failed to send message: {send_response.text}"}
            
            # Step 6: Wait (like N8N workflow)
            await self.emit_status(__event_emitter__, "info", f"Waiting {self.valves.wait_time} seconds for agent response...", False)
            time.sleep(self.valves.wait_time)
            
            # Step 7: Get Response (EXACT N8N endpoint)
            await self.emit_status(__event_emitter__, "info", "Retrieving agent response...", False)
            
            response_response = requests.get(
                f"{self.valves.eliza_url}/api/messaging/central-channels/{channel_id}/messages",
                timeout=10
            )
            
            if response_response.status_code != 200:
                return {"error": f"Failed to get response: {response_response.text}"}
            
            response_data = response_response.json()
            
            # Extract response (EXACT N8N pattern: first message content)
            if (response_data.get("success") and 
                response_data.get("data", {}).get("messages") and 
                len(response_data["data"]["messages"]) > 0):
                
                # Get the first message content (like N8N)
                agent_response = response_data["data"]["messages"][0].get("content", "No response content")
                
                # Set assistant message
                body["messages"].append({"role": "assistant", "content": agent_response})
                
                await self.emit_status(__event_emitter__, "info", "Complete", True)
                return agent_response
            else:
                no_response_msg = "✅ Message sent successfully, but no response received yet. The agent may be processing your request."
                body["messages"].append({"role": "assistant", "content": no_response_msg})
                return no_response_msg
                
        except Exception as e:
            error_msg = f"Error in Eliza workflow: {str(e)}"
            await self.emit_status(__event_emitter__, "error", error_msg, True)
            return {"error": error_msg} 