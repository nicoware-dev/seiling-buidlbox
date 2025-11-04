# Setup Commands - Copy and Paste These

## After Installing Python

**Step 1: Navigate to server directory**
```bash
cd packages/seiling-os/server
```

**Step 2: Create virtual environment**
```bash
python -m venv venv
```

**Step 3: Activate virtual environment**
```bash
# Git Bash (what you're using):
source venv/Scripts/activate

# If that doesn't work, try:
. venv/Scripts/activate
```

**Step 4: Install dependencies**
```bash
pip install -e .
```

**Step 5: Run database migrations**
```bash
python -m alembic upgrade head
```

**Step 6: Start the server**
```bash
uvicorn app.main:app --reload --port 3737
```

**Step 7: In a NEW terminal, start the UI**
```bash
cd packages/seiling-os/ui
npm install
npm run dev
```

---

## Troubleshooting

**If `python` doesn't work, try `py`:**
```bash
py -m venv venv
py -m pip install -e .
py -m alembic upgrade head
py -m uvicorn app.main:app --reload --port 3737
```

**If pip install fails:**
```bash
pip install --upgrade pip
pip install fastapi==0.115.0 uvicorn[standard]==0.30.6 pydantic==2.9.2 sqlalchemy==2.0.0 alembic==1.13.0 aiosqlite==0.19.0 httpx==0.27.0 beautifulsoup4==4.12.0 qdrant-client==1.7.0 openai==1.71.0
```

