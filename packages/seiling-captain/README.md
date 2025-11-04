# Seiling Captain

Local-first control plane UI for managing Seiling Buidlbox v2 services, environment configuration, and health monitoring.

## Overview

Seiling Captain is a complete web dashboard designed specifically for Seiling Buidlbox v2. It provides a modern, intuitive interface to manage all services in your Seiling deployment, replacing 85% of common CLI operations with a few clicks.

## Features

### ✅ Service Management
- **Auto-discovery**: Automatically finds all services from `docker/services/*.yml` files
- **Service Control**: Start, stop, and restart services with one click
- **Real-time Status**: Live updates showing service status (running/stopped/starting)
- **Health Monitoring**: Health checks with automatic updates every 30 seconds

### ✅ Environment Configuration
- **Safe Editing**: Edit `.env` variables with automatic backup before changes
- **Schema Validation**: Validates against `env-example.env` for type safety
- **Section Organization**: Variables grouped by category matching your env structure

### ✅ Logs Viewer
- **Real-time Streaming**: Follow logs with Server-Sent Events (SSE)
- **Service Selection**: Easy dropdown to switch between services
- **Export Options**: Copy to clipboard or download logs as text file

### ✅ Health Dashboard
- **Multi-layer Checks**: HTTP endpoints, container status, and database connectivity
- **Aggregated Status**: See health of all services at a glance
- **Cached Results**: Efficient 30-second caching to reduce system load

## Getting Started

### Prerequisites
- Seiling Buidlbox v2 repository
- Docker and Docker Compose installed
- Node.js 18+ installed

### Installation

```bash
# From Seiling Buidlbox v2 repo root
cd packages/seiling-captain
npm install
npm run dev

# Visit http://localhost:3001
```

### Via Bootstrap Script

Captain is automatically included in the Seiling Buidlbox v2 bootstrap process:

```bash
# Run bootstrap - Captain will be deployed automatically
./bootstrap.sh

# Captain will be available at http://localhost:3001
```

## Usage

### Service Catalog (`/services`)
- View all discovered services in a grid layout
- See real-time status and health indicators
- Start/stop/restart services with action buttons
- Toggle auto-refresh for live updates

### Environment Editor (`/env`)
- Edit environment variables organized by section
- See type hints and descriptions for each variable
- Automatic validation before saving
- Backup created automatically before changes

### Logs Viewer (`/logs`)
- Select service from dropdown
- View historical logs or enable real-time following
- Copy or download logs as needed

## API Reference

### POST /api/services
Execute service actions (start, stop, restart)

```json
{
  "action": "up" | "down" | "restart",
  "service": "n8n"
}
```

### GET /api/services
List all services with current status

### GET /api/health
Get health status for all services (cached 30s)

### GET /api/env
Get environment variables and schema

### POST /api/env
Update environment variables

```json
{
  "vars": {
    "ENABLE_N8N": "yes",
    "N8N_PORT": "5001"
  }
}
```

### GET /api/logs?service={serviceId}&lines={count}&follow={true|false}
Get service logs (supports SSE streaming)

## Security

- **Localhost-only**: All API routes enforce localhost-only access by default
- **Input Validation**: All inputs validated with Zod schemas
- **Rate Limiting**: Write operations protected (10 req/min for services, 5 req/min for env)
- **Command Validation**: Only Seiling Buidlbox v2 docker compose commands executed
- **Safe File Operations**: Automatic backups before .env modifications

For remote deployments, configure authentication and reverse proxy (Traefik/Caddy).

## Architecture

Built specifically for Seiling Buidlbox v2:
- **Next.js 14** App Router with Server Components
- **TypeScript** for type safety
- **Auto-discovery** from Seiling Buidlbox v2 compose file structure
- **Integration** with Seiling Buidlbox v2 bootstrap scripts
- **Docker Compose** integration matching Seiling deployment patterns

## Docker Integration

Captain is deployed as part of Seiling Buidlbox v2 via:
- Docker compose fragment: `docker/services/docker-compose.captain.yml`
- Controlled by `ENABLE_CAPTAIN` environment variable
- Configurable port via `CAPTAIN_PORT` (default: 3001)
- Traefik labels for reverse proxy integration

## Documentation

- **IMPLEMENTATION.md**: Detailed technical documentation
- **PRD.md**: Product requirements and specifications
- **plan.md**: Development plan and status
- **COMPLETION_SUMMARY.md**: Completion status and achievements

## Status

✅ **100% Complete** - All features implemented and production-ready

All planned features are fully functional and integrated with Seiling Buidlbox v2.

