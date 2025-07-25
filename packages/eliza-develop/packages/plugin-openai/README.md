# OpenAI Plugin

This plugin provides integration with OpenAI's models through the ElizaOS platform.

## Usage

Add the plugin to your character configuration:

```json
"plugins": ["@elizaos-plugins/plugin-openai"]
```

## Configuration

The plugin requires these environment variables (can be set in .env file or character settings):

```json
"settings": {
  "OPENAI_API_KEY": "your_openai_api_key",
  "OPENAI_BASE_URL": "optional_custom_endpoint",
  "OPENAI_SMALL_MODEL": "gpt-4o-mini",
  "OPENAI_LARGE_MODEL": "gpt-4o",
  "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small",
  "OPENAI_EMBEDDING_API_KEY": "your_openai_api_key_for_embedding",
  "OPENAI_EMBEDDING_URL": "optional_custom_endpoint",
  "OPENAI_EMBEDDING_DIMENSIONS": "1536",
  "OPENAI_IMAGE_DESCRIPTION_MODEL": "gpt-4o-mini",
  "OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS": "8192"
}
```

Or in `.env` file:

```
OPENAI_API_KEY=your_openai_api_key
# Optional overrides:
OPENAI_BASE_URL=optional_custom_endpoint
OPENAI_SMALL_MODEL=gpt-4o-mini
OPENAI_LARGE_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_API_KEY=your_openai_api_key_for_embedding
OPENAI_EMBEDDING_URL=optional_custom_endpoint
OPENAI_EMBEDDING_DIMENSIONS=1536
OPENAI_IMAGE_DESCRIPTION_MODEL=gpt-4o-mini
OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS=8192
```

### Configuration Options

- `OPENAI_API_KEY` (required): Your OpenAI API credentials
- `OPENAI_BASE_URL`: Custom API endpoint (default: https://api.openai.com/v1)
- `OPENAI_SMALL_MODEL`: Defaults to GPT-4o Mini ("gpt-4o-mini")
- `OPENAI_LARGE_MODEL`: Defaults to GPT-4o ("gpt-4o")
- `OPENAI_EMBEDDING_MODEL`: Defaults to text-embedding-3-small ("text-embedding-3-small")
- `OPENAI_EMBEDDING_API_KEY`: Custom embedding api key (defaults to `OPENAI_API_KEY`)
- `OPENAI_EMBEDDING_URL`: Custom embedding endpoint (defaults to `OPENAI_BASE_URL`)
- `OPENAI_EMBEDDING_DIMENSIONS`: Defaults to 1536 (1536)
- `OPENAI_IMAGE_DESCRIPTION_MODEL`: Model used for image description (default: "gpt-4o-mini")
- `OPENAI_IMAGE_DESCRIPTION_MAX_TOKENS`: Maximum tokens for image descriptions (default: 8192)

The plugin provides these model classes:

- `TEXT_SMALL`: Optimized for fast, cost-effective responses
- `TEXT_LARGE`: For complex tasks requiring deeper reasoning
- `TEXT_EMBEDDING`: Text embedding model (text-embedding-3-small by default)
- `IMAGE`: DALL-E image generation
- `IMAGE_DESCRIPTION`: GPT-4o image analysis
- `TRANSCRIPTION`: Whisper audio transcription
- `TEXT_TOKENIZER_ENCODE`: Text tokenization
- `TEXT_TOKENIZER_DECODE`: Token decoding

## Additional Features

### Image Generation

```js
await runtime.useModel(ModelType.IMAGE, {
  prompt: 'A sunset over mountains',
  n: 1, // number of images
  size: '1024x1024', // image resolution
});
```

### Audio Transcription

```js
const transcription = await runtime.useModel(ModelType.TRANSCRIPTION, audioBuffer);
```

### Image Analysis

```js
const { title, description } = await runtime.useModel(
  ModelType.IMAGE_DESCRIPTION,
  'https://example.com/image.jpg'
);
```

### Text Embeddings

```js
const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, 'text to embed');
```
