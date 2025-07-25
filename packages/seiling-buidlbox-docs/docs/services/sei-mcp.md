# Sei MCP Server

> **Blockchain operations via Model Context Protocol**

Sei MCP Server provides 27 blockchain tools accessible through the Model Context Protocol, enabling AI agents to interact with the Sei Network.

## Overview

- **URL**: http://localhost:5004
- **Image**: `0xn1c0/sei-mcp-server:latest`
- **Purpose**: Blockchain integration for AI agents
- **Status**: Enabled by default

## Features

- **27 Blockchain Tools**: Wallet operations, DeFi, queries
- **Multi-Network Support**: Sei mainnet and testnet
- **MCP Protocol**: Standardized AI-blockchain communication
- **HTTP/SSE Transport**: Real-time communication
- **Health Monitoring**: Built-in health checks

## Configuration

### Required
```bash
SEI_PRIVATE_KEY=0xyour_private_key_here
```

### Optional
```bash
MCP_SERVER_PORT=5004
RPC_URL=https://evm-rpc.sei-apis.com
```

## Available Tools

### Wallet Operations
- **Get Balance**: Check wallet balance
- **Send Transaction**: Transfer tokens
- **Transaction History**: Query past transactions
- **Address Validation**: Verify addresses

### DeFi Operations
- **Token Swaps**: Exchange tokens
- **Liquidity Provision**: Add/remove liquidity
- **Staking**: Stake/unstake tokens
- **Yield Farming**: Manage farming positions

### Smart Contracts
- **Contract Calls**: Execute contract functions
- **Contract Queries**: Read contract state
- **Event Monitoring**: Listen for contract events
- **Contract Deployment**: Deploy new contracts

### Network Queries
- **Block Information**: Latest block data
- **Gas Prices**: Current gas estimates
- **Network Status**: Chain health
- **Validator Information**: Staking details

## Usage

### Via n8n Workflows
```javascript
// HTTP Request node to MCP server
const response = await $http.request({
  method: 'POST',
  url: 'http://sei-mcp-server:5004/tools/get_balance',
  body: { address: 'sei1...' }
});
```

### Via AI Agents
MCP protocol enables direct tool access from:
- ElizaOS agents
- Cambrian agents
- Custom AI implementations

### Health Check
```bash
# Check server health
curl http://localhost:5004/health

# List available tools
curl http://localhost:5004/tools
```

## Troubleshooting

### Common Issues

**Server not responding**:
```bash
# Check service logs
docker logs seiling-sei-mcp

# Verify private key
grep SEI_PRIVATE_KEY .env
```

**Tool execution failures**:
- Verify private key format (0x...)
- Check network connectivity
- Ensure sufficient gas/tokens
- Review RPC endpoint

**Connection errors**:
```bash
# Test health endpoint
curl http://localhost:5004/health

# Restart service
docker restart seiling-sei-mcp
```

### Debugging
```bash
# Detailed logs
docker logs seiling-sei-mcp --tail=100

# Check tool execution
curl -X POST http://localhost:5004/tools/get_balance \
  -H "Content-Type: application/json" \
  -d '{"address": "your_address"}'
```

## Integration

### With AI Frameworks
- **ElizaOS**: Built-in MCP support
- **Cambrian**: Direct tool access
- **Custom Agents**: HTTP API calls

### With Workflows
- **n8n**: HTTP request nodes
- **Zapier**: Webhook integrations
- **Custom Scripts**: REST API calls

---

**Sei MCP Server enables AI agents to perform blockchain operations.** Essential for DeFi automation and crypto workflows. 