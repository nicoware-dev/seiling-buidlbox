# Quick Start Guide

## Choose Your Setup Method

### 🐳 Method 1: Docker (Easiest - Recommended)

**Steps:**
1. Make sure Docker Desktop is running
2. Run this command from project root:
   ```bash
   docker network create seiling_network 2>/dev/null || true
   docker compose -f docker/services/docker-compose.os.yml up --build
   ```
3. Access:
   - UI: http://localhost:5174
   - API: http://localhost:3737

---

### 🐍 Method 2: Local Python (If you prefer)

**Install Python:**
1. Download: https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Restart your terminal after installation

**Setup:**
```bash
# Navigate to server directory
cd packages/seiling-os/server

# Create virtual environment
python -m venv venv

# Activate (Windows Git Bash)
source venv/Scripts/activate

# Install dependencies
pip install -e .

# Run migrations
python -m alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 3737
```

**In another terminal for UI:**
```bash
cd packages/seiling-os/ui
npm install
npm run dev
```

---

## Which method should you use?

- **Docker**: Use if Docker Desktop is installed (all dependencies included)
- **Python**: Use if you want to develop locally and modify code easily

See `LOCAL_SETUP.md` for detailed instructions.

