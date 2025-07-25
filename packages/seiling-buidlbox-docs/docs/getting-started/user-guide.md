# User Guide

> **How to Use Seiling Buidlbox**

This guide walks you through using each service in Seiling Buidlbox to build AI agents and automate blockchain operations.

## 🎯 Quick Navigation

**🚀 New to Seiling Buidlbox?** → [Introduction](../intro.md) | [Quick Start](../getting-started/quick-start.md)  
**🔧 Need Setup Help?** → [Configuration Guide](../getting-started/configuration.md)  
**📋 Service Reference?** → [Services Overview](../services/overview.md)  
**🛠️ Looking for Templates?** → [n8n Templates](../resources/n8n-templates.md)

## Getting Started

After running `./bootstrap.sh`, access these main interfaces:

### 🖥️ Primary Interfaces

| Interface | URL | Purpose | Documentation |
|-----------|-----|---------|---------------|
| **[OpenWebUI](../services/openwebui.md)** | http://localhost:5002 | Primary chat interface | [OpenWebUI Guide](../services/openwebui.md) |
| **[n8n](../services/n8n.md)** | http://localhost:5001 | Workflow builder | [n8n Guide](../services/n8n.md) |
| **[Flowise](../services/flowise.md)** | http://localhost:5003 | Visual agent builder | [Flowise Guide](../services/flowise.md) |
| **[ElizaOS](../services/eliza.md)** | http://localhost:5005 | AI framework | [ElizaOS Guide](../services/eliza.md) |

## Main Interfaces

### OpenWebUI - Primary Interface
- **Purpose**: Chat with AI agents
- **Login**: No authentication required (default)
- **Features**: Model selection, chat history, custom extensions
- **Best For**: Testing AI interactions, quick conversations

> 📖 **Learn more**: [OpenWebUI Complete Guide](../services/openwebui.md)

### n8n - Workflow Builder
- **Purpose**: Create automated workflows
- **First Login**: Create admin account
- **Features**: Visual workflows, 500+ integrations, scheduling
- **Best For**: Automation, data processing, blockchain operations

> 📖 **Learn more**: [n8n Workflow Guide](../services/n8n.md) | [n8n Templates](../resources/n8n-templates.md)

### Flowise - Agent Builder  
- **Purpose**: Build conversational AI agents
- **Login**: admin / seiling123
- **Features**: Drag-drop agent design, LLM integration
- **Best For**: Creating chatbots, conversational interfaces

> 📖 **Learn more**: [Flowise Agent Guide](../services/flowise.md)

### ElizaOS - AI Framework
- **Purpose**: Advanced conversational AI
- **Features**: Sei Network integration, multi-modal interactions
- **Best For**: Complex AI agents, blockchain-aware chatbots

> 📖 **Learn more**: [ElizaOS Framework Guide](../services/eliza.md)

## Creating Your First Agent

### 🤖 Using Flowise (Recommended for Beginners)
1. Open http://localhost:5003
2. Login with admin / seiling123
3. Create new chatflow
4. Add LLM node (OpenAI)
5. Configure with your API key
6. Test and deploy

> 🔗 **Detailed walkthrough**: [Flowise Agent Creation Guide](../services/flowise.md)

### 🧠 Using ElizaOS (Advanced Users)
1. Access http://localhost:5005
2. ElizaOS comes pre-configured with Sei integration
3. Chat directly or integrate with other services
4. Customize personality and behavior

> 🔗 **Advanced configuration**: [ElizaOS Customization Guide](../services/eliza.md)

### 🤝 Using Cambrian (DeFi Focus)
1. Access http://localhost:5006
2. Connect wallet or use configured private key
3. Start DeFi-focused conversations
4. Leverage Yei Finance integration

> 🔗 **DeFi operations guide**: [Cambrian DeFi Guide](../services/cambrian.md) 
> 
## Building Workflows

### 🔄 Using n8n (Visual Workflows)
1. Open http://localhost:5001
2. Create new workflow
3. Add trigger (webhook, schedule, etc.)
4. Add action nodes (database, API calls, etc.)
5. Connect and test
6. Activate workflow

> 🔗 **Workflow examples**: [n8n Templates](../resources/n8n-templates.md)

### Common Workflow Patterns
- **API Integration**: Webhook → Process → Database
- **Scheduled Tasks**: Cron → Process → Notification
- **Agent Coordination**: Trigger → Agent Call → Response
- **Blockchain Automation**: Schedule → Sei MCP → Action

## Sei Network Integration

### 🔗 Sei MCP Server
- **Access**: http://localhost:5004
- **Purpose**: Blockchain operations via Model Context Protocol
- **Features**: 27 blockchain tools, multi-network support
- **Best For**: Wallet operations, smart contracts, DeFi

> 📖 **Complete guide**: [Sei MCP Server Documentation](../services/sei-mcp.md)

### 🧩 Custom n8n Nodes
The system includes 5 custom n8n nodes for Sei blockchain:
1. **Sei Transaction Builder** - Build transaction data
2. **Sei Transaction Executor** - Execute transactions
3. **Sei Explorer** - Query blockchain data
4. **Sei Deploy Contract** - Deploy smart contracts
5. **Sei Compile Contract** - Compile Solidity code

> 📖 **Node documentation**: [Sei n8n Nodes Guide](../resources/sei-n8n-nodes.md)

### 🏦 Blockchain Operations
Common blockchain tasks you can perform:
- **Wallet Management**: Check balances, send transactions
- **DeFi Operations**: Swap tokens, provide liquidity
- **Smart Contracts**: Deploy and interact with contracts
- **Portfolio Tracking**: Monitor holdings and performance

## 🎯 Templates and Examples

- **n8n templates**: [n8n Templates](../resources/n8n-templates.md)
- **openwebui templates**: [OpenWebUI Templates](../resources/openwebui-templates.md)
- **flowise templates**: [Flowise Templates](../resources/flowise-templates.md)

## 🔍 Database Integration

### 🐘 PostgreSQL (Primary Database)
- **Access**: Internal port 5432
- **Purpose**: Structured data storage
- **Best For**: User data, transaction logs, workflow state

> 📖 **Database guide**: [PostgreSQL Setup](../services/postgres.md)

### 🚀 Redis (Cache & Sessions)
- **Access**: Internal port 6379
- **Purpose**: Fast data access, session storage
- **Best For**: Temporary data, user sessions, API caching

> 📖 **Cache guide**: [Redis Configuration](../services/redis.md)

### 🧠 Qdrant (Vector Database)
- **Access**: http://localhost:6333
- **Purpose**: AI embeddings and similarity search
- **Best For**: Document search, semantic matching, AI memory

> 📖 **Vector guide**: [Qdrant Integration](../services/qdrant.md)

### 🕸️ Neo4j (Graph Database)
- **Access**: http://localhost:7474
- **Purpose**: Relationship mapping and graph analysis
- **Best For**: Social networks, recommendation systems, complex relationships

> 📖 **Graph guide**: [Neo4j Usage](../services/neo4j.md)

## 🛠️ Advanced Usage

### 🔄 Service Integration Patterns
```javascript
// Example: n8n calling Sei MCP Server
const mcpResponse = await $http.request({
  method: 'POST',
  url: 'http://sei-mcp-server:5004/api/wallet/balance',
  body: { address: 'sei1...' }
});

// Example: Cambrian calling SEI Agent Kit API
const agentResponse = await fetch('http://sei-agent-api:9000/api/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Check my portfolio' })
});
```

### 📊 Monitoring & Health Checks
```bash
# Check all services
docker compose ps

# Test individual services
curl http://localhost:5002/health    # OpenWebUI
curl http://localhost:5001/healthz   # n8n
curl http://localhost:5004/health    # Sei MCP Server
```

## 🎓 Learning Paths

### 👶 **Beginner Path**
1. [Quick Start](../getting-started/quick-start.md) - Deploy and explore
2. [OpenWebUI Basics](../services/openwebui.md) - Chat with AI
3. [Simple n8n Workflow](../resources/n8n-templates.md) - Try a template
4. [Basic Agent Creation](../services/flowise.md) - Build your first agent

### 👨‍💻 **Developer Path**
1. [Configuration](../getting-started/configuration.md) - Custom setup
2. [n8n Custom Nodes](../resources/sei-n8n-nodes.md) - Blockchain integration
3. [ElizaOS Development](../services/eliza.md) - Advanced AI agents
4. [Production Deployment](../getting-started/deployment.md) - Scale to production

## 🆘 Getting Help

### 📚 **Resources**
- **[External Resources](../resources/external-resources.md)** - Official documentation links

### 🤝 **Support Channels**
- **GitHub Issues**: [Report bugs](https://github.com/nicoware-dev/seiling-buidlbox/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/nicoware-dev/seiling-buidlbox/discussions)
- **Documentation**: You're reading it!

---

**Next Steps:**
- **🚀 Try Templates**: [n8n Workflow Templates](../resources/n8n-templates.md)
- **🤖 Build Agents**: [Agent Development Guide](../services/n8n.md)
- **🛠️ Advanced Usage**: [Production Guide](../getting-started/deployment.md) 