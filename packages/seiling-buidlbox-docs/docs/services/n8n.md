# n8n

> **Visual workflow builder with custom Sei nodes**

n8n is a powerful workflow automation tool with 500+ integrations plus custom Sei Network nodes for blockchain operations.

## Overview

- **URL**: http://localhost:5001
- **Image**: `n8nio/n8n:latest`
- **Purpose**: Workflow automation and agent orchestration
- **Status**: Always enabled

## Features

- **500+ Integrations**: APIs, databases, services
- **Custom Sei Nodes**: 5 blockchain-specific nodes
- **Visual Editor**: Drag-and-drop workflow builder
- **Scheduling**: Cron-based triggers
- **Webhooks**: HTTP endpoint triggers
- **Database Integration**: PostgreSQL, Redis, Neo4j support

## Configuration

### Basic Setup
```bash
N8N_PORT=5001
POSTGRES_PASSWORD=seiling123
```

### Optional Settings
```bash
N8N_ENCRYPTION_KEY=seiling-encryption-key
N8N_USER_MANAGEMENT_JWT_SECRET=seiling-jwt-secret
```

## Usage

### First Time Setup
1. Open http://localhost:5001
2. Create admin account
3. Explore workflow templates

### Custom Sei Nodes
Install custom Sei Network nodes:

1. **Settings** → **Community Nodes**
2. **Install Package**: `n8n-nodes-sei`
3. **Available Nodes**:
   - Sei Wallet: Balance, transactions
   - Sei Contract: Smart contract interactions
   - Sei Query: Blockchain queries
   - Sei Send: Token transfers
   - Sei Stake: Staking operations

### Import Templates
1. **Templates** → **Import**
2. Select from `resources/n8n/`
3. Configure credentials
4. Test workflow

## Available Templates

From `resources/n8n/`:
- **Sei MCP Agent Example**: Basic blockchain operations
- **Cambrian Agent Demo**: DeFi automation
- **Seiling Buidlbox Full Demo**: Complete system integration
- **Sei Multi-Agent System**: Advanced agent coordination

## Common Workflows

### API Integration
```
HTTP Trigger → Process Data → Database Store → Notification
```

### Blockchain Automation
```
Schedule → Check Wallet → Execute Trade → Log Results
```

### Agent Coordination
```
Webhook → Call AI Agent → Process Response → Action
```

## Troubleshooting

### Common Issues

**Can't access n8n**:
```bash
# Check service
docker logs seiling-n8n

# Check database connection
docker logs seiling-postgres
```

**Workflow failures**:
- Check node configurations
- Verify API credentials
- Test individual nodes
- Review execution logs

**Database errors**:
```bash
# Check PostgreSQL health
docker exec seiling-postgres pg_isready -U postgres

# Restart n8n
docker restart seiling-n8n
```

### Health Check
```bash
# n8n health endpoint
curl http://localhost:5001/healthz

# Service logs
docker logs seiling-n8n --tail=50
```

## Integration

### With Seiling Services
- **Sei MCP Server**: Blockchain operations
- **ElizaOS**: AI agent calls
- **Cambrian**: Multi-modal agents
- **PostgreSQL**: Data storage
- **OpenWebUI**: Chat triggers

### External APIs
- **OpenAI**: AI processing
- **Webhook services**: External triggers
- **Databases**: Various database systems
- **Cloud services**: AWS, Google, Azure

---

**n8n is the automation backbone.** Use it to orchestrate complex workflows and agent interactions. 