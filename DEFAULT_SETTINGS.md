# Default Settings Reference

> **Default Configuration Values for Seiling Buidlbox**

## Overview

This document provides a complete reference of all default settings used in Seiling Buidlbox. The bootstrap script automatically configures these values when using the `default` profile.

## Quick Reference

### Access URLs (Default Profile)
- **OpenWebUI**: http://localhost:5002
- **n8n**: http://localhost:5001  
- **Flowise**: http://localhost:5003
- **ElizaOS**: http://localhost:5005
- **Cambrian**: http://localhost:5006
- **Sei MCP**: http://localhost:5004
- **Neo4j**: http://localhost:7474
- **Qdrant**: http://localhost:6333

### Default Credentials
- **Flowise**: admin / seiling123
- **PostgreSQL**: postgres / seiling123
- **Redis**: password: seiling123
- **Neo4j**: neo4j / seiling123

## Service Configuration

### Enabled Services (Default Profile)
```bash
ENABLE_OPENWEBUI=yes
ENABLE_N8N=yes
ENABLE_FLOWISE=yes
ENABLE_ELIZA=yes
ENABLE_CAMBRIAN=yes
ENABLE_SEI_MCP=yes
ENABLE_POSTGRES=yes
ENABLE_REDIS=yes
ENABLE_QDRANT=yes
ENABLE_NEO4J=yes
ENABLE_TRAEFIK=no      # Disabled for local development
ENABLE_OLLAMA=no       # Disabled due to high resource usage
```

### Default Ports
```bash
# User Interface Services
OPENWEBUI_PORT=5002     # Primary chat interface
N8N_PORT=5001           # Workflow automation
FLOWISE_PORT=5003       # Agent builder

# AI Agent Services  
ELIZA_PORT=5005         # ElizaOS framework
CAMBRIAN_AGENT_PORT=5006 # Cambrian agents
MCP_SERVER_PORT=5004    # Sei MCP server

# Database Services
POSTGRES_PORT=5432      # PostgreSQL database
REDIS_PORT=6379         # Redis cache
QDRANT_PORT=6333        # Vector database  
NEO4J_HTTP_PORT=7474    # Neo4j HTTP interface
NEO4J_BOLT_PORT=7687    # Neo4j Bolt protocol

# Infrastructure (when enabled)
TRAEFIK_PORT=8080       # Traefik dashboard
OLLAMA_PORT=11434       # Local LLM server
```

## Default Credentials & Security

### Required Credentials
```bash
# REQUIRED: User must provide these
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
SEI_PRIVATE_KEY=0xyour_sei_private_key_here
```

### Default Security Keys
```bash
# Default values (CHANGE FOR PRODUCTION!)
POSTGRES_PASSWORD=seiling123
REDIS_PASSWORD=seiling123
N8N_ENCRYPTION_KEY=seiling-encryption-key
N8N_USER_MANAGEMENT_JWT_SECRET=seiling-jwt-secret
WEBUI_SECRET_KEY=seiling-webui-secret
FLOWISE_PASSWORD=seiling123
FLOWISE_USERNAME=admin
NEO4J_AUTH=neo4j/seiling123
```

## Domain & Network Settings

### Local Development (Default)
```bash
PROFILE=default
BASE_DOMAIN_NAME=localhost
```

### Blockchain Configuration
```bash
RPC_URL=https://evm-rpc.sei-apis.com
```

## Database Settings

### PostgreSQL (Primary Database)
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=seiling123
POSTGRES_DB=seiling
```

### n8n Database Configuration
```bash
# SQLite (default for reliability)
DB_TYPE=sqlite
DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
DB_SQLITE_POOL_SIZE=10
DB_SQLITE_VACUUM_ON_STARTUP=true
```

### Redis Configuration
```bash
REDIS_PASSWORD=seiling123
```

## Deployment Settings

### Bootstrap Behavior
- **Timeout**: Unlimited for default profile (ensures reliability on slow connections)
- **ASCII Art**: Always displayed (except in quiet mode)
- **Auto Mode**: No user prompts, uses all defaults
- **Health Checks**: Automatic validation after deployment

### Resource Requirements
- **Minimum RAM**: 4GB
- **Minimum Storage**: 10GB
- **Docker Images**: ~4GB total download
- **Services**: 10 containers (12 with Traefik/Ollama)

## Profile Comparison

| Setting | default | local-dev | remote | full-local |
|---------|---------|-----------|--------|------------|
| Domain | localhost | localhost | custom | localhost |
| Traefik | Disabled | Disabled | Enabled | Disabled |
| Ollama | Disabled | Disabled | Optional | Enabled |
| Timeout | Unlimited | 30 min | 30 min | Unlimited |
| Prompts | None | Few | Some | Few |

## Override Instructions

### Change Ports
Edit `.env` file:
```bash
# Example: Change OpenWebUI port
OPENWEBUI_PORT=3000

# Restart services
docker compose restart
```

### Enable Optional Services
```bash
# Enable Ollama (requires 8GB+ RAM)
ENABLE_OLLAMA=yes

# Enable Traefik (requires domain)
ENABLE_TRAEFIK=yes
BASE_DOMAIN_NAME=your-domain.com
```

### Update Credentials
```bash
# Edit .env file
nano .env

# Update required fields:
OPENAI_API_KEY=sk-proj-your_actual_key
SEI_PRIVATE_KEY=0xyour_actual_private_key

# Restart affected services
docker compose restart
```

## Security Recommendations

### For Development
- Default passwords are acceptable for local development
- Use localhost domain
- Keep Traefik disabled

### For Production
**MUST CHANGE:**
```bash
# Generate strong passwords
POSTGRES_PASSWORD=your_strong_password
N8N_ENCRYPTION_KEY=your_32_char_encryption_key
WEBUI_SECRET_KEY=your_strong_secret_key
FLOWISE_PASSWORD=your_strong_password

# Set production domain
BASE_DOMAIN_NAME=your-domain.com
TRAEFIK_EMAIL=admin@your-domain.com
ENABLE_TRAEFIK=yes
```

## Troubleshooting Defaults

### Reset to Defaults
```bash
# Remove configuration and regenerate
rm .env
./bootstrap.sh
# Select "default" profile
```

### Check Current Settings
```bash
# View current .env configuration
cat .env

# Check running services
docker compose ps

# Verify service health
bash scripts/bootstrap/health_check.sh quick
```

---

**Note**: These defaults are optimized for quick local development setup. For production deployments, always update credentials and enable appropriate security settings. 