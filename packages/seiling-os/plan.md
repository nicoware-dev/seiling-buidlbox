# Seiling OS - AI Agent Development Plan

## Package Overview
Seiling OS is an AI dev workspace for managing projects with tasks, notes, artifacts, knowledge base (RAG), and integrated run panels for n8n/Flowise/MCP. Designed specifically for Seiling Builbox v2 and Sei blockchain development.

**Stack**: 
- Frontend: React, Vite, TypeScript
- Backend: FastAPI (Python)
- Database: SQLite (MVP), PostgreSQL (future)
- Vector DB: Qdrant for RAG
- Ports: UI (5174), Server (3737)

## Current State

### ✅ Completed (MVP Phase 1 & 2)
- **Backend**:
  - ✅ SQLAlchemy models (Task, Note, Artifact) with proper schema
  - ✅ Database setup with SQLite persistence
  - ✅ Alembic migrations configured and initial migration created
  - ✅ TaskService with full CRUD operations
  - ✅ NoteService with full CRUD operations
  - ✅ FastAPI routers for tasks and notes (all endpoints working)
  - ✅ CORS middleware configured
  - ✅ Database initialization on startup
  - ✅ Docker configuration with volumes and networking

- **Frontend**:
  - ✅ API client service with TypeScript types
  - ✅ React Query setup and configuration
  - ✅ TaskList component with filtering (all/active/completed)
  - ✅ TaskForm component for create/edit
  - ✅ NoteList component with search
  - ✅ NoteEditor component with Markdown preview
  - ✅ Main App component with tab navigation
  - ✅ Tailwind CSS styling configured
  - ✅ React Query hooks for tasks (useTasks, useCreateTask, etc.)
  - ✅ React Query hooks for notes (useNotes, useCreateNote, etc.)

- **Infrastructure**:
  - ✅ Docker Compose configuration with volumes
  - ✅ Server Dockerfile with migrations
  - ✅ Database persistence working
  - ✅ Environment variables configured

### 🚧 Partially Done
- Artifacts management: Backend model exists, UI not implemented

### ❌ Not Started (Future Phases)
- Knowledge base/RAG (Sei docs crawling)
- Run panel for n8n/Flowise/MCP
- Authentication (if needed)
- Projects hierarchy (tasks are currently flat)
- Real-time updates (WebSockets/Socket.IO)

## Architecture Details

**Frontend Components**:
- Component-based React architecture
- Tab-based navigation for organized feature access
- Reusable UI components with Tailwind CSS
- React Query for efficient data fetching and caching

**Backend Services**:
- FastAPI with async/await for high performance
- Service layer pattern for business logic separation
- RESTful API design
- Database abstraction with SQLAlchemy ORM

**Database**:
- SQLite for MVP (lightweight, zero-config)
- PostgreSQL support ready for scaling
- Alembic migrations for schema versioning

**Integration Points**:
- Qdrant vector database for RAG/knowledge search
- OpenAI API for embeddings
- n8n/Flowise/MCP for workflow automation
- Docker-based deployment

## Architecture

```
packages/seiling-os/
├── ui/
│   ├── src/
│   │   ├── main.tsx (✅ React Query setup)
│   │   ├── App.tsx (✅ Main app with tabs)
│   │   ├── config.ts (✅ API configuration)
│   │   ├── components/
│   │   │   ├── TaskList.tsx (✅ Complete)
│   │   │   ├── TaskForm.tsx (✅ Complete)
│   │   │   ├── NoteList.tsx (✅ Complete)
│   │   │   ├── NoteEditor.tsx (✅ Complete)
│   │   │   └── ArtifactViewer.tsx (❌ TODO)
│   │   ├── hooks/
│   │   │   ├── useTasks.ts (✅ Complete)
│   │   │   └── useNotes.ts (✅ Complete)
│   │   └── services/
│   │       └── api.ts (✅ Complete)
│   ├── package.json (✅ All deps added)
│   ├── tailwind.config.js (✅ Configured)
│   └── postcss.config.js (✅ Configured)
├── server/
│   ├── app/
│   │   ├── main.py (✅ Complete with CORS, routers)
│   │   ├── database.py (✅ Complete with async SQLite)
│   │   ├── models/
│   │   │   ├── base.py (✅ Complete)
│   │   │   ├── task.py (✅ Complete)
│   │   │   ├── note.py (✅ Complete)
│   │   │   └── artifact.py (✅ Model ready)
│   │   ├── routers/
│   │   │   ├── tasks.py (✅ Complete CRUD)
│   │   │   ├── notes.py (✅ Complete CRUD)
│   │   │   ├── artifacts.py (❌ TODO)
│   │   │   └── knowledge.py (❌ TODO)
│   │   └── services/
│   │       ├── task_service.py (✅ Complete)
│   │       ├── note_service.py (✅ Complete)
│   │       ├── knowledge_crawler.py (❌ TODO: Sei docs)
│   │       └── rag.py (❌ TODO)
│   ├── alembic/
│   │   ├── env.py (✅ Complete)
│   │   ├── versions/
│   │   │   └── 001_initial_migration.py (✅ Complete)
│   │   └── script.py.mako (✅ Template)
│   ├── alembic.ini (✅ Configured)
│   ├── pyproject.toml (✅ All deps added)
│   └── Dockerfile (✅ Updated with migrations)
└── docker/services/docker-compose.os.yml (✅ Complete with volumes)
```

## Core Features to Build

### 1. Tasks Management (MVP)
- **Custom implementation** for Sei development workflow
- **Frontend**:
  - Task list view with filters (all/active/completed)
  - Task creation form
  - Task editing (mark done, edit title/description)
  - Task deletion
- **Backend**:
  - CRUD endpoints for tasks
  - Task persistence (PostgreSQL or SQLite for MVP)
  - Task status tracking

### 2. Notes Management (MVP)
- **Custom implementation** with Markdown support
- **Frontend**:
  - Note list/sidebar
  - Rich text editor (Markdown support)
  - Note search
- **Backend**:
  - CRUD endpoints for notes
  - Markdown parsing/storage
  - Note linking/tags

### 3. Artifacts Management
- **Custom implementation** for code snippets and files
- **Features**:
  - Store prompts, rules, context files
  - Organize by project/workspace
  - Versioning (basic)
  - Export/import artifacts

### 4. Knowledge Base / RAG (Phase 2)
- **Custom implementation** with Qdrant vector search and OpenAI embeddings
- **Features**:
  - Crawl Sei documentation (docs.sei.io)
  - Index documentation in vector DB
  - RAG queries for Sei-specific questions
  - Integration with tasks/notes (suggestions)

### 5. Run Panel (Phase 2)
- **Features**:
  - Launch n8n workflows
  - Trigger Flowise agents
  - Call MCP tools
  - View execution results
  - Integration with tasks (link runs to tasks)

### 6. Database Setup
- **Alembic migrations** for database schema management
- **Setup**:
  - PostgreSQL (or SQLite for MVP)
  - SQLAlchemy models
  - Alembic migrations
  - Seed data (if needed)

## API Specifications

### Tasks API
```python
# GET /api/tasks
Response: List[Task]

# POST /api/tasks
Request: { title: str, description?: str, done?: bool }
Response: Task

# PUT /api/tasks/{id}
Request: { title?: str, description?: str, done?: bool }
Response: Task

# DELETE /api/tasks/{id}
Response: { ok: bool }
```

### Notes API
```python
# GET /api/notes
Response: List[Note]

# POST /api/notes
Request: { title: str, body: str }
Response: Note

# PUT /api/notes/{id}
Request: { title?: str, body?: str }
Response: Note

# DELETE /api/notes/{id}
Response: { ok: bool }
```

### Artifacts API
```python
# GET /api/artifacts
Response: List[Artifact]

# POST /api/artifacts
Request: { name: str, type: str, content: str }
Response: Artifact
```

## Integration Points

- **Database**: PostgreSQL (preferred) or SQLite (MVP)
- **Vector DB**: Qdrant (for RAG) - if available in Seiling stack
- **n8n**: REST API for workflow execution
- **Flowise**: REST API for agent execution
- **MCP**: Via MCP server client
- **Sei Docs**: Web scraping/crawling for knowledge base

## Step-by-Step Development Tasks

### Phase 1: Database & Backend (Week 1) ✅ COMPLETE
1. ✅ Set up SQLAlchemy models (Task, Note, Artifact)
2. ✅ Create Alembic migration setup
3. ✅ Implement task CRUD endpoints
4. ✅ Implement note CRUD endpoints
5. ✅ Add database connection management

### Phase 2: Frontend UI - Tasks & Notes (Week 2) ✅ COMPLETE
6. ✅ Build UI components with Tailwind CSS
7. ✅ Build TaskList and TaskForm components
8. ✅ Build NoteList and NoteEditor components
9. ✅ Integrate with backend API
10. ✅ Add styling with Tailwind CSS

### Phase 3: Artifacts (Week 3)
11. ✅ Implement artifact models (model exists in `server/app/models/artifact.py`)
12. ❌ Implement artifact endpoints (router and service pending)
13. ❌ Build artifact viewer/editor UI
14. ❌ Add artifact organization (folders/tags)
15. ❌ Add export/import functionality
16. ❌ Integrate with tasks/notes

### Phase 4: Knowledge Base (Week 4)
17. ✅ Implement knowledge crawler for Sei docs
18. Adapt for Sei docs (docs.sei.io)
19. Set up vector DB integration (Qdrant)
20. Implement RAG query endpoint
21. Build knowledge search UI

### Phase 5: Run Panel (Future)
22. Integrate n8n API client
23. Integrate Flowise API client
24. Build run panel UI
25. Add execution history
26. Link runs to tasks

## Success Criteria

- [x] Tasks and notes fully functional (CRUD) ✅ MVP COMPLETE
- [ ] Artifacts can be stored and organized (backend ready, UI pending)
- [ ] Knowledge base crawls Sei docs and answers questions
- [ ] Run panel can execute n8n/Flowise/MCP tools
- [x] UI is clean and functional ✅
- [x] Database persists all data ✅ SQLite with migrations

## Notes for AI Agent

- **Architecture**: Component-based React frontend with FastAPI backend
- ✅ MVP (tasks/notes) COMPLETE - foundation is ready
- ✅ FastAPI async patterns implemented
- ✅ React Query for state management (better than context for API data)
- ✅ SQLite working for MVP; can upgrade to PostgreSQL later
- ✅ UI styled with Tailwind CSS
- ⏭️ Next: Focus on Sei-specific adaptations (knowledge base should prioritize Sei docs)
- ⏭️ Use existing Qdrant from Seiling stack if available
- ⏭️ Keep run panel simple initially (REST API calls)

## Pending Tasks & Future Considerations

### High Priority (Next Phase)

1. **Artifacts UI Implementation**
   - Backend model exists, need to implement:
     - `server/app/routers/artifacts.py`: CRUD endpoints
     - `server/app/services/artifact_service.py`: Service layer
     - `ui/src/hooks/useArtifacts.ts`: React Query hooks
     - `ui/src/components/ArtifactViewer.tsx`: UI component
     - Add artifacts tab to main App component

2. **Error Handling & Validation**
   - Add comprehensive error handling in API client
   - Add user-friendly error messages in UI
   - Add form validation feedback
   - Add loading states for better UX

3. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - Frontend component tests
   - E2E tests for critical flows

### Medium Priority (Phase 4)

4. **Knowledge Base / RAG**
   - ✅ Knowledge crawler for Sei docs implemented
   - Adapt for Sei docs (docs.sei.io)
   - Set up Qdrant integration (available in Seiling stack)
   - Implement RAG query endpoint
   - Build knowledge search UI
   - Integrate with tasks/notes (suggestions)

5. **Run Panel**
   - Integrate n8n REST API client
   - Integrate Flowise API client
   - Build run panel UI
   - Add execution history
   - Link runs to tasks

### Low Priority (Future Enhancements)

6. **Projects Hierarchy**
   - Add projects model and relationships
   - Organize tasks under projects
   - Project management UI

7. **Real-time Updates**
   - Implement Socket.IO or WebSocket
   - Replace HTTP polling with real-time updates
   - Show live updates when tasks/notes change

8. **Authentication & Multi-user**
   - Add user model and authentication
   - Implement JWT or session-based auth
   - Multi-user support with permissions

9. **PostgreSQL Migration**
   - Migrate from SQLite to PostgreSQL
   - Update database configuration
   - Update Docker setup

10. **Advanced Features**
    - Task priorities and tags
    - Note linking and references
    - Export/import functionality
    - Search across all content
    - Markdown attachments/images
    - Version history for notes

## Dependencies to Add

### Backend (server/pyproject.toml)
```toml
[project]
dependencies = [
  "fastapi==0.115.0",
  "uvicorn[standard]==0.30.6",
  "sqlalchemy==2.0.0",
  "alembic==1.13.0",
  "psycopg2-binary==2.9.9", # or sqlite for MVP
  "pydantic==2.9.2",
  "httpx==0.27.0", # For n8n/Flowise/MCP APIs
]
```

### Frontend (ui/package.json)
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0", // For note editing
    "axios": "^1.6.0" // For API calls
  }
}
```

