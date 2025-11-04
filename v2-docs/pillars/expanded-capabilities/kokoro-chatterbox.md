# Kokoro & Chatterbox - Voice/Audio Integration

## Overview

Kokoro and Chatterbox enable voice-enabled multi-modal agents with Text-to-Speech (TTS) and Automatic Speech Recognition (ASR) capabilities. This allows for hands-free Sei Network interactions and accessibility features.

## Features

- **Text-to-Speech (TTS)**: Convert text to natural-sounding speech
- **Automatic Speech Recognition (ASR)**: Convert speech to text
- **Voice-Enabled Chat**: Voice interaction with AI agents
- **Multi-Modal Support**: Combine text, voice, and image inputs
- **Low Latency**: <500ms response times for voice queries

## Setup

### Enable Kokoro/Chatterbox

1. **Set environment variables in `.env`:**
   ```bash
   ENABLE_KOKORO=yes
   VOICE_MODEL=whisper
   CHATTERBOX_API_KEY=<optional>
   ```

2. **Deploy services:**
   ```bash
   ./bootstrap.sh
   ```

### Services Included

- **kokoro**: TTS/ASR service (Port 3080 internally)
- **chatterbox**: Voice-enabled chat UI (Port 3008)

## Access

- **Chatterbox UI**: http://localhost:3008 (if Caddy enabled) or http://localhost:3008
- **Kokoro API**: http://localhost:3080 (internal)

## Integration

### Using the Kokoro API

**Text-to-Speech:**
```python
import requests

def text_to_speech(text, voice='default'):
    """Convert text to speech using Kokoro"""
    url = 'http://kokoro:3080/api/tts'
    payload = {
        'text': text,
        'voice': voice
    }
    response = requests.post(url, json=payload)
    return response.content  # Audio data

# Example usage
audio = text_to_speech('Hello from Sei Network!')
with open('output.wav', 'wb') as f:
    f.write(audio)
```

**Speech-to-Text:**
```python
def speech_to_text(audio_file):
    """Convert speech to text using Kokoro"""
    url = 'http://kokoro:3080/api/stt'
    with open(audio_file, 'rb') as f:
        files = {'audio': f}
        response = requests.post(url, files=files)
    return response.json()['text']

# Example usage
text = speech_to_text('recording.wav')
print(f"Transcribed: {text}")
```

**Voice Query (Complete):**
```python
def voice_query(audio_file):
    """Complete voice query workflow"""
    # 1. Speech to text
    text = speech_to_text(audio_file)
    
    # 2. Process query (e.g., with AI agent)
    response = process_query(text)
    
    # 3. Text to speech
    audio = text_to_speech(response)
    
    return audio, text, response
```

### Integration with OpenWebUI

Proxy OpenWebUI through Kokoro for voice chat:

1. Configure OpenWebUI to use voice input/output
2. Connect to Kokoro API for TTS/ASR
3. Enable voice mode in chat interface

### Integration with n8n

Add voice nodes to n8n workflows:

1. **Voice Input Node**: Record audio and transcribe
2. **Voice Output Node**: Generate speech from text
3. **Voice Query Node**: Complete voice query workflow

**Example n8n workflow:**
```
Voice Input → Transcribe (Kokoro) → Process Query → 
Generate Response → Text to Speech (Kokoro) → Voice Output
```

### Sei-Specific Voice Intents

Define voice intents for Sei Network operations:

```python
VOICE_INTENTS = {
    'deploy_contract': [
        'deploy contract',
        'create smart contract',
        'publish contract'
    ],
    'check_balance': [
        'check balance',
        'show my balance',
        'how much sei do I have'
    ],
    'transfer_tokens': [
        'send tokens',
        'transfer sei',
        'send coins'
    ]
}

def process_voice_intent(text):
    """Process voice intent for Sei operations"""
    text_lower = text.lower()
    for intent, phrases in VOICE_INTENTS.items():
        if any(phrase in text_lower for phrase in phrases):
            return intent, extract_parameters(text)
    return None, None
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_KOKORO` | Enable/disable voice services | `no` |
| `VOICE_MODEL` | Voice model to use | `whisper` |
| `CHATTERBOX_API_KEY` | Optional API key | (empty) |
| `CHATTERBOX_PORT` | External port | `3008` |

### Voice Models

Supported models:
- **whisper**: OpenAI Whisper for ASR (default)
- **piper**: Fast local TTS
- **coqui**: High-quality TTS

Configure in environment:
```bash
VOICE_MODEL=whisper  # or piper, coqui
```

## Health Checks

Check voice services health:

```bash
# Via bootstrap script
bash scripts/bootstrap/health_check.sh

# Direct checks
curl http://localhost:3080/health  # Kokoro
curl http://localhost:3008/health  # Chatterbox
```

## Troubleshooting

### Services Not Starting

1. Check logs:
   ```bash
   docker logs seiling-kokoro
   docker logs seiling-chatterbox
   ```

2. Verify dependencies:
   - Kokoro must be healthy before Chatterbox
   - Check voice model availability

3. Check resources:
   - Voice services may require additional CPU/RAM
   - Ensure sufficient resources allocated

### Audio Quality Issues

1. Check audio format:
   - Supported: WAV, MP3, OGG
   - Sample rate: 16kHz recommended

2. Adjust model settings:
   - Try different voice models
   - Adjust quality vs speed tradeoff

### Latency Issues

1. Optimize model selection:
   - Faster models for lower latency
   - Higher quality models for better accuracy

2. Enable caching:
   - Cache common phrases
   - Pre-generate frequent responses

## Security

- **Network**: Services only expose ports internally
- **API Keys**: Optional API key authentication
- **Privacy**: Voice data processed locally (no external services)

## Performance

- **Latency**: <500ms for voice queries
- **Accuracy**: High accuracy with Whisper model
- **Concurrent Users**: Handles multiple simultaneous voice requests

## Use Cases

- **Hands-Free DeFi**: Voice commands for DeFi operations
- **Accessibility**: Voice interface for users with disabilities
- **Mobile Integration**: Voice input on mobile devices
- **Multi-Modal Agents**: Combine voice, text, and image inputs

## Resources

- [Kokoro GitHub](https://github.com/codewithryan/kokoro)
- [Chatterbox GitHub](https://github.com/opentalkz/chatterbox)
- [Whisper Documentation](https://github.com/openai/whisper)

## Next Steps

1. Enable Kokoro/Chatterbox in `.env`
2. Deploy services
3. Access Chatterbox UI
4. Test voice input/output
5. Integrate into agents
6. Define Sei-specific voice intents
