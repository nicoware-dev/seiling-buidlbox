# Configuration Guide

> **Configure Seiling Buidlbox for your needs**

## Automatic Configuration

The bootstrap script handles configuration automatically. For most users, just run:

```bash
./bootstrap.sh
# Select "default" profile for fastest setup
```

## Manual Configuration

If you need to customize settings, edit the `.env` file after running bootstrap:

```bash
nano .env
docker compose restart
```

## Environment Variables

### Required Credentials
```bash
# AI Services (Required)
OPENAI_API_KEY=sk-proj-your_key_here

# Blockchain (Required) 
SEI_PRIVATE_KEY=0xyour_private_key_here

# Optional AI APIs
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

### Service Control
```bash
# Core Services (Enable/Disable)
ENABLE_OPENWEBUI=yes
ENABLE_N8N=yes
ENABLE_FLOWISE=yes
ENABLE_ELIZA=yes
ENABLE_CAMBRIAN=yes
ENABLE_SEI_MCP=yes

# Databases
ENABLE_POSTGRES=yes
ENABLE_REDIS=yes
ENABLE_QDRANT=yes
ENABLE_NEO4J=yes

# Infrastructure (Production Only)
ENABLE_TRAEFIK=no    # Enable for production
ENABLE_OLLAMA=no     # Requires 8GB+ RAM
```

### Port Configuration
```bash
# Default Ports (change if conflicts)
OPENWEBUI_PORT=5002
N8N_PORT=5001
FLOWISE_PORT=5003
ELIZA_PORT=5005
CAMBRIAN_AGENT_PORT=5006
MCP_SERVER_PORT=5004
```

## Deployment Profiles

### default (Recommended)
- All services except Traefik and Ollama
- Uses localhost
- Default passwords
- Fastest setup

### local-dev
- Same as default
- Lightweight development setup

### remote
- Production setup with SSL
- Requires domain name
- All services enabled

### custom
- Interactive configuration
- Choose individual services
- Custom ports and passwords

## Security Settings

### Development (Default)
```bash
# Default passwords (OK for development)
POSTGRES_PASSWORD=seiling123
REDIS_PASSWORD=seiling123
FLOWISE_PASSWORD=seiling123
NEO4J_AUTH=neo4j/seiling123
```

### Production (Change These!)
```bash
# Generate strong passwords
POSTGRES_PASSWORD=your_strong_password
N8N_ENCRYPTION_KEY=your_32_char_key
WEBUI_SECRET_KEY=your_strong_secret
FLOWISE_PASSWORD=your_strong_password
```

## Domain Setup (Production Only)

For production with custom domain:

```bash
# Domain settings
BASE_DOMAIN_NAME=your-domain.com
TRAEFIK_EMAIL=admin@your-domain.com
ENABLE_TRAEFIK=yes

# Optional custom subdomains
N8N_SUBDOMAIN=n8n
OPENWEBUI_SUBDOMAIN=chat
FLOWISE_SUBDOMAIN=agents
```

## Common Configurations

### Minimal Setup (4GB RAM)
```bash
ENABLE_NEO4J=no
ENABLE_QDRANT=no
ENABLE_OLLAMA=no
```

### Full Local Setup (8GB+ RAM)
```bash
ENABLE_OLLAMA=yes
ENABLE_NEO4J=yes
ENABLE_QDRANT=yes
```

### Production Setup
```bash
ENABLE_TRAEFIK=yes
BASE_DOMAIN_NAME=your-domain.com
# Use strong passwords for all services
```

## Troubleshooting Configuration

### Reset Configuration
```bash
rm .env
./bootstrap.sh
```

### Check Configuration
```bash
# View current settings
cat .env

# Test configuration
bash scripts/bootstrap/health_check.sh quick
```

### Common Issues

**Services won't start**: Check required API keys are set
**Port conflicts**: Change ports in .env and restart
**Out of memory**: Disable heavy services (Ollama, Neo4j)

---

**Most users should use the default profile.** Only customize if you have specific requirements. 