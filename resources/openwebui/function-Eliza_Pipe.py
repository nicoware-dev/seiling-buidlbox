"""
title: Eliza Agent Pipe (N8N Pattern)
author: Seiling Buidlbox
author_url: https://www.github.com/0xn1c0/seiling-buildbox
version: 2.1.0

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
        channel_name: str = Field(
            default="openwebui_eliza_channel",
            description="Name for the persistent channel"
        )

    def __init__(self):
        self.type = "pipe"
        self.id = "eliza_pipe_n8n"
        self.name = "Eliza Agent Pipe (N8N Pattern)"
        self.valves = self.Valves()
        self.last_emit_time = 0
        self._cached_channel_id = None
        self._cached_server_id = None
        self._cached_agent_id = None

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

    def _get_or_create_channel(self) -> tuple[str, str, str]:
        """Get existing channel or create a new one, caching the IDs"""
        
        # Step 1: Get Eliza Server
        server_response = requests.get(
            f"{self.valves.eliza_url}/api/messaging/central-servers",
            timeout=10
        )
        
        if server_response.status_code != 200:
            raise Exception(f"Failed to get server info: {server_response.text}")
        
        server_data = server_response.json()
        if not server_data.get("success") or not server_data.get("data", {}).get("servers"):
            raise Exception("No servers found in Eliza")
        
        server_id = server_data["data"]["servers"][0]["id"]
        
        # Step 2: List Agents
        agents_response = requests.get(
            f"{self.valves.eliza_url}/api/agents",
            timeout=10
        )
        
        if agents_response.status_code != 200:
            raise Exception(f"Failed to get agents: {agents_response.text}")
        
        agents_data = agents_response.json()
        if not agents_data.get("success") or not agents_data.get("data", {}).get("agents"):
            raise Exception("No agents found in Eliza")
        
        agent_id = agents_data["data"]["agents"][0]["id"]
        
        # Step 3: Try to find existing channel first
        try:
            channels_response = requests.get(
                f"{self.valves.eliza_url}/api/messaging/central-channels",
                timeout=10
            )
            
            if channels_response.status_code == 200:
                channels_data = channels_response.json()
                if channels_data.get("success") and channels_data.get("data", {}).get("channels"):
                    for channel in channels_data["data"]["channels"]:
                        if channel.get("name") == self.valves.channel_name:
                            # Check if agent is already in this channel
                            channel_agents_response = requests.get(
                                f"{self.valves.eliza_url}/api/messaging/central-channels/{channel['id']}/agents",
                                timeout=10
                            )
                            if channel_agents_response.status_code == 200:
                                channel_agents = channel_agents_response.json()
                                if (channel_agents.get("success") and 
                                    any(agent.get("id") == agent_id for agent in channel_agents.get("data", {}).get("agents", []))):
                                    return channel['id'], server_id, agent_id
        except Exception:
            pass  # Continue to create new channel if lookup fails
        
        # Step 4: Create new channel if none exists
        create_channel_payload = {
            "name": self.valves.channel_name,
            "serverId": server_id,
            "description": "OpenWebUI chat channel",
            "type": "text"
        }
        
        channel_response = requests.post(
            f"{self.valves.eliza_url}/api/messaging/channels",
            json=create_channel_payload,
            timeout=10
        )
        
        if channel_response.status_code not in [200, 201]:
            raise Exception(f"Failed to create channel: {channel_response.text}")
        
        channel_data = channel_response.json()
        channel_id = channel_data["data"]["channel"]["id"]
        
        # Step 5: Add Agent to Channel
        add_agent_payload = {
            "agentId": agent_id
        }
        
        add_agent_response = requests.post(
            f"{self.valves.eliza_url}/api/messaging/central-channels/{channel_id}/agents",
            json=add_agent_payload,
            timeout=10
        )
        
        if add_agent_response.status_code not in [200, 201]:
            raise Exception(f"Failed to add agent to channel: {add_agent_response.text}")
        
        return channel_id, server_id, agent_id

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
            # Get or create channel (cached for efficiency)
            if not all([self._cached_channel_id, self._cached_server_id, self._cached_agent_id]):
                await self.emit_status(__event_emitter__, "info", "Setting up communication channel...", False)
                self._cached_channel_id, self._cached_server_id, self._cached_agent_id = self._get_or_create_channel()
            else:
                await self.emit_status(__event_emitter__, "info", "Using existing communication channel...", False)
            
            channel_id = self._cached_channel_id
            server_id = self._cached_server_id
            agent_id = self._cached_agent_id
            
            # Send Message (EXACT N8N payload structure)
            await self.emit_status(__event_emitter__, "info", "Sending message to agent...", False)
            
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
            
            # Get the message ID from the send response to track our specific message
            send_data = send_response.json()
            # Try different possible fields for message ID
            sent_message_id = None
            if send_data.get("success"):
                data = send_data.get("data", {})
                sent_message_id = (data.get("message_id") or 
                                 data.get("messageId") or 
                                 data.get("id") or
                                 data.get("channelId"))  # Sometimes the response structure varies
            
            # Wait longer and try multiple endpoints to find agent responses
            # Since agent responses might take time to appear in the channel
            time.sleep(self.valves.wait_time + 5)  # Wait longer initially
            
            # Try alternative endpoints to get messages
            possible_endpoints = [
                f"{self.valves.eliza_url}/api/messaging/central-channels/{channel_id}/messages",
                f"{self.valves.eliza_url}/api/messaging/channels/{channel_id}/messages",
                f"{self.valves.eliza_url}/api/agents/{agent_id}/messages"
            ]
            
            agent_found = False
            final_response = None
            
            for endpoint in possible_endpoints:
                try:
                    check_response = requests.get(endpoint, timeout=10)
                    
                    if check_response.status_code == 200:
                        check_data = check_response.json()
                        if (check_data.get("success") and 
                            check_data.get("data", {}).get("messages")):
                            
                            check_messages = check_data["data"]["messages"]
                            # Look for any agent responses
                            agent_responses = [
                                msg for msg in check_messages
                                if (msg.get("source_type") == "agent_response" or
                                    msg.get("author_id") == agent_id or
                                    (msg.get("content", "") and 
                                     msg.get("content", "") != user_content and
                                     len(msg.get("content", "")) > 10))
                            ]
                            
                            if agent_responses:
                                agent_found = True
                                final_response = check_data
                                break
                                
                except Exception as e:
                    continue  # Try next endpoint
            
            # Use the response we found from trying multiple endpoints
            if final_response:
                response_data = final_response
            else:
                # Fallback to original endpoint
                response_response = requests.get(
                    f"{self.valves.eliza_url}/api/messaging/central-channels/{channel_id}/messages",
                    timeout=10
                )
                
                if response_response.status_code != 200:
                    return {"error": f"Failed to get response: {response_response.text}"}
                
                response_data = response_response.json()
            
            # Extract ALL agent responses
            if (response_data.get("success") and 
                response_data.get("data", {}).get("messages") and 
                len(response_data["data"]["messages"]) > 0):
                
                messages = response_data["data"]["messages"]
                
                # Debug: Let's see what messages we actually have
                debug_info = f"DEBUG: sent_message_id='{sent_message_id}'. Messages found:\n"
                for i, msg in enumerate(messages):
                    debug_info += f"  {i+1}. source_type='{msg.get('source_type')}', "
                    debug_info += f"author_id='{msg.get('author_id')}', "
                    debug_info += f"in_reply_to='{msg.get('in_reply_to_message_id')}', "
                    debug_info += f"content_preview='{msg.get('content', '')[:30]}...'\n"
                
                # Since metadata is missing, detect agent responses by content pattern
                all_agent_messages = []
                
                for msg in messages:
                    content = msg.get("content", "").strip()
                    
                    # Skip user input messages (they contain our exact input)
                    if content == user_content.strip():
                        continue
                    
                    # Detect agent responses by content patterns
                    is_likely_agent_response = (
                        content and
                        len(content) > 10 and
                        # Look for typical agent response patterns
                        (content.startswith('I\'ll') or
                         content.startswith('I will') or
                         content.startswith('Sure') or
                         '✅' in content or
                         'Successfully' in content or
                         'Transaction:' in content or
                         'transferred' in content.lower() or
                         content.startswith('{') and 'follow_ups' in content)
                    )
                    
                    if is_likely_agent_response:
                        all_agent_messages.append(msg)
                
                # Sort by timestamp to ensure proper chronological order (oldest first)
                if all_agent_messages:
                    # Sort by createdAt or updatedAt timestamp
                    all_agent_messages.sort(key=lambda x: x.get("createdAt", x.get("updatedAt", "")))
                
                if all_agent_messages:
                    # Combine all agent responses like a normal chatbot
                    all_responses = []
                    
                    for msg in all_agent_messages:
                        content = msg.get("content", "").strip()
                        
                        # Skip empty messages
                        if not content:
                            continue
                        
                        # Parse each response and add to the list
                        parsed_content = self._parse_agent_response(content)
                        if parsed_content and parsed_content.strip():
                            all_responses.append(parsed_content)
                    
                    # Join all responses with double newlines for readability
                    if all_responses:
                        agent_response = "\n\n".join(all_responses)
                    else:
                        agent_response = "No valid agent responses found"
                else:
                    # Include detailed debug information
                    agent_response = f"No agent response found in channel. {debug_info}"
                
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
            # Clear cache on error to force refresh
            self._cached_channel_id = None
            self._cached_server_id = None
            self._cached_agent_id = None
            return {"error": error_msg}

    def _parse_agent_response(self, raw_content: str) -> str:
        """Parse the agent response content, handling both JSON and plain text formats"""
        try:
            # Clean up the content first - remove system prompts and unwanted content
            cleaned_content = self._clean_agent_response(raw_content)
            
            # Try to parse as JSON first
            if cleaned_content.startswith('{') and cleaned_content.endswith('}'):
                parsed = json.loads(cleaned_content)
                
                # Extract text from various possible JSON structures
                if isinstance(parsed, dict):
                    # Look for text field first
                    if 'text' in parsed:
                        return parsed['text']
                    
                    # Look for content field
                    if 'content' in parsed:
                        return parsed['content']
                    
                    # Look for message field
                    if 'message' in parsed:
                        return parsed['message']
                    
                    # Look for response field
                    if 'response' in parsed:
                        return parsed['response']
                    
                    # If it has follow_ups, create a nice response
                    if 'follow_ups' in parsed and isinstance(parsed['follow_ups'], list):
                        follow_ups = parsed['follow_ups']
                        if follow_ups:
                            response = "Here are some follow-up suggestions:\n\n"
                            for i, follow_up in enumerate(follow_ups, 1):
                                response += f"{i}. {follow_up}\n"
                            return response
                    
                    # If it has thought, use that
                    if 'thought' in parsed:
                        return parsed['thought']
                    
                    # Fallback: return the raw JSON as a string
                    return str(parsed)
            
            # If not JSON or parsing failed, return cleaned content
            return cleaned_content
            
        except (json.JSONDecodeError, Exception):
            # If JSON parsing fails, return cleaned content
            return self._clean_agent_response(raw_content)

    def _clean_agent_response(self, content: str) -> str:
        """Clean agent response by removing system prompts and unwanted content"""
        if not content:
            return content
        
        # Split content into lines for processing
        lines = content.split('\n')
        cleaned_lines = []
        skip_rest = False
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines at the start
            if not line and not cleaned_lines:
                continue
                
            # Stop processing if we hit system prompt markers
            if any(marker in line.lower() for marker in [
                '### task:', '### guidelines:', '### output:', '### chat history:',
                '<chat_history>', 'json format:', 'response must be', 'suggest 3-5 relevant'
            ]):
                skip_rest = True
                break
                
            # Skip lines that look like system instructions
            if any(instruction in line.lower() for instruction in [
                'write all follow-up questions', 'make questions concise',
                'only suggest follow-ups', 'use the conversation', 'default to english'
            ]):
                continue
                
            # If we haven't hit a stop marker, keep the line
            if not skip_rest:
                cleaned_lines.append(line)
        
        # Join back and clean up
        cleaned = '\n'.join(cleaned_lines).strip()
        
        # Remove any trailing system content that might have been missed
        if 'Here are some follow-up suggestions:' in cleaned:
            # Find the actual suggestions part and extract just that
            parts = cleaned.split('Here are some follow-up suggestions:')
            if len(parts) > 1:
                # Keep everything before the follow-up suggestions
                main_response = parts[0].strip()
                if main_response:
                    return main_response
        
        return cleaned

 