# n8n Templates

> **Ready-to-use workflow templates for Sei Network**

The `resources/n8n/` folder contains workflow templates for common blockchain operations and AI agent patterns. These templates help you get started quickly with proven workflow patterns.

## 🎯 Quick Navigation

**🚀 New to n8n?** → [n8n Service Guide](../services/n8n.md) | [User Guide](../getting-started/user-guide.md)  
**🔧 Need Setup Help?** → [n8n Configuration](../services/n8n.md)  
**🤖 Building Agents?** → [ElizaOS Guide](../services/eliza.md) | [Cambrian Guide](../services/cambrian.md)  
**🔗 Blockchain Integration?** → [Sei MCP Server Guide](../services/sei-mcp.md) | [Sei n8n Nodes](./sei-n8n-nodes.md)

## Available Templates

### 👶 Beginner Templates

#### Sei MCP Agent Example
- **File**: [Sei MCP Agent Example.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Sei%20MCP%20Agent%20Example.json)
- **Purpose**: Basic blockchain operations via MCP server
- **Features**: Wallet balance, simple transactions
- **Best for**: Learning MCP integration
- **Prerequisites**: [Sei MCP Server](../services/sei-mcp.md) running

> 🔗 **Related**: [Sei MCP Server Guide](../services/sei-mcp.md)

#### Cambrian Agent Demo
- **File**: [Cambrian Agent Demo.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Cambrian%20Agent%20Demo.json)
- **Purpose**: DeFi operations with agent integration
- **Features**: Portfolio management, agent communication
- **Best for**: Understanding agent workflows
- **Prerequisites**: [Cambrian Service](../services/cambrian.md) configured

> 🔗 **Related**: [Cambrian Service Guide](../services/cambrian.md) | [Yei Finance Protocol](../services/cambrian.md)

### 🚀 Advanced Templates

#### Seiling Buidlbox Full Demo
- **File**: [Seiling Buidlbox Full Demo.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Seiling%20Buidlbox%20Full%20Demo.json)
- **Purpose**: Complete system demonstration
- **Features**: Multi-service integration, full workflow
- **Best for**: Understanding the entire platform
- **Prerequisites**: All services running (see [Services Overview](../services/overview.md))

> 🔗 **Related**: [Services Overview](../services/overview.md) | [Service Integration Patterns](../getting-started/user-guide.md)

#### Sei Multi-Agent System
- **File**: [Sei Multi-Agent System Example.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Sei%20Multi-Agent%20System%20Example.json)
- **Purpose**: Coordinated multi-agent workflows
- **Features**: Complex decision chains, advanced integration
- **Best for**: Advanced automation
- **Prerequisites**: [ElizaOS](../services/eliza.md) + [Cambrian](../services/cambrian.md) configured

> 🔗 **Related**: [ElizaOS Guide](../services/eliza.md) | [Agent Coordination](../getting-started/user-guide.md)

### 🧩 Specialized Templates

#### Custom Sei Nodes Demo
- **File**: [Custom Sei Nodes Demo.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Custom%20Sei%20Nodes%20Demo.json)
- **Purpose**: Demonstrates all 5 custom Sei nodes
- **Features**: Direct blockchain operations
- **Best for**: Learning custom nodes
- **Prerequisites**: [Custom Sei Nodes](./sei-n8n-nodes.md) installed

> 🔗 **Related**: [Sei n8n Nodes Guide](./sei-n8n-nodes.md)

#### Sei Eliza Demo
- **File**: [Sei Eliza Demo.json](https://github.com/nicoware-dev/seiling-buidlbox/blob/main/resources/n8n/Sei%20Eliza%20Demo.json)
- **Purpose**: ElizaOS agent integration
- **Features**: Conversational AI with blockchain
- **Best for**: AI-powered crypto operations
- **Prerequisites**: [ElizaOS](../services/eliza.md) with blockchain plugins

> 🔗 **Related**: [ElizaOS Guide](../services/eliza.md)

## Template Categories

### 🔗 Blockchain Operations
| Template | Difficulty | Features | Prerequisites |
|----------|------------|----------|---------------|
| Sei Nodes Agent Example | Beginner | Basic queries, balance checks | [Sei n8n Nodes](./sei-n8n-nodes.md) |
| Custom Sei Nodes Demo | Intermediate | All 5 custom nodes | [Node Installation](./sei-n8n-nodes.md) |
| Sei MCP Demo | Intermediate | MCP protocol usage | [MCP Server](../services/sei-mcp.md) |

### 🤖 AI Integration
| Template | Difficulty | Features | Prerequisites |
|----------|------------|----------|---------------|
| Cambrian Agent Demo | Beginner | DeFi agent basics | [Cambrian Setup](../services/cambrian.md) |
| Sei Eliza Demo | Intermediate | Conversational AI | [ElizaOS Setup](../services/eliza.md) |
| Multi-Agent System | Advanced | Agent coordination | Multiple AI services |

### 📊 Data & Automation
| Template | Difficulty | Features | Prerequisites |
|----------|------------|----------|---------------|
| Portfolio Monitor | Beginner | Balance tracking | [Database Setup](../services/postgres.md) |
| DeFi Automation | Intermediate | Trading automation | DeFi protocols |
| Full System Demo | Advanced | All integrations | Complete deployment |

## 🚀 Using Templates

### Installation Steps
1. **Access n8n**: Open http://localhost:5001
2. **Import Template**: Go to Templates → Import from file
3. **Upload JSON**: Download template from [GitHub](https://github.com/nicoware-dev/seiling-buidlbox/tree/main/resources/n8n) and upload
4. **Configure Credentials**: Set up required API keys and connections
5. **Test Workflow**: Execute to verify functionality
6. **Customize**: Modify for your specific needs

> 📖 **Detailed guide**: [n8n Import Process](../services/n8n.md)

### 🔧 Template Requirements

#### Common Prerequisites
- **OpenAI API Key**: For AI-powered templates
- **Sei Private Key**: For blockchain operations
- **Database Access**: PostgreSQL connection configured
- **Service Health**: All required services running

> 🔗 **Setup help**: [Configuration Guide](../getting-started/configuration.md)

#### Service-Specific Requirements
- **Sei MCP Templates**: [MCP Server running](../services/sei-mcp.md)
- **Cambrian Templates**: [Cambrian service configured](../services/cambrian.md)
- **ElizaOS Templates**: [ElizaOS framework setup](../services/eliza.md)
- **Blockchain Templates**: [Custom nodes installed](./sei-n8n-nodes.md)

## 🎯 Template Use Cases

### 💼 Portfolio Management
**Templates**: Portfolio Monitor, DeFi Automation
- **Purpose**: Track holdings, automate rebalancing
- **Features**: Real-time monitoring, automated alerts
- **Integration**: [Sei MCP Server](../services/sei-mcp.md) + [PostgreSQL](../services/postgres.md)

### 🤖 Agent Development
**Templates**: Cambrian Demo, Multi-Agent System
- **Purpose**: Build conversational AI agents
- **Features**: Natural language processing, decision making
- **Integration**: [ElizaOS](../services/eliza.md) + [Cambrian](../services/cambrian.md)

### 🔄 Workflow Automation
**Templates**: Full System Demo, Custom Nodes Demo
- **Purpose**: Automate complex business processes
- **Features**: Multi-step workflows, error handling
- **Integration**: Multiple services coordination

### 📈 DeFi Operations
**Templates**: DeFi Automation, Sei Eliza Demo
- **Purpose**: Automated trading and yield farming
- **Features**: Price monitoring, transaction execution
- **Integration**: [Yei Finance](../services/cambrian.md) + Blockchain nodes

## 🛠️ Customization Guide

### Basic Modifications
1. **Change Parameters**: Update addresses, amounts, timing
2. **Add Notifications**: Include email/Slack alerts
3. **Modify Logic**: Adjust decision conditions
4. **Update Schedules**: Change execution frequency

### Advanced Customization
1. **Add Services**: Integrate additional databases or APIs
2. **Custom Functions**: Create JavaScript processing nodes
3. **Error Handling**: Implement retry logic and fallbacks
4. **Monitoring**: Add health checks and status reporting

> 🔗 **Development guide**: [n8n Custom Development](../services/n8n.md)

### 🔍 Template Structure

#### Common Pattern
```
Trigger → Validation → Processing → Action → Logging → Notification
```

#### Example Flow
```
Cron Schedule → Check Balance → Compare Threshold → Execute Trade → Store Result → Send Alert
```

> 🔗 **Pattern library**: [Workflow Patterns](../resources/n8n-templates.md)

## 🧪 Testing Templates

### Pre-Deployment Testing
```bash
# 1. Check service health
curl http://localhost:5001/healthz   # n8n
curl http://localhost:5004/health    # Sei MCP Server

# 2. Test credentials
# Verify API keys and private keys in .env

# 3. Test database connections
docker exec seiling-postgres pg_isready
```

### Template Validation
1. **Import Template**: Load into n8n
2. **Check Connections**: Verify all nodes are properly connected
3. **Test Execution**: Run workflow manually first
4. **Monitor Logs**: Check for errors or warnings
5. **Validate Results**: Confirm expected outcomes


## 🔗 Related Resources

### 📚 Documentation
- **[n8n Service Guide](../services/n8n.md)** - Complete n8n setup and usage
- **[Sei n8n Nodes](./sei-n8n-nodes.md)** - Custom blockchain nodes documentation
- **[User Guide](../getting-started/user-guide.md)** - General usage patterns and examples
- **[External Resources](./external-resources.md)** - Official documentation links

### 🤖 AI & Blockchain
- **[ElizaOS Guide](../services/eliza.md)** - Conversational AI framework
- **[Cambrian Guide](../services/cambrian.md)** - DeFi agent platform
- **[Sei MCP Server](../services/sei-mcp.md)** - Blockchain operation tools

### Create Your Own Templates
Based on these patterns, you can create templates for:
- **Social Trading**: Copy successful trader strategies
- **Yield Optimization**: Automatically find best yields
- **Risk Management**: Monitor and protect portfolios
- **Market Analysis**: Automated technical analysis
- **Notification Systems**: Custom alert mechanisms

### 🤝 Contributing Templates
Have a useful workflow? Consider contributing:
1. **Clean Template**: Remove personal data and credentials
2. **Add Documentation**: Include usage instructions
3. **Test Thoroughly**: Verify functionality
4. **Submit PR**: Share with the community

---

**Next Steps:**
- **🚀 Try a Template**: Start with [Sei MCP Agent Example](../services/sei-mcp.md)
- **🔧 Learn n8n**: [n8n Service Guide](../services/n8n.md)
- **🔗 Integrate Blockchain**: [Sei Integration Guide](../resources/sei-n8n-nodes.md) 