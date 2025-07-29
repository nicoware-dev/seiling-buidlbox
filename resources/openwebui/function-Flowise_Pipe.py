"""
title: Flowise Pipe Function
author: Seiling Buidlbox
author_url: https://www.github.com/0xn1c0/seiling-buildbox
version: 0.1.0

This module defines a Pipe class that utilizes Flowise for an Agent
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
        flowise_url: str = Field(
            default="http://localhost:5003/api/v1/prediction/ff3d8e68-c4a9-4bd2-be8e-52f7a4b2d4ce",
            description="Flowise API endpoint URL with prediction ID"
        )
        input_field: str = Field(default="question", description="Field name for the input question")
        response_field: str = Field(default="text", description="Field name for the response text")
        emit_interval: float = Field(
            default=2.0, description="Interval in seconds between status emissions"
        )
        enable_status_indicator: bool = Field(
            default=True, description="Enable or disable status indicator emissions"
        )

    def __init__(self):
        self.type = "pipe"
        self.id = "flowise_pipe"
        self.name = "Flowise Pipe"
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
            __event_emitter__, "info", "Calling Flowise Agent...", False
        )
        chat_id, _ = extract_event_info(__event_emitter__)
        messages = body.get("messages", [])

        # Verify a message is available
        if messages:
            question = messages[-1]["content"]
            try:
                # Invoke Flowise agent
                headers = {
                    "Content-Type": "application/json",
                }
                payload = {self.valves.input_field: question}
                
                response = requests.post(
                    self.valves.flowise_url, json=payload, headers=headers
                )
                
                if response.status_code == 200:
                    flowise_response = response.json()
                    # Extract the response text from the Flowise response
                    if isinstance(flowise_response, dict):
                        response_text = flowise_response.get(self.valves.response_field, str(flowise_response))
                    else:
                        response_text = str(flowise_response)
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
                    f"Error during Flowise execution: {str(e)}",
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