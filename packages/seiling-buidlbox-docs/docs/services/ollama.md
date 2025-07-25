# Ollama

> **Local LLM inference server**

Ollama provides local AI model inference, reducing reliance on external APIs and improving privacy.

## Overview

- **Port**: 11434
- **Image**: `ollama/ollama:latest`
- **Purpose**: Local AI model hosting
- **Status**: Disabled by default (heavy resource usage)

## Configuration

### Enable Ollama
```bash
ENABLE_OLLAMA=yes
```

### Requirements
- **RAM**: 8GB+ minimum (16GB+ recommended)
- **Storage**: 20GB+ for models
- **CPU**: Modern processor recommended

## Features

### Supported Models
- **Llama 2**: Meta's open-source model
- **Code Llama**: Programming assistance
- **Mistral**: Fast and efficient
- **Phi**: Microsoft's compact models
- **Custom Models**: Import your own

### Model Management
```bash
# List available models
curl http://localhost:11434/api/tags

# Pull a model
curl -X POST http://localhost:11434/api/pull \
  -d '{"name": "llama2"}'

# Generate text
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama2", "prompt": "Hello, world!"}'
```

## Usage

### Via OpenWebUI
1. **Configure Model**: Add Ollama endpoint in OpenWebUI
2. **Select Model**: Choose from available models
3. **Chat**: Use locally hosted models

### Via API
```javascript
// Direct API call
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama2',
    prompt: 'Explain blockchain technology',
    stream: false
  })
});
```

### Integration with Services
- **OpenWebUI**: Local model selection
- **Flowise**: Custom LLM nodes
- **ElizaOS**: Local inference
- **n8n**: API calls for text generation

## Model Management

### Popular Models
```bash
# Small models (4GB RAM)
llama2:7b
mistral:7b
phi:latest

# Medium models (8GB RAM)
llama2:13b
codellama:13b

# Large models (16GB+ RAM)
llama2:70b
```

### Performance Tuning
```bash
# Check GPU support
nvidia-smi  # For NVIDIA GPUs

# Monitor resource usage
docker stats seiling-ollama
```

## Troubleshooting

### High Resource Usage
```bash
# Check memory usage
docker stats seiling-ollama

# Monitor system resources
free -h
df -h
```

### Model Loading Issues
```bash
# Check Ollama logs
docker logs seiling-ollama --tail=50

# Verify model download
curl http://localhost:11434/api/tags
```

### Performance Issues
```bash
# Restart Ollama
docker restart seiling-ollama

# Clear downloaded models
docker exec seiling-ollama rm -rf /root/.ollama/models/*
```

### Disable if Needed
```bash
# Disable Ollama to save resources
ENABLE_OLLAMA=no

# Restart services
docker compose restart
```

---

**Ollama enables local AI inference.** Only use if you have sufficient system resources and want privacy/offline capabilities. 