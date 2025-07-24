<div align="center">
  <br>
  <img src="assets/CAMBRIAN_DESIGN_4-52 (2).jpg">
  <br>
</div>

<h4 align="center">Custom SEI Agent Kit with Yei Finance Integration & API Server</h4>

[![npm version](https://img.shields.io/npm/v/sei-agent-kit-custom.svg)](https://www.npmjs.com/package/sei-agent-kit-custom)
[![Docker Pulls](https://img.shields.io/docker/pulls/0xn1c0/sei-agent)](https://hub.docker.com/r/0xn1c0/sei-agent)

> **Available on [npm](https://www.npmjs.com/package/sei-agent-kit-custom) and [Docker Hub](https://hub.docker.com/r/0xn1c0/sei-agent) for easy installation and deployment.**

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-supported-protocols">Protocols</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-docker-deployment">Docker</a> •
  <a href="#-links">Links</a>
</p>

<hr>

## 🪲 Introduction

**SEI Agent Kit Custom** is a specialized fork of the Cambrian Agent Kit designed to simplify the development of AI Agents on the SEI blockchain. This custom build includes enhanced Yei Finance integration alongside the standard DeFi protocol support, plus a **built-in API server** for easy integration.

This toolkit bridges the gap between AI and blockchain interaction, enabling the creation of autonomous agents and agentic chatbots that can perform operations on the SEI network, with particular focus on Yei Finance's lending and borrowing capabilities.

## ✨ Features

- **Yei Finance Integration**: Complete lending and borrowing operations
  - Supply assets to earn yield
  - Withdraw supplied assets
  - Borrow against collateral
  - Repay borrowed assets
  - Health factor monitoring
- **API Server**: Built-in Express.js API server for easy integration
  - RESTful endpoints for agent interactions
  - Health check endpoint
  - CORS enabled for web applications
- **Docker Support**: Pre-built Docker image for easy deployment
  - Available as `0xn1c0/sei-agent:latest`
  - One-command deployment
  - Environment variable configuration
- **Token Operations**: Complete SEI ERC-20 and ERC-721 token management
- **DeFi Protocol Integration**: Seamless interaction with SEI's DeFi ecosystem
- **Swap Functionality**: Token swapping through Symphony aggregator
- **Lending & Borrowing**: Interact with Takara protocol for lending operations
- **Staking Operations**: Stake and unstake SEI tokens with Silo
- **Perpetual Trading**: Trade perpetual contracts on Citrex protocol
- **LangChain Integration**: Build AI agents with LangChain and LangGraph

## 📋 Supported Protocols

The SEI Agent Kit Custom integrates with a variety of protocols and services:

### DeFi Protocols
- **Yei Finance**: Advanced lending and borrowing platform with health factor monitoring
- **Symphony**: Token swapping and routing
- **Takara**: Lending and borrowing platform
- **Silo**: Staking and yield farming
- **Citrex**: Perpetual trading platform

### Token Standards
- **SEI ERC-20**: Complete token operations
- **SEI ERC-721**: NFT token management

## 📦 Installation

### Option 1: Install the package via npm

[View on npm: sei-agent-kit-custom](https://www.npmjs.com/package/sei-agent-kit-custom)

```bash
npm install sei-agent-kit-custom
```

### Option 2: Clone and build locally

```bash
git clone <your-repo-url>
cd sei-agent-kit-custom
npm install
```

## 🐳 Docker Deployment

### Quick Start with Docker

[View on Docker Hub: 0xn1c0/sei-agent](https://hub.docker.com/r/0xn1c0/sei-agent)

```bash
docker pull 0xn1c0/sei-agent:latest

# Run with environment variables
docker run -d --name sei-agent \
  -p 9000:9000 \
  --env-file .env \
  -e DISABLE_CLI=true \
  0xn1c0/sei-agent:latest
```

### Environment Variables

Create a `.env` file with your configuration:

```bash
OPENAI_API_KEY=your_openai_api_key
SEI_PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://evm-rpc.sei-apis.com
```

### API Endpoints

Once running, the API is available at:

- **Health Check**: `GET http://your-host:9000/health`
- **Agent Message**: `POST http://your-host:9000/api/message`

Example usage:
```bash
# Health check
curl http://your-host:9000/health

# Send message to agent
curl -X POST http://your-host:9000/api/message \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```

**Note**: On Windows with Docker Desktop, you may need to use your local IP address instead of `localhost` (e.g., `http://172.17.0.1:9000`).

## 🔧 Quickstart

#### Configuration

Create a `.env` file with your API keys and configurations:

```bash
cp .env.example .env
```

Required environment variables:
```
OPENAI_API_KEY=your_openai_api_key
SEI_PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://evm-rpc.sei-apis.com
```

#### Install dependencies

```bash
npm install
```

#### Run the sample agent

```bash
npm run test
```

#### Start the API server

```bash
npm start
```

## 🔗 Links

- [Twitter](https://x.com/cambrian_ai)
- [Website](https://cambrian.wtf)
- [Docker Hub](https://hub.docker.com/r/0xn1c0/sei-agent)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Check out our [Tool Creation Guide](CreateTool.md) for instructions on how to create and add new tools to the toolkit.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
