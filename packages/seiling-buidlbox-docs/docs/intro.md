---
sidebar_position: 1
---

import ClickableImage from '@site/src/components/ClickableImage';

# Introduction

> **Complete No-Code AI Agent Development Toolkit for Sei Network**

Seiling Buidlbox is a comprehensive development environment for building AI agents that interact with the Sei blockchain. Deploy everything with one command and start building immediately.

## 🏗️ Architecture Overview

<ClickableImage 
  src="/img/architecture.png" 
  alt="Seiling Buidlbox Architecture"
  title="Click to view full size"
/>

*Complete system architecture showing all integrated services and their relationships*

## 🌟 What You Get

**12 Production-Ready Services** working together out of the box:

### 🖥️ User Interface Services
- **[OpenWebUI](./services/openwebui.md)** - Primary chat interface (Default Port: 5002)
- **[n8n](./services/n8n.md)** - Visual workflow builder with custom Sei nodes (Default Port: 5001)  
- **[Flowise](./services/flowise.md)** - Visual AI agent builder (Default Port: 5003)

### 🤖 AI Agent Frameworks
- **[ElizaOS](./services/eliza.md)** - Advanced conversational AI framework (Default Port: 5005)
- **[Cambrian](./services/cambrian.md)** - Multi-modal agent platform with DeFi integration (Default Port: 5006)
- **[Sei MCP Server](./services/sei-mcp.md)** - Blockchain operations via Model Context Protocol (Default Port: 5004)

### 🗄️ Database Services
- **[PostgreSQL](./services/postgres.md)** - Primary relational database (Default Port: 5432)
- **[Redis](./services/redis.md)** - Cache and session storage (Default Port: 6379)
- **[Qdrant](./services/qdrant.md)** - Vector database for AI embeddings (Default Port: 6333)
- **[Neo4j](./services/neo4j.md)** - Graph database for relationships (Default Port: 7474)

### 🚀 Infrastructure Services
- **[Traefik](./services/traefik.md)** - Reverse proxy with SSL termination (Default Ports: 80/443)
- **[Ollama](./services/ollama.md)** - Local LLM server (Default Port: 11434)

## 📦 Available Resources

### 🛠️ Development Tools
- **[Custom n8n Nodes](./resources/sei-n8n-nodes.md)** - 5 specialized Sei blockchain nodes
- **[n8n Templates](./resources/n8n-templates.md)** - Ready-to-use workflow templates
- **[Bootstrap Scripts](./resources/bootstrap-scripts.md)** - Automated setup and deployment

### 📚 Documentation Resources
- **[Quick Start Guide](./getting-started/quick-start.md)** - Get running in 5 minutes
- **[Configuration Guide](./getting-started/configuration.md)** - Complete setup instructions
- **[Services Overview](./services/overview.md)** - Complete service documentation

### 🔧 Reference Materials
- **[Services Overview](./services/overview.md)** - Complete service documentation
- **[External Resources](./resources/external-resources.md)** - Links to official docs

### 🎯 Templates & Examples
- **[Workflow Templates](./resources/n8n-templates.md)** - Pre-built n8n workflows
- **[Flowise Templates](./resources/flowise-templates.md)** - Visual AI agent templates
- **[OpenWebUI Templates](./resources/openwebui-templates.md)** - Chat interface extensions

## 🚀 Quick Start

### One-Command Setup
```bash
# Clone and deploy everything
curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | bash
```

### Access Your Tools
After deployment, access these services:

| Service | URL | Purpose | Documentation |
|---------|-----|---------|---------------|
| **OpenWebUI** | http://localhost:5002 | Chat interface | [Guide](./services/openwebui.md) |
| **n8n** | http://localhost:5001 | Workflow builder | [Guide](./services/n8n.md) |
| **Flowise** | http://localhost:5003 | Agent builder | [Guide](./services/flowise.md) |
| **ElizaOS** | http://localhost:5005 | AI framework | [Guide](./services/eliza.md) |
| **Cambrian** | http://localhost:5006 | DeFi agents | [Guide](./services/cambrian.md) |
| **Sei MCP** | http://localhost:5004 | Blockchain tools | [Guide](./services/sei-mcp.md) |

## 📋 System Requirements

### Minimum Requirements
- **4GB+ RAM** (8GB+ recommended)
- **10GB+ storage** (20GB+ recommended)
- **Docker** (auto-installed by bootstrap)
- **Git** (for cloning repositories)

### Required Credentials
- **[OpenAI API key](https://platform.openai.com/api-keys)** (for AI features)
- **[Sei private key](https://docs.sei.io/dev/tools/setup-environment)** (for blockchain operations)

> 📖 **Need help getting credentials?** See our [Configuration Guide](./getting-started/configuration.md)

## 🎯 Primary Use Cases

### 🤖 AI Agent Development
- **Conversational Agents**: Build chatbots with blockchain capabilities
- **Multi-Modal Agents**: Create agents that handle text, voice, and data
- **Agent Orchestration**: Coordinate multiple agents for complex tasks
- **Custom Personalities**: Design agents with specific roles and behaviors

### 🔗 Blockchain Automation
- **DeFi Operations**: Automated trading, lending, yield farming
- **Portfolio Management**: Balance monitoring and rebalancing
- **Transaction Automation**: Scheduled and event-driven transactions
- **Smart Contract Interaction**: Deploy and interact with contracts

### 📊 Workflow Automation
- **Data Processing**: ETL pipelines for blockchain data
- **API Integration**: Connect to external services and APIs
- **Notification Systems**: Alerts for price changes, transactions
- **Reporting**: Automated portfolio and performance reports

### 🛠️ No-Code Development
- **Visual Programming**: Build complex systems without coding
- **Template Library**: Start with pre-built templates
- **Rapid Prototyping**: Test ideas quickly with visual tools
- **Integration Platform**: Connect different services seamlessly

## 🗺️ Navigation Guide

### For Beginners
1. **[Quick Start](./getting-started/quick-start.md)** - Deploy and explore
2. **[Services Overview](./services/overview.md)** - Learn each interface
3. **[Templates](./resources/n8n-templates.md)** - Try pre-built workflows
4. **[External Resources](./resources/external-resources.md)** - Official documentation

### For Developers  
1. **[Configuration](./getting-started/configuration.md)** - Custom setup
2. **[Services Overview](./services/overview.md)** - Technical details
3. **[Bootstrap Scripts](./resources/bootstrap-scripts.md)** - Automation tools
4. **[External Resources](./resources/external-resources.md)** - Official docs

### For Advanced Users
1. **[Services Overview](./services/overview.md)** - System architecture
2. **[Sei n8n Nodes](./resources/sei-n8n-nodes.md)** - Custom blockchain nodes
3. **[Flowise Templates](./resources/flowise-templates.md)** - AI agent flows
4. **[External Resources](./resources/external-resources.md)** - Official docs

## 💡 What Makes It Special

### 🔧 **Integrated Toolkit**
All tools work together seamlessly - data flows from one service to another without complex configuration.

### 🚀 **Production Ready**
Pre-configured Docker containers, health checks, and monitoring included out of the box.

### 🎯 **Sei Network Native**
Built specifically for Sei blockchain with native tooling and optimizations.

### 📦 **Modular Architecture**
Enable only the services you need - each component can be used independently or together.

### 🔄 **No-Code Focus**
Visual interfaces for all major functions - build complex systems without programming.

## 🤝 Community & Support

- **📖 Documentation**: You're reading it! Comprehensive guides for everything
- **🐛 Issues**: [GitHub Issues](https://github.com/nicoware-dev/seiling-buidlbox/issues) for bug reports
- **💬 Discussions**: [GitHub Discussions](https://github.com/nicoware-dev/seiling-buidlbox/discussions) for questions
- **📧 Support**: Check our [External Resources](./resources/external-resources.md) for official documentation

## 🚀 Ready to Start?

Choose your path:

- **🎯 Just Want to Try It?** → [Quick Start Guide](./getting-started/quick-start.md)
- **🔧 Need Custom Setup?** → [Configuration Guide](./getting-started/configuration.md)
- **📚 Want to Learn Everything?** → [Services Overview](./services/overview.md)
- **⚡ Ready to Build?** → [n8n Templates](./resources/n8n-templates.md)

---

**Seiling Buidlbox** - From zero to AI agent in minutes. From prototype to production in hours. 