"""Database setup and session management for Seiling OS"""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.models.base import Base

# Database URL - SQLite for MVP
_database_url = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./data/seiling-os.db",
)

# Ensure data directory exists for SQLite
if _database_url.startswith("sqlite"):
    # Extract path from URL (format: sqlite+aiosqlite:///./data/seiling-os.db)
    db_path = _database_url.replace("sqlite+aiosqlite:///", "")
    if db_path.startswith("./"):
        db_path = db_path[2:]
    db_dir = Path(db_path).parent
    if db_dir != Path("."):
        db_dir.mkdir(parents=True, exist_ok=True)

DATABASE_URL = _database_url

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    future=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database - create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections"""
    await engine.dispose()

