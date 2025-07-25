# Cambrian

> **Multi-modal agent platform**

Cambrian provides advanced agent orchestration with Yei Finance integration for DeFi operations.

## Overview

- **URL**: http://localhost:5006
- **Image**: `0xn1c0/cambrian-agent-launcher:latest`
- **Purpose**: Multi-modal AI agents with DeFi integration
- **Status**: Enabled by default

## Features

- **Multi-Modal**: Text, voice, and visual processing
- **DeFi Integration**: Yei Finance protocol support
- **Portfolio Management**: Automated trading and rebalancing
- **Agent Coordination**: Multi-agent workflows
- **Real-Time Data**: Live market information
- **Risk Management**: Built-in safety protocols

## Configuration

### Required
```bash
OPENAI_API_KEY=sk-proj-your_key
SEI_PRIVATE_KEY=0xyour_private_key
```

### Optional
```bash
CAMBRIAN_AGENT_PORT=5006
RPC_URL=https://evm-rpc.sei-apis.com
```

## Usage

### Access Interface
1. Open http://localhost:5006
2. Connect wallet or use configured private key
3. Start interacting with agents

### DeFi Operations
Cambrian supports comprehensive DeFi operations:
- **Swapping**: Token exchanges via Yei Finance
- **Lending**: Borrow and lend assets
- **Yield Farming**: Automated yield strategies
- **Portfolio Analysis**: Performance tracking

### Agent Capabilities
- **Market Analysis**: Real-time market data analysis
- **Trading Strategies**: Automated trading execution
- **Risk Assessment**: Portfolio risk evaluation
- **Yield Optimization**: Maximize returns safely

## Available Commands

### Portfolio Management
- "Show my portfolio"
- "What's my total balance?"
- "Analyze my positions"
- "Rebalance my portfolio"

### Trading Operations
- "Swap 100 SEI for USDC"
- "Buy $1000 worth of ETH"
- "Set stop loss at 10%"
- "Execute my DCA strategy"

### Market Analysis
- "What's the SEI price?"
- "Show me trending tokens"
- "Analyze BTC market sentiment"
- "Find best yield opportunities"

## Integration

### Yei Finance Protocol
- **Automated Market Making**: DEX operations
- **Lending Protocols**: Borrow/lend integration
- **Yield Farming**: Optimized strategies
- **Cross-Chain**: Multi-chain support

### With Seiling Services
- **Sei MCP Server**: Blockchain operations
- **PostgreSQL**: Data persistence
- **Redis**: Caching and sessions
- **n8n**: Workflow automation

## Troubleshooting

### Agent Not Responding
```bash
# Check service status
docker logs seiling-cambrian

# Verify configuration
grep OPENAI_API_KEY .env
```

### DeFi Operations Failing
```bash
# Check private key
grep SEI_PRIVATE_KEY .env

# Verify network connection
curl https://evm-rpc.sei-apis.com
```

### Portfolio Data Issues
```bash
# Check database connection
docker logs seiling-postgres

# Restart service
docker restart seiling-cambrian
```

## Advanced Features

### Multi-Agent Workflows
Cambrian coordinates multiple specialized agents:
- **Trading Agent**: Execute trades
- **Analysis Agent**: Market research
- **Risk Agent**: Risk management
- **Portfolio Agent**: Asset allocation

### Custom Strategies
- **DCA (Dollar Cost Averaging)**: Automated buying
- **Grid Trading**: Range-bound strategies
- **Momentum Trading**: Trend following
- **Arbitrage**: Cross-market opportunities

### Risk Management
- **Stop Losses**: Automatic loss prevention
- **Position Sizing**: Risk-adjusted allocation
- **Diversification**: Portfolio optimization
- **Slippage Protection**: Trade execution safety

---

**Cambrian enables sophisticated DeFi automation.** Perfect for advanced trading strategies and portfolio management. 