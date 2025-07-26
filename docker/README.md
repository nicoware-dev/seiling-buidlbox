# Seiling Buidlbox - Docker Setup

This directory contains the Docker configuration for Seiling Buidlbox, a comprehensive no-code AI agent development toolkit for the Sei Network.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM and 20GB disk space

### One-Click Deployment

1. **Run the bootstrap script:**
   ```bash
   ./bootstrap.sh
   ```

2. **Or with automatic configuration:**
   ```bash
   ./bootstrap.sh -auto
   ```

3. **Access the platform:**
   - OpenWebUI (Primary UI): http://localhost:5002
- n8n (Workflows): http://localhost:5001
- Flowise (Agents): http://localhost:5003
   - Ollama (LLM API): http://localhost:11434

## 📁 Directory Structure

```
docker/
├── services/                   # Service-specific compose files
│   ├── docker-compose.traefik.yml    # Reverse proxy configuration
│   ├── docker-compose.openwebui.yml  # Primary UI service
│   └── [other service files]
└── README.md                  # This file
```

## 🔧 Services Overview

### Core Services
- **n8n**: Workflow automation platform
- **OpenWebUI**: Primary user interface with chat capabilities
- **Flowise**: Agent building platform
- **Ollama**: Local LLM for AI processing

### Databases
- **PostgreSQL**: Primary database for n8n and application data
- **Redis**: Caching and session management
- **Qdrant**: Vector database for AI embeddings
- **Neo4j**: Graph database for complex relationships

### Custom Agents
- **Sei MCP Server**: Blockchain integration (using `0xn1c0/sei-mcp-server`)
- **Cambrian Agent**: Multi-modal agent framework
- **Eliza Agent**: Conversational AI agent

### Infrastructure
- **Traefik**: Reverse proxy with automatic SSL

## 📦 Docker Images Used

| Service                | Docker Image                                 | Description/Notes                |
|------------------------|----------------------------------------------|----------------------------------|
| Cambrian Agent         | `0xn1c0/cambrian-agent-launcher:latest`      | Multi-modal agent framework      |
| Eliza Agent            | `0xn1c0/eliza:multi`                         | Conversational AI agent          |
| Flowise                | `flowiseai/flowise:latest`                   | Agent building platform          |
| n8n                    | `n8nio/n8n:latest`                           | Workflow automation              |
| Neo4j                  | `neo4j:5-community`                          | Graph database                   |
| Ollama                 | `ollama/ollama:latest`                       | Local LLM for AI processing      |
| OpenWebUI              | `ghcr.io/open-webui/open-webui:main`         | Primary user interface           |
| PostgreSQL             | `postgres:16-alpine`                         | Primary database                 |
| Qdrant                 | `qdrant/qdrant:latest`                       | Vector database                  |
| Redis                  | `redis:7-alpine`                             | Caching and session management   |
| Sei MCP Server         | `0xn1c0/sei-mcp-server:multi`                | Blockchain integration           |
| Traefik                | `traefik:v3.0`                               | Reverse proxy                    |

## ⚙️ Configuration

### Environment Variables

Choose between simple or full environment configuration:

**Simple Setup (Recommended for beginners):**
```bash
cp env.simple.example .env
```

**Full Setup (With all optional features):**
```bash
cp env.example .env
```

**Simple Setup Key Configuration:**
```bash
# Essential passwords (change in production)
POSTGRES_PASSWORD=your-secure-password
N8N_ENCRYPTION_KEY=your-secure-encryption-key
N8N_USER_MANAGEMENT_JWT_SECRET=your-secure-jwt-secret
WEBUI_SECRET_KEY=your-secure-webui-key
FLOWISE_PASSWORD=your-flowise-password

# Sei Network configuration
SEI_RPC_URL=https://rpc.atlantic-2.seinetwork.io
SEI_CHAIN_ID=atlantic-2
```

**Full Setup** includes additional options for:
- Cloud storage (S3, GCP)
- Advanced Ollama configuration
- Domain-specific settings
- Performance tuning
- Backup configuration

### Service Ports

Default port mappings:

| Service | Port | Description |
|---------|------|-------------|
| OpenWebUI | 3000 | Primary user interface |
| n8n | 5678 | Workflow automation |
| Flowise | 3001 | Agent building |
| Ollama | 11434 | LLM API |
| Sei MCP | 8080 | Blockchain integration |
| Cambrian | 8081 | Multi-modal agent |
| Eliza | 8082 | Conversational agent |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| Qdrant | 6333 | Vector DB |
| Neo4j | 7474 | Graph DB |

## 🛠️ Management Commands

### Using the Bootstrap Script

```bash
# Interactive setup with profiles
./bootstrap.sh

# Automatic deployment with defaults
./bootstrap.sh -auto

# Health check all services
bash scripts/bootstrap/health_check.sh

# View service logs
docker compose logs -f
```

### Using Docker Compose Directly

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart n8n

# Check service status
docker-compose ps
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **Memory issues**: Increase Docker memory allocation
3. **Service not starting**: Check logs with `docker-compose logs [service]`
4. **Database connection**: Ensure PostgreSQL is healthy before starting n8n

### Health Checks

```bash
# Check all services
bash scripts/bootstrap/health_check.sh

# Check specific service
curl http://localhost:5001/healthz  # n8n
curl http://localhost:5002/api/v1/health  # OpenWebUI
curl http://localhost:5003/api/v1/health  # Flowise
```

### Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs n8n
docker-compose logs openwebui

# Follow logs
docker-compose logs -f
```

## 🔐 Security

### Production Deployment

1. **Change default passwords** in `.env` file
2. **Use strong encryption keys** for n8n and OpenWebUI
3. **Configure SSL certificates** via Traefik
4. **Set up firewall rules** to restrict access
5. **Use environment-specific configurations**

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate secure encryption keys
- [ ] Configure SSL certificates
- [ ] Set up proper firewall rules
- [ ] Enable authentication where available
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## 📊 Monitoring

### Service Health

The deployment script includes health checks for all services. Monitor:

- Service response times
- Memory and CPU usage
- Database connections
- API endpoint availability

### Log Monitoring

Key log files to monitor:

- n8n: Workflow execution logs
- OpenWebUI: User interaction logs
- Flowise: Agent execution logs
- Ollama: LLM processing logs
- Database: Connection and query logs

## 🔄 Updates

### Updating Services

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Or restart specific service
docker-compose restart n8n
```

### Updating Custom Agents

For Cambrian and Eliza agents, rebuild the images:

```bash
# Rebuild specific service
docker-compose build cambrian-agent
docker-compose build eliza-agent

# Restart services
docker-compose up -d
```

## 📚 Additional Resources

- [Seiling Buidlbox Documentation](../docs/)
- [n8n Documentation](https://docs.n8n.io/)
- [OpenWebUI Documentation](https://docs.openwebui.com/)
- [Flowise Documentation](https://docs.flowiseai.com/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Sei Network Documentation](https://docs.sei.io/)

## 🤝 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review service logs
3. Check the main project documentation
4. Open an issue on GitHub

---

**Seiling Buidlbox** - Empowering developers to build the future of blockchain automation 