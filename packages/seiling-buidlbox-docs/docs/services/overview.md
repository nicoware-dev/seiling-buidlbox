# Services Overview

> **12 services working together for AI agent development**

Seiling Buidlbox includes 12 services that can be individually enabled/disabled. All services run in Docker containers and communicate through a shared network.

## 🎯 Quick Navigation

**🚀 Just Getting Started?** → [Quick Start Guide](../getting-started/quick-start.md)  
**🔧 Need Configuration Help?** → [Configuration Guide](../getting-started/configuration.md)  
**📖 Want Individual Service Details?** → Click any service link below  

## Core Services

### User Interfaces
| Service | Port | Purpose | Status | Documentation |
|---------|------|---------|--------|---------------|
| [OpenWebUI](./openwebui.md) | 5002 | Primary chat interface | Always enabled | [Setup Guide](./openwebui.md) |
| [n8n](./n8n.md) | 5001 | Visual workflow builder | Always enabled | [Workflow Guide](./n8n.md) |
| [Flowise](./flowise.md) | 5003 | AI agent builder | Always enabled | [Agent Builder Guide](./flowise.md) |

### AI Frameworks  
| Service | Port | Purpose | Status | Documentation |
|---------|------|---------|--------|---------------|
| [ElizaOS](./eliza.md) | 5005 | Conversational AI framework | Enabled by default | [AI Framework Guide](./eliza.md) |
| [Cambrian](./cambrian.md) | 5006 | Multi-modal agent platform | Enabled by default | [DeFi Agent Guide](./cambrian.md) |
| [Sei MCP Server](./sei-mcp.md) | 5004 | Blockchain operations | Enabled by default | [Blockchain Tools Guide](./sei-mcp.md) |

### Databases
| Service | Port | Purpose | Status | Documentation |
|---------|------|---------|--------|---------------|
| [PostgreSQL](./postgres.md) | 5432 | Primary database | Always enabled | [Database Guide](./postgres.md) |
| [Redis](./redis.md) | 6379 | Cache and sessions | Always enabled | [Cache Guide](./redis.md) |
| [Qdrant](./qdrant.md) | 6333 | Vector database | Enabled by default | [Vector DB Guide](./qdrant.md) |
| [Neo4j](./neo4j.md) | 7474 | Graph database | Enabled by default | [Graph DB Guide](./neo4j.md) |

### Infrastructure
| Service | Port | Purpose | Status | Documentation |
|---------|------|---------|--------|---------------|
| [Traefik](./traefik.md) | 80/443 | Reverse proxy & SSL | Production only | [Proxy Guide](./traefik.md) |
| [Ollama](./ollama.md) | 11434 | Local LLM server | Disabled (heavy) | [Local LLM Guide](./ollama.md) |

## Service Control

### Enable/Disable Services
```bash
# Edit .env file
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
ENABLE_TRAEFIK=no     # Production only
ENABLE_OLLAMA=no      # Requires 8GB+ RAM

# Restart services
docker compose restart
```

> 📖 **Need help with environment variables?** → [Environment Configuration Guide](../getting-started/configuration.md)

### Service Categories

#### 🚀 **Always Enabled** (Core Infrastructure)
These services form the foundation and cannot be disabled:
- **OpenWebUI**: Primary user interface
- **n8n**: Workflow automation engine  
- **Flowise**: Visual agent builder
- **PostgreSQL**: Primary data storage
- **Redis**: Session and cache management

#### ⚡ **Enabled by Default** (AI & Blockchain)
These provide the main AI and blockchain functionality:
- **ElizaOS**: Conversational AI framework
- **Cambrian**: DeFi-focused agent platform
- **Sei MCP Server**: Blockchain integration tools
- **Qdrant**: Vector storage for AI embeddings
- **Neo4j**: Graph relationships and data

#### 🔧 **Optional Services** (Production & Advanced)
Enable these based on your specific needs:
- **Traefik**: For production deployments with SSL
- **Ollama**: For local LLM hosting (requires 8GB+ RAM)

## 🔗 Related Resources

### Getting Started Resources
- **[Quick Start Guide](../getting-started/quick-start.md)** - Deploy everything in 5 minutes
- **[Configuration Guide](../getting-started/configuration.md)** - Customize your setup
- **[User Guide](../getting-started/user-guide.md)** - Learn to use each interface

### Technical Resources  
- **[Environment Variables](../getting-started/configuration.md)** - Complete configuration reference

### Templates & Examples
- **[n8n Templates](../resources/n8n-templates.md)** - Ready-to-use workflows
- **[OpenWebUI Functions](../resources/openwebui-templates.md)** - Sample configurations
- **[Flowise Examples](../resources/flowise-templates.md)** - Sample configurations

### Support Resources
- **[External Resources](../resources/external-resources.md)** - Official documentation links

## 🎯 Service Workflows

### Typical Development Flow
```
1. Start with OpenWebUI → Test AI interactions
2. Build workflows in n8n → Automate processes  
3. Create agents in Flowise → Design conversational AI
4. Use MCP Server → Add blockchain functionality
5. Deploy with Traefik → Go to production
```

### Common Integration Patterns
- **OpenWebUI + Cambrian**: Chat interface with DeFi operations
- **n8n + Sei MCP**: Automated blockchain workflows
- **Flowise + ElizaOS**: Advanced conversational agents
- **Qdrant + Neo4j**: Hybrid vector and graph data storage

## 🔍 Quick Health Checks

```bash
# Check all service status
docker compose ps

# Test core services
curl http://localhost:5002/health    # OpenWebUI
curl http://localhost:5001/healthz   # n8n
curl http://localhost:5003/api/v1/ping  # Flowise
curl http://localhost:5004/health    # Sei MCP Server
curl http://localhost:5005/health    # ElizaOS
curl http://localhost:5006/health    # Cambrian (if available)
```

## 📊 Resource Usage

### Lightweight Setup (4GB RAM)
Enable only core services:
```bash
ENABLE_TRAEFIK=no
ENABLE_OLLAMA=no
ENABLE_NEO4J=no
```

### Standard Setup (8GB RAM)  
Default configuration with all AI features:
```bash
# All services enabled except Traefik and Ollama
```

### Production Setup (16GB+ RAM)
Full deployment with local LLM:
```bash
ENABLE_TRAEFIK=yes
ENABLE_OLLAMA=yes
```

---

**Next Steps:**
- **🚀 New User?** → [Quick Start Guide](../getting-started/quick-start.md)
- **🔧 Need Setup Help?** → [Configuration Guide](../getting-started/configuration.md)  
- **🎯 Ready to Build?** → [User Guide](../getting-started/user-guide.md)
