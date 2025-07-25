# Flowise

> **Visual AI agent builder**

Flowise provides a drag-and-drop interface for building AI agents with LangChain components.

## Overview

- **URL**: http://localhost:5003
- **Image**: `flowiseai/flowise:latest`
- **Purpose**: Visual agent creation and flow building
- **Status**: Always enabled

## Features

- **Visual Editor**: Drag-and-drop flow builder
- **LangChain Integration**: Pre-built components
- **Multiple LLMs**: OpenAI, Anthropic, Google AI
- **Memory Management**: Conversation persistence
- **Vector Databases**: Document embeddings
- **Custom Tools**: API integrations

## Configuration

### Required
```bash
FLOWISE_PORT=5003
FLOWISE_PASSWORD=seiling123
```

### Optional
```bash
OPENAI_API_KEY=sk-proj-your_key
ANTHROPIC_API_KEY=your_claude_key
```

## Usage

### First Time Setup
1. Open http://localhost:5003
2. Login: admin / seiling123
3. Create new chatflow

### Basic Agent Creation
1. **Add LLM Node**: ChatOpenAI or similar
2. **Add Memory**: Buffer or Redis memory
3. **Add Tools**: Custom tools or APIs
4. **Connect Flow**: Link components
5. **Test Agent**: Try sample queries

### Available Components
- **LLMs**: OpenAI, Anthropic, Google, local models
- **Memory**: Buffer, Redis, PostgreSQL
- **Vector Stores**: Qdrant, Pinecone, Chroma
- **Tools**: HTTP requests, databases, custom functions
- **Chains**: Sequential, conversation, RAG

## Integration

### With Seiling Services
- **Qdrant**: Vector storage for RAG
- **Redis**: Memory and caching
- **PostgreSQL**: Data persistence
- **Sei MCP**: Blockchain tools

### Common Patterns
- **RAG Chatbot**: Documents + LLM + memory
- **Tool Agent**: LLM + custom tools + memory
- **Research Assistant**: Web search + analysis + summary

## Troubleshooting

### Can't Access Interface
```bash
# Check service
docker logs seiling-flowise

# Verify port
curl http://localhost:5003
```

### Flow Execution Errors
- Check API keys in settings
- Verify component connections
- Test individual nodes
- Review execution logs

---

**Flowise enables visual AI agent development.** Perfect for building complex conversational agents without coding. 