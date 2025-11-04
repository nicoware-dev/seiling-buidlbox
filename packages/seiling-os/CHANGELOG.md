# Changelog

All notable changes to Seiling OS will be documented in this file.

## [0.1.0] - 2024-01-XX

### Added - MVP Release

#### Backend
- SQLAlchemy models for Task, Note, and Artifact
- Database setup with async SQLite
- Alembic migrations configured
- TaskService with full CRUD operations
- NoteService with full CRUD operations
- FastAPI routers for tasks and notes
- CORS middleware configuration
- Database initialization on startup
- Docker configuration with volumes

#### Frontend
- API client service with TypeScript
- React Query setup and hooks
- TaskList component with filtering
- TaskForm component for create/edit
- NoteList component with search
- NoteEditor component with Markdown preview
- Main App component with tab navigation
- Tailwind CSS styling

#### Infrastructure
- Docker Compose configuration
- Server Dockerfile with migrations
- Database persistence
- Environment variable configuration

### Known Limitations
- No authentication (single-user mode)
- No real-time updates (HTTP polling only)
- SQLite for MVP (can upgrade to PostgreSQL)
- No projects hierarchy (flat task structure)
- Artifacts UI not implemented (backend ready)
- Knowledge base not implemented
- Run panel not implemented

