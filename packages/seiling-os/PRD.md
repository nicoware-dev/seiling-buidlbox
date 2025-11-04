# PRD – Seiling OS

## Summary
AI dev workspace for projects with tasks, notes, artifacts, and integrated run panel for n8n/Flowise/MCP.

## Users
- Developers building on Sei with agentic tooling

## Goals & Metrics
- 2x productivity improvement over plain editors
- Generate workflows from prompts/artifacts

## Functional Requirements (MVP)
- Tasks and notes CRUD
- Artifact management (prompts, rules)
- Run panel stubs (n8n/Flowise/MCP)

## Architecture
- UI: React SPA
- Server: FastAPI; endpoints for tasks/notes and future knowledge RAG

## Milestones
- M1: Skeleton UI + FastAPI with tasks/notes endpoints
- M2: Knowledge crawling for Sei docs
- M3: Run panel integrations

