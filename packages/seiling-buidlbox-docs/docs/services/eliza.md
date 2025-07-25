# ElizaOS

> **Advanced conversational AI framework**

ElizaOS is a multi-platform conversational AI framework with built-in Sei Network integration.

## Overview

- **URL**: http://localhost:5005
- **Image**: `0xn1c0/eliza-develop:v1.2.1`
- **Purpose**: Conversational AI with blockchain capabilities
- **Status**: Enabled by default

## Features

- **Multi-Platform**: Discord, Telegram, Farcaster, Web
- **Blockchain Integration**: Native Sei Network support
- **Memory System**: Long-term conversation memory
- **Plugin Architecture**: Extensible with custom plugins
- **Multi-Model Support**: OpenAI, Anthropic, Google AI
- **Character System**: Customizable AI personalities

## Configuration

### Required
```bash
OPENAI_API_KEY=sk-proj-your_key
SEI_PRIVATE_KEY=0xyour_private_key
```

### Optional
```bash
ELIZA_PORT=5005
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## Usage

### Access Interface
1. Open http://localhost:5005
2. Start chatting with the AI
3. Use blockchain commands naturally

### Blockchain Integration
ElizaOS includes built-in Sei plugin:
- **Wallet Operations**: Check balances, send transactions
- **DeFi Integration**: Swap tokens, provide liquidity
- **Smart Contracts**: Deploy and interact with contracts
- **Market Data**: Real-time price information

### Character Customization
ElizaOS supports custom AI characters:
- **Personality**: Define behavior and responses
- **Knowledge**: Specific domain expertise
- **Voice**: Consistent communication style
- **Goals**: Purpose-driven interactions

## Available Commands

### Blockchain Operations
- "What's my wallet balance?"
- "Send 100 SEI to [address]"
- "Swap 50 SEI for USDC"
- "Check SEI price"

### General AI
- Natural conversation
- Question answering
- Task assistance
- Creative writing

## Integration

### With Seiling Services
- **Sei MCP Server**: Blockchain tool access
- **PostgreSQL**: Memory and data storage
- **Redis**: Caching and sessions
- **n8n**: Workflow triggers

### External Platforms
- **Discord**: Bot integration
- **Telegram**: Chat bot
- **Farcaster**: Social interactions
- **Web Interface**: Direct chat

## Troubleshooting

### Service Not Responding
```bash
# Check service status
docker logs seiling-eliza

# Verify API keys
grep OPENAI_API_KEY .env
```

### Blockchain Features Not Working
```bash
# Check Sei private key
grep SEI_PRIVATE_KEY .env

# Verify MCP server
curl http://localhost:5004/health
```

### Memory Issues
```bash
# Check PostgreSQL connection
docker logs seiling-postgres

# Restart ElizaOS
docker restart seiling-eliza
```

## Advanced Features

### Plugin Development
ElizaOS supports custom plugins:
- **Actions**: Custom commands and responses
- **Evaluators**: Decision-making logic
- **Providers**: External data sources
- **Services**: Background processes

### Multi-Agent Systems
ElizaOS can coordinate multiple agents:
- **Specialized Roles**: Different expertise areas
- **Collaboration**: Agents working together
- **Orchestration**: Complex task management

---

**ElizaOS provides enterprise-grade conversational AI.** Ideal for sophisticated chatbots and multi-agent systems. 