"""
title: Cambrian Agent Pipe Function
author: Seiling Buidlbox
author_url: https://www.github.com/0xn1c0/seiling-buildbox
version: 0.1.0

This module defines a Pipe class that utilizes Cambrian Agent for DeFi operations on Sei Network
"""

import json
import time
from typing import Optional, Callable, Awaitable

import requests
from pydantic import BaseModel, Field


def extract_event_info(event_emitter) -> tuple[Optional[str], Optional[str]]:
    """Extract chat ID and message ID from event emitter closure."""
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
        response_field: str = Field(
            default="data", description="Field name for the response data"
        )
        emit_interval: float = Field(
            default=2.0, description="Interval in seconds between status emissions"
        )
        enable_status_indicator: bool = Field(
            default=True, description="Enable or disable status indicator emissions"
        )
        connection_timeout: float = Field(
            default=10.0, description="Connection timeout in seconds"
        )
        read_timeout: float = Field(
            default=60.0, description="Read timeout in seconds for streaming responses"
        )

    def __init__(self):
        """Initialize the Cambrian Agent Pipe."""
        self.type = "pipe"
        self.id = "cambrian_pipe"
        self.name = "Cambrian Agent Pipe"
        self.valves = self.Valves()
        self.last_emit_time = 0

    async def emit_status(
        self,
        __event_emitter__: Callable[[dict], Awaitable[None]],
        level: str,
        message: str,
        done: bool,
    ):
        """Emit status updates to the event emitter."""
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
        """Process the pipe request with Cambrian Agent."""
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
                    self.valves.cambrian_url, 
                    json=payload, 
                    headers=headers, 
                    timeout=(self.valves.connection_timeout, self.valves.read_timeout),
                    stream=True
                )
                
                if response.status_code == 200:
                    # Handle streaming response from Cambrian Agent
                    response_text = ""
                    collected_chunks = []
                    
                    try:
                        # Set a chunk timeout to avoid hanging on individual chunks
                        chunk_timeout = 5.0  # 5 seconds per chunk
                        
                        for line in response.iter_lines(decode_unicode=True, chunk_size=8192):
                            if line.strip():
                                try:
                                    # Parse each JSON chunk from the stream
                                    chunk_data = json.loads(line)
                                    if chunk_data.get('type') == 'text' and chunk_data.get('text'):
                                        collected_chunks.append(chunk_data['text'])
                                        
                                        # Emit status update for longer responses
                                        if len(collected_chunks) % 5 == 0:  # Every 5 chunks
                                            await self.emit_status(
                                                __event_emitter__, 
                                                "info", 
                                                f"Processing response... ({len(collected_chunks)} chunks)", 
                                                False
                                            )
                                except json.JSONDecodeError:
                                    # Skip malformed JSON lines
                                    continue
                        
                        # Join all chunks to form the complete response
                        if collected_chunks:
                            response_text = ''.join(collected_chunks).strip()
                        
                    except Exception as stream_error:
                        await self.emit_status(
                            __event_emitter__, 
                            "warning", 
                            "Streaming failed, trying non-streaming request...", 
                            False
                        )
                        
                        # If streaming fails, try a non-streaming request
                        try:
                            # Close the streaming response first
                            response.close()
                            
                            # Make a new non-streaming request
                            fallback_response = requests.post(
                                self.valves.cambrian_url, 
                                json=payload, 
                                headers=headers, 
                                timeout=(self.valves.connection_timeout, 30),  # Shorter timeout for non-streaming
                                stream=False
                            )
                            
                            if fallback_response.status_code == 200:
                                fallback_response.encoding = 'utf-8'
                                cambrian_response = fallback_response.json()
                                if isinstance(cambrian_response, dict):
                                    response_text = cambrian_response.get('text', 
                                        cambrian_response.get(self.valves.response_field, str(cambrian_response)))
                                else:
                                    response_text = str(cambrian_response)
                            else:
                                response_text = f"Fallback request failed: {fallback_response.status_code}"
                        except Exception as fallback_error:
                            response_text = f"Streaming error: {str(stream_error)[:100]}... Fallback error: {str(fallback_error)[:100]}"
                    
                    # Clean up and format the response
                    if response_text.strip():
                        # Preserve line breaks but clean up extra spaces
                        lines = response_text.split('\n')
                        cleaned_lines = [line.strip() for line in lines if line.strip()]
                        response_text = '\n'.join(cleaned_lines)
                        
                        # Handle common formatting issues
                        response_text = response_text.replace('\\n', '\n')  # Handle escaped newlines
                        response_text = response_text.replace('  ', ' ')    # Remove double spaces
                        
                        # Ensure proper sentence formatting for the last line
                        if response_text and not response_text.endswith(('.', '!', '?', ')', '∞', ':')):
                            response_text += '.'
                    else:
                        response_text = "The agent processed your request but returned no response."
                else:
                    raise requests.exceptions.RequestException(
                        f"Error: {response.status_code} - {response.text}"
                    )

                # Set assistant message with chain reply
                body["messages"].append({"role": "assistant", "content": response_text})
                
                await self.emit_status(__event_emitter__, "info", "Complete", True)
                return response_text
            except (requests.exceptions.RequestException, Exception) as e:
                await self.emit_status(
                    __event_emitter__,
                    "error",
                    f"Error during Cambrian execution: {str(e)}",
                    True,
                )
                return {"error": str(e)}
        # If no message is available, alert user
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