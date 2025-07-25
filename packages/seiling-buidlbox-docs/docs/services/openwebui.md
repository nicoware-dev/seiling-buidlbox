# OpenWebUI

> **Primary chat interface for AI interactions**

OpenWebUI provides a ChatGPT-like interface for interacting with AI models and agents. It's the main entry point for users.

## Overview

- **URL**: http://localhost:5002
- **Image**: `ghcr.io/open-webui/open-webui:main`
- **Purpose**: Chat interface with AI models
- **Status**: Always enabled

## Features

- **Multiple AI Models**: OpenAI, Anthropic, Google AI support
- **Custom Functions**: Extensible with Python functions
- **Chat History**: Persistent conversation storage
- **File Uploads**: Support for documents and images
- **Model Management**: Switch between different AI models

## Configuration

### Required
```bash
OPENAI_API_KEY=sk-proj-your_key_here
```

### Optional
```bash
OPENWEBUI_PORT=5002
ANTHROPIC_API_KEY=your_claude_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## Usage

### Basic Chat
1. Open http://localhost:5002
2. Start chatting with AI models
3. Upload files or images as needed

### Custom Functions
OpenWebUI supports custom Python functions for extending capabilities:

1. **Access Admin Panel**: Settings → Functions
2. **Add Function**: Copy from `resources/openwebui/`
3. **Enable Function**: Toggle on and configure

### Available Extensions
- **Eliza Pipe**: Chat with ElizaOS agents
- **Cambrian Pipe**: Access Cambrian agents
- **Flowise Pipe**: Execute Flowise workflows
- **N8N Pipe**: Trigger n8n workflows

## Troubleshooting

### Common Issues

**Can't access interface**:
```bash
# Check service status
docker logs seiling-openwebui

# Check port availability
curl http://localhost:5002
```

**API errors**:
```bash
# Verify API key
grep OPENAI_API_KEY .env

# Restart service
docker restart seiling-openwebui
```

**Functions not working**:
- Check function syntax in admin panel
- Verify service connectivity
- Review function logs

### Health Check
```bash
# Quick health check
curl -I http://localhost:5002

# Detailed logs
docker logs seiling-openwebui --tail=50
```

## Integration

### With Other Services
- **ElizaOS**: Direct agent communication
- **n8n**: Workflow triggers via functions
- **Flowise**: Agent execution via functions
- **Databases**: Direct query capabilities

### API Access
OpenWebUI provides REST API endpoints for programmatic access.

---

**OpenWebUI is your main interface for AI interactions.** Start here for most tasks. 