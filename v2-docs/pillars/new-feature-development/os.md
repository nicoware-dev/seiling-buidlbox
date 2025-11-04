# Seiling OS (AI Dev Workspace)

## Vision
Project mgmt with AI agents, forked from examples.

## Overview
Tasks/notes/artifacts (prompts/rules), run panel for n8n/Flowise/MCP. Knowledge crawl for Sei docs.

## Goals
- 2x dev productivity.
- Auto-gen workflows from prompts.
- Sei knowledge RAG.

## Design
- React UI, FastAPI server.
- LangGraph for orchestration.

## Implementation Details
- **As New Package**: packages/seiling-os.
- **Docker Files**: docker-compose.os.yml.
- **Env Changes**: OS_PORT=3737.
- **Scripts**: None.
- **Modifications**: Add sei-sdk to py deps.

## Metrics/Challenges
2x productivity; mitigate scope (MVP tasks+notes).
