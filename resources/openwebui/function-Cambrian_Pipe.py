"""
title: Cambrian Agent Pipe Function
author: Seiling Buidlbox
author_url: https://www.github.com/0xn1c0/seiling-buildbox
version: 0.1.0

This module defines a Pipe class that utilizes Cambrian Agent for DeFi operations on Sei Network
"""

from typing import Optional, Callable, Awaitable
from pydantic import BaseModel, Field
import os
import time
import requests


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
        cambrian_url: str = Field(
            default="http://seiling-cambrian-agent:3000/api/chat",
            description="Cambrian Agent API endpoint URL"
        )
        response_field: str = Field(default="data", description="Field name for the response data")
        emit_interval: float = Field(
            default=2.0, description="Interval in seconds between status emissions"
        )
        enable_status_indicator: bool = Field(
            default=True, description="Enable or disable status indicator emissions"
        )

    def __init__(self):
        self.type = "pipe"
        self.id = "cambrian_pipe"
        self.name = "Cambrian Agent Pipe"
        self.valves = self.Valves()
        self.last_emit_time = 0
        pass

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
            __event_emitter__, "info", "Calling Cambrian Agent...", False
        )
        chat_id, _ = extract_event_info(__event_emitter__)
        messages = body.get("messages", [])

        # Verify a message is available
        if messages:
            user_content = messages[-1]["content"]
            try:
                # Invoke Cambrian agent with the expected message format
                headers = {
                    "Content-Type": "application/json",
                }
                payload = {
                    "messages": [
                        {
                            "role": "user",
                            "content": user_content
                        }
                    ]
                }
                
                response = requests.post(
                    self.valves.cambrian_url, json=payload, headers=headers
                )
                
                if response.status_code == 200:
                    cambrian_response = response.json()
                    # Extract the response text from the Cambrian response
                    if isinstance(cambrian_response, dict):
                        # Prefer 'text' field if present
                        response_text = cambrian_response.get('text')
                        if not response_text:
                            response_text = cambrian_response.get(self.valves.response_field, str(cambrian_response))
                    else:
                        response_text = str(cambrian_response)
                else:
                    raise Exception(f"Error: {response.status_code} - {response.text}")

                # Set assistant message with chain reply
                body["messages"].append({"role": "assistant", "content": response_text})
                
                await self.emit_status(__event_emitter__, "info", "Complete", True)
                return response_text
                
            except Exception as e:
                await self.emit_status(
                    __event_emitter__,
                    "error",
                    f"Error during Cambrian execution: {str(e)}",
                    True,
                )
                return {"error": str(e)}
        # If no message is available alert user
        else:
            await self.emit_status(
                __event_emitter__,
                "error",
                "No messages found in the request body",
                True,
            )
            body["messages"].append(
                {
                    "role": "assistant",
                    "content": "No messages found in the request body",
                }
            )
            return {"error": "No messages found in the request body"} 