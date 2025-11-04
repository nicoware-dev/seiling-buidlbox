# Docker Setup Guide - Seiling Auditor

Complete containerized setup for Seiling Auditor with all services.

## Architecture

The Docker Compose setup includes:
- **PostgreSQL Database** - Persistent data storage
- **Web Application** - Next.js UI and API (port 3003)
- **Slither Container** - Static analyzer service
- **Mythril Container** - Static analyzer service

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the repository root (or pass via environment):

```env
# AI Provider (required - choose one)
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here

# SeiScan API (optional)
SEISCAN_API_URL=https://api.seiscan.app
SEISCAN_API_KEY=your-api-key
```

### 2. Start All Services

From the repository root:

```bash
docker-compose -f docker/services/docker-compose.auditor.yml up -d --build
```

This will:
- Build the web application image
- Start PostgreSQL database
- Start Slither and Mythril analyzer containers
- Run database migrations automatically
- Start the web application

### 3. Access the Application

Open your browser to: **http://localhost:3003**

### 4. Check Service Status

```bash
docker-compose -f docker/services/docker-compose.auditor.yml ps
```

You should see 4 containers running:
- `seiling-auditor-db` (PostgreSQL)
- `seiling-auditor-web` (Next.js app)
- `seiling-auditor-slither` (Slither analyzer)
- `seiling-auditor-mythril` (Mythril analyzer)

## Service Details

### Database (PostgreSQL)
- **Port**: 5433 (host) → 5432 (container)
- **User**: `seiling_auditor`
- **Password**: `seiling_auditor_password`
- **Database**: `seiling_auditor`
- **Volume**: `auditor_db_data` (persistent)

### Web Application
- **Port**: 3003
- **Auto-migrates** database on startup
- **Accesses** Docker socket for analyzer communication
- **Shares** workspace volume with analyzers

### Analyzer Containers
- **Slither**: Pre-installed Solidity versions (0.4.26 - 0.8.21)
- **Mythril**: Latest version
- **Shared Volume**: `analysis_workspace` for contract files

## Environment Variables

You can override environment variables in docker-compose or via `.env`:

```bash
# Example: Set AI key when starting
OPENAI_API_KEY=sk-xxx docker-compose -f docker/services/docker-compose.auditor.yml up -d
```

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker/services/docker-compose.auditor.yml logs -f

# Specific service
docker-compose -f docker/services/docker-compose.auditor.yml logs -f seiling-auditor-web
```

### Stop Services
```bash
docker-compose -f docker/services/docker-compose.auditor.yml down
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```bash
docker-compose -f docker/services/docker-compose.auditor.yml down -v
```

### Rebuild After Code Changes
```bash
docker-compose -f docker/services/docker-compose.auditor.yml up -d --build seiling-auditor-web
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it seiling-auditor-db psql -U seiling_auditor -d seiling_auditor

# Run Prisma migrations manually
docker exec -it seiling-auditor-web npx prisma migrate deploy

# Run Prisma Studio
docker exec -it seiling-auditor-web npx prisma studio
```

## Troubleshooting

### Database Connection Issues
- Wait for database health check (10-30 seconds on first start)
- Check logs: `docker-compose logs seiling-auditor-db`
- Verify PostgreSQL is running: `docker ps | grep seiling-auditor-db`

### Web Application Won't Start
- Check build logs: `docker-compose logs seiling-auditor-web`
- Verify Prisma Client generated: Check build output
- Ensure DATABASE_URL is correct in docker-compose

### Analyzer Containers Not Accessible
- Verify Docker socket is mounted: Check volumes in docker-compose
- Check container logs: `docker logs seiling-auditor-slither`
- Verify shared volume: `docker volume inspect services_analysis_workspace`

### Port Already in Use
- Change port mapping in docker-compose.yml:
  ```yaml
  ports:
    - "3004:3003"  # Use 3004 instead of 3003
  ```

## Production Considerations

For production deployment:

1. **Change Database Password**: Update `POSTGRES_PASSWORD` in docker-compose
2. **Use Secrets Management**: Don't hardcode API keys
3. **Add Reverse Proxy**: Use Traefik or Nginx for HTTPS
4. **Enable Logging**: Configure log aggregation
5. **Resource Limits**: Add CPU/memory limits to containers
6. **Backup Strategy**: Regular PostgreSQL backups

## Development vs Production

- **Development**: Can use SQLite locally (non-containerized)
- **Production**: Use PostgreSQL in Docker (as configured)

The Docker setup uses PostgreSQL for better production readiness, but you can still develop locally with SQLite.

