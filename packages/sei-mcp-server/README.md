# SEI MCP Server


A **Model Context Protocol (MCP)** server for interacting with SEI blockchain networks. Supports HTTP/SSE transport for any MCP client with URL-based connections.

This MCP server is a modified fork of the original [SEI MCP server](https://github.com/sei-protocol/sei-mcp-server). It includes a prebuilt Docker image, making deployment and operation significantly simpler and more accessible for all users.

## 📦 Prebuilt Docker Image

The MCP server is available as a prebuilt Docker image on Docker Hub:

```bash
docker pull 0xn1c0/sei-mcp-server:latest
```

## 🎯 Features

- **🔗 Universal MCP Client Support**: Works with Cursor IDE, Claude Desktop, and any MCP client supporting HTTP/SSE
- **🔐 Client-Side Security**: Private keys provided by clients, not stored on server
- **🌐 Multi-Network**: Supports SEI mainnet, testnet, and devnet
- **🛠️ 27 Blockchain Tools**: Complete SEI blockchain operation toolkit
- **🐳 Docker Ready**: Production-ready containerization
- **📡 Real-time**: Server-Sent Events for live communication

## 🚀 Quick Start

### Option 1: Direct Installation

```bash
# Install dependencies
npm install

# Build the server
npm run build

# Start HTTP server
node build/http-server.js
```

### Option 2: Docker (Recommended)

```bash
# Build Docker image
# (supports both HTTP/SSE and STDIO modes)
docker build -t 0xn1c0/sei-mcp-server:latest .

# Run HTTP/SSE server (persistent background service on port 3333)
docker run -d --name sei-mcp-server -p 3333:3333 0xn1c0/sei-mcp-server:latest

# Run STDIO mode (for IDE/CLI subprocess) - IMPORTANT: Use correct entrypoint
docker run -i --rm --entrypoint node -e ENABLE_SEI_MCP=yes -e PRIVATE_KEY=0x... 0xn1c0/sei-mcp-server:latest build/index.js

# Verify health (HTTP/SSE)
curl http://localhost:5004/health
```

### Option 3: Docker Compose

```bash
# Start with Docker Compose (HTTP/SSE mode)
docker-compose up -d

# Check logs
docker-compose logs -f sei-mcp-server
```

## 🔧 MCP Client Configuration

### Option 1: Docker STDIO Mode (Recommended)

This is the easiest way to use the SEI MCP server, similar to other MCP servers:

#### Cursor IDE
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--entrypoint",
        "node",
        "-e",
        "LOG_LEVEL=debug",
        "-e",
        "DISABLE_CONSOLE_OUTPUT=true",
        "-e",
        "PRIVATE_KEY=0x...",
        "-e",
        "ENABLE_SEI_MCP=yes",
        "0xn1c0/sei-mcp-server:latest",
        "build/index.js"
      ]
    }
  }
}
```

#### Claude Desktop
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--entrypoint",
        "node",
        "-e",
        "LOG_LEVEL=debug",
        "-e",
        "DISABLE_CONSOLE_OUTPUT=true",
        "-e",
        "PRIVATE_KEY=0x...",
        "-e",
        "ENABLE_SEI_MCP=yes",
        "0xn1c0/sei-mcp-server:latest",
        "build/index.js"
      ]
    }
  }
}
```

> **Note**: The `--entrypoint node` and `build/index.js` arguments are required to force stdio mode, as the Docker entrypoint script prioritizes HTTP mode by default.

### Option 2: HTTP/SSE Mode

For cases where you need a persistent server:

#### Cursor IDE
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "url": "http://localhost:5004/sse",
      "headers": {
        "X-Private-Key": "0x..."
      }
    }
  }
}
```

#### Claude Desktop
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "url": "http://localhost:3333/sse",
      "headers": {
        "X-Private-Key": "0x..."
      }
    }
  }
}
```

### Option 3: Local Command Mode

If you have the server built locally:

```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "node",
      "args": ["./build/index.js"],
      "cwd": "/path/to/sei-mcp-server",
      "env": {
        "PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

### Generic MCP Client

```javascript
const client = new MCPClient({
  serverUrl: "http://localhost:5004/sse",
  headers: {
    "X-Private-Key": "0x..." // Your SEI private key
  }
});
```

## ❓ FAQ

### Can I run both modes at the same time?
**Yes!**
- Use `docker run -d -p 3333:3333 0xn1c0/sei-mcp-server:latest` for HTTP/SSE (persistent server on port 3333).
- Use `docker run -i --rm --entrypoint node -e ENABLE_SEI_MCP=yes 0xn1c0/sei-mcp-server:latest build/index.js` for STDIO (one-off process for each client session, no port, no conflict).
- Both modes can be run at the same time using the same image.

### Do I need a separate STDIO image?
**No!**
- The main image (`0xn1c0/sei-mcp-server:latest`) supports both modes. However, for STDIO mode, you must override the entrypoint: `--entrypoint node` and specify `build/index.js` as the command.
- The Docker entrypoint script prioritizes HTTP mode by default, so `MCP_MODE=stdio` environment variable alone is not sufficient.
- You can also use specific versions like `0xn1c0/sei-mcp-server:v1.0.0-1b17345` for exact version control.

## 🔐 Security Model

### Private Key Management

- **✅ Client-Side**: Private keys provided by MCP client via `X-Private-Key` header
- **✅ Per-Request**: Each request includes the private key securely
- **✅ No Server Storage**: Server doesn't store or require private keys at startup
- **✅ Multi-Client**: Different clients can use different private keys

### Why This Approach?

1. **Better Security**: Private keys never stored in server environment
2. **Isolation**: Each client controls their own private key
3. **Flexibility**: Support multiple users/keys simultaneously
4. **Compliance**: Follows security best practices

## 🛠️ Available Tools

### Network Information
- `get_supported_networks` - List available networks
- `get_chain_info` - Get chain ID, block number, RPC info
- `get_chain_id` - Get current chain ID

### Balance Operations
- `get_balance` - Get native SEI balance
- `get_erc20_balance` - Get ERC20 token balance
- `get_erc721_balance` - Get NFT balance
- `get_erc1155_balance` - Get ERC1155 token balance

### Transaction Operations
- `transfer_native` - Transfer SEI tokens
- `transfer_erc20` - Transfer ERC20 tokens
- `transfer_erc721` - Transfer NFTs
- `transfer_erc1155` - Transfer ERC1155 tokens

### Block & Transaction Data
- `get_latest_block` - Get latest block info
- `get_block_by_number` - Get specific block
- `get_transaction` - Get transaction details
- `get_transaction_receipt` - Get transaction receipt
- `wait_for_transaction` - Wait for confirmation

### Smart Contracts
- `call_contract` - Call contract functions
- `deploy_contract` - Deploy new contracts
- `is_contract` - Check if address is contract
- `get_code` - Get contract bytecode
- `get_storage_at` - Read contract storage

### Gas & Fees
- `estimate_gas` - Estimate transaction gas
- `get_gas_price` - Get current gas price
- `get_nonce` - Get account nonce

### Advanced
- `get_logs` - Get contract event logs
- `simulate_transaction` - Simulate without executing
- `get_address_from_private_key` - Derive address from key

## 🌐 Supported Networks

- **sei** - SEI Mainnet (Chain ID: 1329)
- **sei-testnet** - SEI Testnet (Chain ID: 1328)
- **sei-devnet** - SEI Devnet (Chain ID: 713716)

## 📊 Server Endpoints

- `GET /sse` - Server-Sent Events endpoint for MCP communication
- `POST /messages` - MCP message handling
- `GET /health` - Health check endpoint

## 🔍 Testing

### Test Network Connectivity

```bash
# Test health
curl http://localhost:5004/health

# Test with MCP client
# Configure your MCP client and try:
# "Get supported SEI networks"
# "Get my SEI balance for address 0x..."
```

### Example Operations

```bash
# Using the MCP client, you can:
# 1. Check supported networks
# 2. Get real-time balance data
# 3. Send actual blockchain transactions
# 4. Query block and transaction data
# 5. Interact with smart contracts
```

## 🐳 Docker Configuration

### Available Image Tags

| Tag | Description | Use Case |
|-----|-------------|----------|
| `0xn1c0/sei-mcp-server:latest` | Latest stable version | Production, general use |
| `0xn1c0/sei-mcp-server:v1.0.0-latest` | Latest v1.0.0 series | Version-specific deployments |
| `0xn1c0/sei-mcp-server:v1.0.0-1b17345` | Specific commit version | Exact version pinning |
| `0xn1c0/sei-mcp-server:v0.1.0` | Previous stable version | Rollback/compatibility |

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3333 | No |
| `HOST` | Bind address | 0.0.0.0 | No |
| `NODE_ENV` | Environment | production | No |
| `LOG_LEVEL` | Logging level | info | No |

### Health Checks

The Docker container includes automatic health checks:

```bash
# Manual health check
docker exec sei-mcp-server curl -f http://localhost:5004/health
```

### Logs

```bash
# View container logs
docker logs sei-mcp-server

# Follow logs in real-time
docker logs -f sei-mcp-server
```

## 🔧 Development

### Build Process

```bash
# Install dependencies
npm install

# Development server
npm run dev:http

# Build for production
npm run build
npm run build:http

# Run built server
node build/http-server.js
```

### Project Structure

```
src/
├── server/
│   ├── http-server.ts     # HTTP/SSE server implementation
│   └── server.ts          # Core MCP server setup
├── core/
│   ├── services/          # Blockchain service implementations
│   ├── config.ts          # Configuration management
│   └── chains.ts          # Network definitions
└── index.ts               # STDIO entry point (fallback)
```

## 📚 Documentation

- [Development Summary](./DEVELOPMENT-SUMMARY.md) - Detailed development process
- [Docker Guide](./docs/DOCKER.md) - Complete Docker deployment guide
- [Cleanup Guide](./CLEANUP-GUIDE.md) - Repository maintenance

## 🤝 Usage Examples

### Get Supported Networks

```javascript
// MCP client automatically calls this
const networks = await client.call("get_supported_networks");
// Returns: ["sei", "sei-testnet", "sei-devnet"]
```

### Check Balance

```javascript
const balance = await client.call("get_balance", {
  address: "0x...",
  network: "sei-testnet"
});
// Returns: { address, network, wei, sei }
```

### Send Transaction

```javascript
const result = await client.call("transfer_native", {
  to: "0x...",
  amount: "0.01",
  network: "sei-testnet"
});
// Returns: { transactionHash, to, amount, network, status }
```

## 🔒 Security Notes

1. **Private Keys**: Always provide via client headers, never in server environment
2. **HTTPS**: Use HTTPS in production with reverse proxy
3. **Firewall**: Restrict server access to authorized clients only
4. **Updates**: Keep dependencies updated for security patches

## 🎊 Production Deployment

### Using Docker Compose

```yaml
version: '3.8'
services:
  sei-mcp-server:
    image: 0xn1c0/sei-mcp-server:latest
    ports:
      - "3333:3333"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5004/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Using Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sei-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sei-mcp-server
  template:
    metadata:
      labels:
        app: sei-mcp-server
    spec:
      containers:
      - name: sei-mcp-server
        image: 0xn1c0/sei-mcp-server:latest
        ports:
        - containerPort: 3333
```

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/sei-protocol/sei-mcp-server/issues)
- **Documentation**: See `docs/` directory
- **Health Check**: `curl http://localhost:5004/health`

---

**Ready to use SEI blockchain operations in any MCP client! 🚀**
