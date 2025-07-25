# Sei n8n Nodes

> **Custom n8n nodes for Sei blockchain integration**

The `n8n-nodes-sei` package provides 5 specialized nodes for Sei EVM blockchain operations within n8n workflows.

## 🎯 Quick Navigation

**🚀 New to n8n?** → [n8n Service Guide](../services/n8n.md) | [User Guide](../getting-started/user-guide.md)  
**📋 Need Templates?** → [n8n Templates](./n8n-templates.md) | [Workflow Examples](./n8n-templates.md)  
**🔗 Want More Blockchain Tools?** → [Sei MCP Server](../services/sei-mcp.md) | [Cambrian DeFi](../services/cambrian.md)  
**🛠️ Looking for Setup Help?** → [Installation Guide](#installation) | [Configuration Guide](../getting-started/configuration.md)

## Overview

- **Package**: `n8n-nodes-sei`
- **Version**: 0.1.0
- **Installation**: Community nodes in n8n or npm
- **Networks**: Sei Mainnet (Pacific-1), Testnet (Atlantic-2), Custom EVM chains

> 📖 **Complementary tools**: These nodes work alongside [Sei MCP Server](../services/sei-mcp.md) for complete blockchain integration

## Available Nodes

### 1. Sei Transaction Builder
**Purpose**: Generate transaction data for Sei EVM operations

**Operations**:
- Token transfers (SEI and custom tokens)
- Smart contract method calls
- Build transaction parameters for execution

**Configuration**:
- Network selection (mainnet/testnet/custom)
- Recipient address and value
- Contract interaction parameters
- Gas settings

> 🔗 **Used with**: [Sei Transaction Executor](#2-sei-transaction-executor) | [Templates using this node](./n8n-templates.md)

### 2. Sei Transaction Executor
**Purpose**: Execute transactions on Sei EVM

**Operations**:
- Execute pre-built transaction data
- Manual transaction execution
- Transaction confirmation and receipt

**Configuration**:
- Execution mode (from builder or manual)
- Network and gas parameters
- Private key credential required

> 🔗 **Used with**: [Sei Transaction Builder](#1-sei-transaction-builder) 

### 3. Sei Explorer
**Purpose**: Query blockchain data from Sei network

**Operations**:
- Get block information
- Retrieve transaction details
- Check account balances
- Call read-only contract methods

**Configuration**:
- Query type selection
- Block number or transaction hash
- Contract address and ABI for method calls

> 🔗 **Alternative**: [Sei MCP Server](../services/sei-mcp.md) for more advanced blockchain queries

### 4. Sei Deploy Contract
**Purpose**: Deploy smart contracts to Sei or EVM-compatible chains

**Operations**:
- Deploy custom contracts (ABI + bytecode)
- Deploy ERC-20 tokens (name, symbol, decimals, supply)
- Deploy ERC-721 NFTs (name, symbol)

**Configuration**:
- Contract type selection
- Constructor parameters
- Network and deployment settings

### 5. Sei Compile Contract
**Purpose**: Compile Solidity source code to bytecode and ABI

**Operations**:
- Compile Solidity contracts
- Built-in ERC-20 and ERC-721 templates
- Configurable compiler optimization

**Configuration**:
- Solidity source code input
- Compiler version (0.8.19-0.8.24)
- Optimization settings

> 🔗 **Used with**: [Sei Deploy Contract](#4-sei-deploy-contract)

## Installation

### Via n8n Community Nodes
1. **Open n8n**: http://localhost:5001
2. **Settings** → **Community Nodes**
3. **Install Package**: `n8n-nodes-sei`
4. **Restart n8n**

> 📖 **Detailed guide**: [n8n Community Nodes Installation](../services/n8n.md)

### Manual Development Install
```bash
# Clone and build
git clone <repository>
cd n8n-nodes-sei
npm install && npm run build

# Link globally
npm link
cd ~/.n8n/custom
npm link n8n-nodes-sei
```

## Credential Setup

Create "Sei API" credential in n8n:
- **Type**: Sei API
- **Private Key**: Your wallet private key (hex format with 0x prefix)


## Supported Networks

- **Sei Mainnet**: Pacific-1 (Chain ID: 1329)
- **Sei Testnet**: Atlantic-2 (Chain ID: 1328)  
- **Custom**: Any EVM-compatible chain via RPC URL

> 🌐 **Network details**: [Sei Network Documentation](../resources/external-resources.md)

## Templates

- **[Sei Nodes Agent Example](../resources/n8n-templates.md)** - Basic queries, balance checks

## Integration with Other Services

### 🔗 Sei MCP Server Integration
Combine n8n nodes with MCP server for enhanced functionality:
- **n8n Nodes**: Direct blockchain operations
- **MCP Server**: Advanced tools and AI integration
- **Use Together**: Complex workflows with both approaches

> 📖 **Integration guide**: [Combining n8n Nodes with MCP Server](../services/sei-mcp.md)

### 🤖 AI Agent Integration
Use with AI services for intelligent automation:
- **ElizaOS**: Conversational triggers for blockchain operations
- **Cambrian**: DeFi-focused agent coordination
- **OpenWebUI**: Chat-triggered workflows

> 🔗 **AI integration**: [AI Integration](../resources/n8n-templates.md)

### 📊 Database Integration
Store and analyze blockchain data:
- **PostgreSQL**: Transaction history and portfolio data
- **Qdrant**: Semantic search of blockchain events
- **Neo4j**: Transaction relationship mapping

## Error Handling

### Common Issues
- **Invalid private key**: Ensure hex format with 0x prefix
- **Network connectivity**: Verify RPC endpoint accessibility
- **Gas estimation**: Use appropriate gas limits for operations
- **Contract ABI**: Validate ABI format for contract calls

### Debugging
```bash
# Check n8n logs
docker logs seiling-n8n

# Verify installation
docker exec seiling-n8n npm list n8n-nodes-sei
```

## Best Practices

### Security
- Store private keys securely in n8n credentials
- Use testnet for development and testing
- Validate all addresses and transaction parameters

### Performance
- Use appropriate gas settings for network conditions
- Implement retry logic for network failures
- Cache frequently accessed contract data

### Development
- Test contract compilation before deployment
- Validate transaction data before execution
- Monitor transaction confirmations

## 🔗 Related Resources

### 📚 Essential Documentation
- **[n8n Service Guide](../services/n8n.md)** - Complete n8n setup and configuration
- **[n8n Templates](./n8n-templates.md)** - Ready-to-use workflows with these nodes
- **[User Guide](../getting-started/user-guide.md)** - General platform usage patterns

### 🔗 Blockchain Resources
- **[Sei MCP Server](../services/sei-mcp.md)** - Alternative blockchain integration method
- **[Cambrian Service](../services/cambrian.md)** - DeFi-focused agent platform
- **[External Resources](./external-resources.md)** - Official Sei Network documentation


## 🎯 Use Case Examples

### 🏦 DeFi Automation
**Nodes Used**: All 5 nodes
- **Compile** custom DeFi contracts
- **Deploy** to Sei network
- **Execute** trading strategies
- **Monitor** portfolio performance

### 🎮 NFT Management
**Nodes Used**: Compile, Deploy, Explorer
- **Create** NFT collections
- **Deploy** ERC-721 contracts
- **Track** NFT ownership and transfers

### 📊 Analytics Dashboard
**Nodes Used**: Explorer, Database integration
- **Query** blockchain data
- **Store** in databases
- **Analyze** trends and patterns

## 🚀 Getting Started

### 👶 **Beginner Path**
1. **[Install Nodes](#installation)** - Set up n8n-nodes-sei
2. **[Try Templates](./n8n-templates.md)** - Start with pre-built workflows

### 👨‍💻 **Developer Path**
1. **[Advanced Workflows](./n8n-templates.md)** - Complex automationservices

---

**The Sei n8n nodes provide a complete smart contract development and interaction workflow within n8n.**

**Next Steps:**
- **🚀 Try Templates**: [n8n Workflow Templates](./n8n-templates.md)
- **🔧 Learn n8n**: [n8n Service Guide](../services/n8n.md)
- **🤖 Build Agents**: [AI Integration Guide](../resources/n8n-templates.md)
- **🔗 Advanced Blockchain**: [Sei MCP Server](../services/sei-mcp.md) 