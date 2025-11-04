# SEI MCP Server V2

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A **Model Context Protocol (MCP)** server for interacting with SEI blockchain networks. Supports HTTP/SSE transport for any MCP client with URL-based connections.

**SEI MCP Server V2** is a comprehensive upgrade providing an all-in-one gateway to the Web3 ecosystem on Sei Network. This server transforms the core MCP concept into a complete toolkit for AI agents, featuring advanced DeFi protocols, NFT marketplaces, cross-chain bridges, and much more.

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
- **🛠️ 100+ Blockchain Tools**: Complete SEI blockchain operation toolkit with advanced protocol integrations
- **🐳 Docker Ready**: Production-ready containerization
- **📡 Real-time**: Server-Sent Events for live communication

### 🚀 V2 New Features

#### 💹 Advanced DeFi & NFT Trading
- **Citrex Perpetual Futures Exchange**: Place orders, manage positions, access market data
- **DragonSwap V3 DEX**: Execute swaps, manage liquidity positions, create pools
- **OpenSea NFT Marketplace**: Discover collections, create listings, buy NFTs
- **Yei Finance Lending Protocol**: Supply assets, borrow, flash loans, credit delegation

#### 🌉 DEX & Bridge Aggregation
- **Symphony & Kame DEX Aggregators**: Optimal swap routing across multiple DEXs
- **Li.Fi & deBridge Cross-Chain Bridging**: Seamless asset bridging across blockchains

#### 🪙 Token Lifecycle Management
- **ERC20 & ERC721 Deployment**: Create and deploy tokens from scratch
- **Token Verification**: Verify deployed contracts on SeiTrace

#### 📊 Rich Data & Analytics
- **SeiTrace**: Deep on-chain analysis (wallets, transactions, token holders)
- **CoinGecko & DexScreener**: Real-time market data, historical prices, DEX analytics

#### 🐝 Hive Intelligence
- **Natural Language Querying**: Query blockchain data using plain English

📖 **For comprehensive documentation on all features, protocols, and usage examples, see [FEATURES.md](./FEATURES.md)**

See the [Available Tools](#🛠️-available-tools) section below for the complete list.

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
- `get_block_by_number` - Get specific block
- `get_latest_block` - Get latest block info
- `get_transaction` - Get transaction details
- `get_transaction_receipt` - Get transaction receipt
- `estimate_gas` - Estimate transaction gas
- `is_contract` - Check if address is contract
- `read_contract` - Read contract state
- `write_contract` - Write to contract

### Token Operations
- `get_balance` - Get native SEI balance
- `get_erc20_balance` / `get_token_balance` - Get ERC20 token balance
- `get_token_info` - Get comprehensive ERC20 token information
- `transfer_sei` - Transfer native SEI tokens
- `transfer_erc20` / `transfer_token` - Transfer ERC20 tokens
- `approve_token_spending` - Approve token spending
- `wrap_sei_directly` / `unwrap_sei_directly` - Wrap/unwrap SEI to WSEI

### NFT Operations
- `get_nft_info` - Get NFT metadata and ownership
- `get_nft_balance` - Get NFT balance for a collection
- `check_nft_ownership` - Verify NFT ownership
- `transfer_nft` - Transfer ERC721 NFTs
- `get_erc1155_balance` - Get ERC1155 token balance
- `get_erc1155_token_uri` - Get ERC1155 metadata URI
- `transfer_erc1155` - Transfer ERC1155 tokens

### Wallet Utilities
- `get_address_from_private_key` - Derive address from key

### DragonSwap V3 DEX
- `dragonswap_swap` - Execute token swaps
- `dragonswap_get_quote` - Get swap quotes
- `dragonswap_add_liquidity` - Add liquidity to pools
- `dragonswap_remove_liquidity` - Remove liquidity
- `dragonswap_create_pool` - Create new pools
- `dragonswap_get_pool_info` - Get pool information

### Citrex Perpetual Futures
- `citrex_get_tickers` - Get market tickers
- `citrex_get_product` / `citrex_get_products` - Get product information
- `citrex_get_order_book` - Get order book data
- `citrex_get_klines` - Get candlestick data
- `citrex_place_order` / `citrex_place_orders` - Place orders
- `citrex_cancel_order` / `citrex_cancel_orders` - Cancel orders
- `citrex_list_open_orders` - List open orders
- `citrex_list_balances` - Get account balances
- `citrex_get_account_health` - Get account health
- `citrex_deposit` / `citrex_withdraw` - Deposit/withdraw funds

### Yei Finance Lending
- `yei_supply` - Supply assets to earn interest
- `yei_borrow` - Borrow against collateral
- `yei_repay` - Repay borrowed assets
- `yei_withdraw` - Withdraw supplied assets
- `yei_get_user_account_data` - Get account data
- `yei_flash_loan` - Execute flash loans

### OpenSea NFT Marketplace
- `opensea_get_collection` - Get collection information
- `opensea_get_nft` - Get NFT details
- `opensea_create_listing` - Create NFT listing
- `opensea_fulfill_listing` - Buy NFT
- `opensea_get_account_assets` - Get account NFTs

### Symphony & Kame DEX Aggregators
- `symphony_get_quote` / `symphony_swap` - Get quotes and execute swaps
- `symphony_get_tokens` - Get supported tokens
- `kame_get_quote` / `kame_swap` - Kame aggregator swaps

### Cross-Chain Bridges (Li.Fi & deBridge)
- `lifi_get_quote` / `lifi_execute_swap` - Li.Fi cross-chain swaps
- `debridge_get_quote` / `debridge_create_order` - deBridge bridging

### Token Deployment
- `deploy_erc20` - Deploy new ERC20 tokens
- `deploy_erc721` - Deploy new ERC721 NFT collections
- `verify_contract` - Verify deployed contracts

### Data & Analytics
- `seitrace_get_address` - Get detailed address analysis
- `seitrace_get_token` - Get comprehensive token data
- `coingecko_get_price` - Get token prices from CoinGecko
- `dexscreener_get_pair` - Get DEX pair data
- `hive_query` - Natural language blockchain queries

For detailed information about each tool, refer to the tool descriptions when using the MCP server.

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
| `PRIVATE_KEY` | Private key for transaction signing | - | Yes (for signing operations) |
| `COINGECKO_PRO_API_KEY` | CoinGecko Pro API key | - | No (optional, for CoinGecko tools) |
| `SEITRACE_API_KEY` | SeiTrace API key | - | No (optional, for SeiTrace tools) |
| `OPENSEA_API_KEY` | OpenSea API key | - | No (optional, for OpenSea tools) |
| `HIVE_INTELLIGENCE_API_KEY` | Hive Intelligence API key | - | No (optional, for Hive queries) |

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
│   │   ├── abi/          # Protocol ABIs (DragonSwap, Yei Finance, etc.)
│   │   ├── dragonswap.ts # DragonSwap V3 integration
│   │   ├── citrex.ts     # Citrex exchange integration
│   │   ├── yeifinance.ts # Yei Finance lending protocol
│   │   ├── opensea.ts    # OpenSea NFT marketplace
│   │   ├── symphony.ts   # Symphony aggregator
│   │   ├── kame_ag.ts    # Kame aggregator
│   │   ├── lifi.ts       # Li.Fi bridge
│   │   ├── deBridge.ts   # deBridge integration
│   │   ├── coingecko.ts  # CoinGecko market data
│   │   ├── dexscreener.ts # DexScreener analytics
│   │   ├── seitrace.ts   # SeiTrace insights
│   │   ├── deployERC20.ts # ERC20 deployment
│   │   ├── deployERC721.ts # ERC721 deployment
│   │   └── hive_intelligence.ts # Hive Intelligence
│   ├── tools/            # MCP tool registrations (modular)
│   │   ├── network.ts    # Network/block/transaction tools
│   │   ├── token.ts      # Token operations
│   │   ├── dragonswap.ts # DragonSwap tools
│   │   ├── citrex.ts     # Citrex tools
│   │   └── ...          # Other protocol tools
│   ├── config.ts         # Configuration management
│   └── chains.ts         # Network definitions
└── index.ts              # STDIO entry point (fallback)
```

### Migration from V1 to V2

V2 introduces a modular tool structure. If you have existing integrations:
- The old `registerEVMTools` function has been replaced with `registerAllTools`
- All tools from V1 are still available and backward compatible
- New protocol integrations are automatically registered

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

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)**: Comprehensive documentation for all features, protocols, and tools with detailed examples
- **[QUICK_START.md](./QUICK_START.md)**: Quick examples for common use cases and workflows
- **[README.md](./README.md)**: This file - overview, setup guide, and configuration

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/sei-protocol/sei-mcp-server/issues)
- **Health Check**: `curl http://localhost:5004/health`

---

**Ready to use SEI blockchain operations in any MCP client! 🚀**
