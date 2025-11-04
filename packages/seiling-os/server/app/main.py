"""Main FastAPI application for Seiling OS"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_db, init_db
from app.routers import artifacts, knowledge, notes, runs, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: Close database connections
    await close_db()


app = FastAPI(
    title="Seiling OS Server",
    description="AI dev workspace for managing projects with tasks, notes, and artifacts",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5174").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(artifacts.router)
app.include_router(knowledge.router)
app.include_router(runs.router)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"ok": True}

