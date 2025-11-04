# Local Development Setup Guide

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Start Docker Desktop** (if not already running)

2. **Create the network** (if it doesn't exist):
   ```bash
   docker network create seiling_network
   ```

3. **Start the services**:
   ```bash
   # From project root
   docker compose -f docker/services/docker-compose.os.yml up --build
   ```

4. **Access the application**:
   - UI: http://localhost:5174
   - API: http://localhost:3737
   - API Docs: http://localhost:3737/docs

### Stop services:
```bash
docker compose -f docker/services/docker-compose.os.yml down
```

---

## Option 2: Local Python Setup

### Prerequisites
- Python 3.10 or higher
- pip (comes with Python)

### Steps

1. **Install Python** (if not installed):
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation
   - Verify installation:
     ```bash
     python --version
     pip --version
     ```

2. **Navigate to server directory**:
   ```bash
   cd packages/seiling-os/server
   ```

3. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   ```

4. **Activate the virtual environment**:
   - **Windows (Git Bash/PowerShell)**:
     ```bash
     source venv/Scripts/activate
     ```
   - **Windows (CMD)**:
     ```bash
     venv\Scripts\activate
     ```

5. **Install dependencies**:
   ```bash
   pip install -e .
   ```
   Or install manually:
   ```bash
   pip install fastapi==0.115.0 uvicorn[standard]==0.30.6 pydantic==2.9.2 sqlalchemy==2.0.0 alembic==1.13.0 aiosqlite==0.19.0 httpx==0.27.0 beautifulsoup4==4.12.0 qdrant-client==1.7.0 openai==1.71.0
   ```

6. **Run database migrations**:
   ```bash
   python -m alembic upgrade head
   ```

7. **Start the server**:
   ```bash
   uvicorn app.main:app --reload --port 3737
   ```

8. **In a separate terminal, start the UI**:
   ```bash
   cd packages/seiling-os/ui
   npm install
   npm run dev
   ```

### Access the application:
- UI: http://localhost:5174
- API: http://localhost:3737
- API Docs: http://localhost:3737/docs

### Note on Qdrant (Knowledge Base):
If you want to use the knowledge base/RAG features, you'll need Qdrant running. You can:
- Use Docker: `docker run -p 6333:6333 qdrant/qdrant`
- Or set `QDRANT_URL` environment variable to point to your Qdrant instance

### Note on OpenAI (RAG):
For knowledge base search, you'll need an OpenAI API key:
```bash
export OPENAI_API_KEY=your-api-key-here
```

