# Seiling OS Implementation Documentation

## Overview

Seiling OS is an AI dev workspace for managing projects with tasks, notes, artifacts, knowledge base (RAG), and integrated run panels. Designed specifically for Seiling Builbox v2 and Sei blockchain development. This document describes what has been implemented and how the system works.

## Implementation Status: Full MVP Complete ✅

### Completed Features

#### Backend Implementation

**Database Layer**
- **SQLAlchemy Models**: Implemented Task, Note, Artifact, Knowledge, and Execution models
  - `server/app/models/base.py`: Base model with common fields (id, created_at, updated_at)
  - `server/app/models/task.py`: Task model (id, title, description, done)
  - `server/app/models/note.py`: Note model (id, title, body)
  - `server/app/models/artifact.py`: Artifact model (id, name, type, content)
  - `server/app/models/knowledge.py`: KnowledgeSource and KnowledgeChunk models for RAG
  - `server/app/models/execution.py`: Execution model for run panel history

- **Database Setup**: SQLite database with async SQLAlchemy
  - `server/app/database.py`: Database configuration, session management, connection pooling
  - Automatic data directory creation for SQLite persistence
  - Async session factory for FastAPI dependency injection

- **Migrations**: Alembic setup for database versioning
  - `server/alembic.ini`: Alembic configuration
  - `server/alembic/env.py`: Async migration environment
  - `server/alembic/versions/001_initial_migration.py`: Initial migration creating tasks, notes, artifacts tables
  - `server/alembic/versions/002_add_knowledge_and_execution.py`: Migration for knowledge base and execution tables

**Service Layer**
- `server/app/services/task_service.py`: TaskService with full CRUD operations
- `server/app/services/note_service.py`: NoteService with full CRUD operations
- `server/app/services/artifact_service.py`: ArtifactService with full CRUD operations
- `server/app/services/knowledge_crawler.py`: KnowledgeCrawlerService for crawling Sei docs
- `server/app/services/qdrant_client.py`: QdrantService for vector storage
- `server/app/services/rag_service.py`: RAGService for knowledge search with embeddings
- `server/app/services/run_service.py`: RunService for n8n/Flowise/MCP execution

**API Layer**
- `server/app/routers/tasks.py`: FastAPI router for tasks CRUD
- `server/app/routers/notes.py`: FastAPI router for notes CRUD
- `server/app/routers/artifacts.py`: FastAPI router for artifacts CRUD
- `server/app/routers/knowledge.py`: FastAPI router for knowledge base (crawl, search, index)
- `server/app/routers/runs.py`: FastAPI router for run panel (n8n/Flowise/MCP execution)

**Main Application**
- `server/app/main.py`: FastAPI application setup
  - CORS middleware configured for frontend communication
  - Database initialization on startup
  - All routers registered
  - Health check endpoint

#### Frontend Implementation

**API Client**
- `ui/src/services/api.ts`: Type-safe API client with all endpoints

**React Query Setup**
- `ui/src/main.tsx`: React Query client configuration

**Hooks**
- `ui/src/hooks/useTasks.ts`: React Query hooks for tasks
- `ui/src/hooks/useNotes.ts`: React Query hooks for notes
- `ui/src/hooks/useArtifacts.ts`: React Query hooks for artifacts
- `ui/src/hooks/useArtifacts.ts`: React Query hooks (knowledge and runs use API client directly)

**UI Components**
- `ui/src/components/TaskList.tsx`: Task list with filtering
- `ui/src/components/TaskForm.tsx`: Task creation/editing form
- `ui/src/components/NoteList.tsx`: Note list with search
- `ui/src/components/NoteEditor.tsx`: Markdown note editor with preview
- `ui/src/components/ArtifactList.tsx`: Artifact list with type filtering
- `ui/src/components/ArtifactViewer.tsx`: Artifact viewer/editor
- `ui/src/components/KnowledgeSearch.tsx`: Knowledge base search and crawler UI
- `ui/src/components/RunPanel.tsx`: Run panel for n8n/Flowise/MCP execution

**Main App**
- `ui/src/App.tsx`: Main application with tab navigation (Tasks/Notes/Artifacts/Knowledge/Runs)

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │  FastAPI Server  │    │   Qdrant Vector │
│   Port 5174     │◄──►│   Port 3737      │◄──►│   Port 6333     │
│                 │    │                 │    │                 │
│  React Query    │    │  SQLAlchemy     │    │   Embeddings    │
│  Tailwind CSS   │    │  Async SQLite   │    │   Storage        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   SQLite DB      │
                        │   ./data/        │
                        │   seiling-os.db  │
                        └─────────────────┘
```

## How Features Work

### Knowledge Base / RAG

1. **Crawling Sei Docs**:
   - User provides Sei docs URL (https://docs.sei.io)
   - KnowledgeCrawlerService crawls pages and extracts content
   - Content is chunked and stored in database
   - Chunks can be indexed in Qdrant for vector search

2. **RAG Search**:
   - User queries knowledge base
   - Query is embedded using OpenAI API
   - Qdrant performs vector similarity search
   - Results are combined with database chunks
   - Relevant documentation chunks are returned

### Run Panel

1. **Executing Workflows**:
   - User selects execution type (n8n/Flowise/MCP)
   - Provides workflow/agent/tool ID and input data
   - RunService executes via REST API
   - Execution record is created in database
   - Results are stored and displayed

2. **Execution History**:
   - All executions are stored with status
   - History can be filtered by execution type
   - Input/output data is preserved for debugging

## Configuration

### Environment Variables

**Server**:
- `DATABASE_URL`: Database connection string
- `CORS_ORIGINS`: Allowed CORS origins
- `QDRANT_URL`: Qdrant vector database URL
- `OPENAI_API_KEY`: OpenAI API key for embeddings
- `N8N_URL`: n8n service URL
- `FLOWISE_URL`: Flowise service URL
- `MCP_SERVER_URL`: MCP server URL

## Known Limitations

1. **No Authentication**: MVP has no user authentication (single-user mode)
2. **No Real-time Updates**: Using HTTP polling (React Query refetch) instead of WebSockets
3. **SQLite for MVP**: Can upgrade to PostgreSQL later for better concurrency
4. **No Projects Hierarchy**: Tasks are flat (no project/feature organization yet)

## Next Steps

See `plan.md` for detailed roadmap of future enhancements.
