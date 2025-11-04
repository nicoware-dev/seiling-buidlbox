FROM python:3.11-slim
WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data

# Install dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi==0.115.0 \
    uvicorn[standard]==0.30.6 \
    pydantic==2.9.2 \
    sqlalchemy==2.0.0 \
    alembic==1.13.0 \
    aiosqlite==0.19.0 \
    httpx==0.27.0 \
    beautifulsoup4==4.12.0 \
    qdrant-client==1.7.0 \
    openai==1.71.0

# Copy application code
COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

# Run migrations and start server
EXPOSE 3737
CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 3737"]

