# Seiling OS

AI dev workspace for managing projects with tasks, notes, artifacts, knowledge base (RAG), and integrated run panels for n8n/Flowise/MCP. Designed specifically for Seiling Builbox v2 and Sei blockchain development.

## Status: Full MVP Complete ✅

All core features are fully functional: tasks, notes, artifacts, knowledge base (RAG), and run panel with complete UI and backend.

## Features

### ✅ Implemented (Full MVP)
- **Tasks Management**: Full CRUD with filtering (all/active/completed)
- **Notes Management**: Full CRUD with Markdown support and preview
- **Artifacts Management**: Full CRUD with type filtering (code, config, data, etc.)
- **Knowledge Base**: RAG system with Sei docs crawling, Qdrant vector search, OpenAI embeddings
- **Run Panel**: Execute n8n workflows, Flowise agents, and MCP tools with execution history
- **Database**: SQLite persistence with Alembic migrations
- **UI**: Clean, functional interface with Tailwind CSS
- **API**: RESTful FastAPI backend with async operations

## Quick Start

### Running Locally

**Backend**:
```bash
cd packages/seiling-os/server
pip install -e .  # or install dependencies manually
python -m alembic upgrade head  # Run migrations
uvicorn app.main:app --reload --port 3737
```

**Frontend**:
```bash
cd packages/seiling-os/ui
npm install
npm run dev  # Runs on http://localhost:5174
```

### Running with Docker

```bash
# From project root
docker compose -f docker-compose.yml -f docker/services/docker-compose.os.yml up --build
```

Access:
- **UI**: http://localhost:5174
- **API**: http://localhost:3737
- **API Docs**: http://localhost:3737/docs

## Architecture

- **Backend**: FastAPI + SQLAlchemy + SQLite (async)
- **Frontend**: React + TypeScript + Tailwind CSS + React Query
- **Database**: SQLite (MVP), can upgrade to PostgreSQL
- **Ports**: UI (5174), Server (3737)

## Documentation

- **Implementation Details**: See [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- **Development Plan**: See [plan.md](./plan.md)

## Structure
- `ui/` - React SPA with TypeScript
- `server/` - FastAPI backend with SQLAlchemy
- `docker/` - Docker Compose configuration

