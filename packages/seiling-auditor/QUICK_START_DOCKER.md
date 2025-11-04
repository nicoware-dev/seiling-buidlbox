# Quick Start - Docker (Full Containerized Setup)

The easiest way to run Seiling Auditor with everything containerized!

## Prerequisites

- Docker Desktop installed and running
- AI API key (OpenAI or Anthropic)

## One-Command Setup

From the repository root:

```bash
# Set your AI API key (choose one)
export OPENAI_API_KEY="sk-your-key-here"
# OR
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Start everything
docker-compose -f docker/services/docker-compose.auditor.yml up -d --build
```

That's it! 🎉

## What Gets Started

- ✅ **PostgreSQL Database** - Persistent storage
- ✅ **Web Application** - UI on http://localhost:3003
- ✅ **Slither Analyzer** - Static analysis service
- ✅ **Mythril Analyzer** - Static analysis service

## Access the Application

Open: **http://localhost:3003**

## Check Status

```bash
docker-compose -f docker/services/docker-compose.auditor.yml ps
```

You should see 4 containers running.

## View Logs

```bash
# All services
docker-compose -f docker/services/docker-compose.auditor.yml logs -f

# Just the web app
docker-compose -f docker/services/docker-compose.auditor.yml logs -f seiling-auditor-web
```

## Stop Everything

```bash
docker-compose -f docker/services/docker-compose.auditor.yml down
```

## Troubleshooting

### Build Fails
- Make sure Docker Desktop is running
- Check: `docker ps` (should show running containers)

### Can't Access http://localhost:3003
- Wait a minute for initial build (first time takes 2-5 minutes)
- Check logs: `docker-compose logs seiling-auditor-web`
- Verify port isn't in use: `netstat -an | grep 3003`

### Database Migration Errors
- Check database logs: `docker-compose logs seiling-auditor-db`
- Database may need 10-30 seconds to start on first run

### Need to Rebuild After Code Changes
```bash
docker-compose -f docker/services/docker-compose.auditor.yml up -d --build seiling-auditor-web
```

## Full Documentation

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker documentation.

