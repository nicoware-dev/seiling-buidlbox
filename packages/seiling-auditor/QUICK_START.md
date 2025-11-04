# Quick Start Guide - Seiling Auditor

Get Seiling Auditor running in minutes!

## Prerequisites

- Node.js 18+ installed
- Docker Desktop running (for static analyzers)
- npm or yarn

## Step 1: Install Dependencies

```bash
cd packages/seiling-auditor
npm install
```

## Step 2: Set Up Environment

Create a `.env` file in `packages/seiling-auditor/`:

```env
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# AI Provider (choose one - OpenAI or Anthropic)
OPENAI_API_KEY="sk-your-key-here"
# OR
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# SeiScan API (optional - has defaults)
SEISCAN_API_URL="https://api.seiscan.app"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3003"
```

**Note**: You need at least one AI API key (OpenAI or Anthropic) for the audit to work.

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

## Step 4: Start Docker Services

From the repository root, start the static analyzer containers:

```bash
docker-compose -f docker/services/docker-compose.auditor.yml up -d
```

This starts:
- `seiling-auditor-slither` - Slither static analyzer
- `seiling-auditor-mythril` - Mythril static analyzer

Verify they're running:
```bash
docker ps | grep seiling-auditor
```

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at: **http://localhost:3003**

## Step 6: Test It!

1. Open http://localhost:3003 in your browser
2. Enter a Sei contract address (EVM format: `0x...`)
3. Click "Start Audit"
4. Watch the progress as it analyzes the contract

## Troubleshooting

### Database Errors
- If you see Prisma errors, run: `npx prisma generate` and `npx prisma migrate dev`

### Docker Errors
- Make sure Docker Desktop is running
- Check containers: `docker ps -a`
- Restart containers: `docker-compose -f docker/services/docker-compose.auditor.yml restart`

### API Key Errors
- Make sure you have at least one AI API key set in `.env`
- Check the key is valid and has credits/quota

### Port Already in Use
- If port 3003 is busy, change it in `package.json` scripts or use: `PORT=3004 npm run dev`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
- Review API endpoints in the README

Happy auditing! 🔍

