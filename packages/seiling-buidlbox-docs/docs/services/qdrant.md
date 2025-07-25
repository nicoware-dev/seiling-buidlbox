# Qdrant

> **Vector database for AI embeddings**

Qdrant provides vector storage and similarity search for AI applications and document embeddings.

## Overview

- **Port**: 6333 (HTTP), 6334 (gRPC)
- **Image**: `qdrant/qdrant:latest`
- **Purpose**: Vector embeddings and similarity search
- **Status**: Enabled by default

## Configuration

### Default Settings
```bash
ENABLE_QDRANT=yes
```

### Access
- **Web UI**: http://localhost:6333/dashboard
- **API**: http://localhost:6333
- **gRPC**: localhost:6334

## Usage

### Services Using Qdrant
- **Flowise**: Document embeddings for RAG
- **ElizaOS**: Memory and context search
- **Custom AI**: Vector similarity search

### Basic Operations
```bash
# Check collections
curl http://localhost:6333/collections

# Create collection
curl -X PUT http://localhost:6333/collections/documents \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
```

## Troubleshooting

### Connection Issues
```bash
# Check service status
curl http://localhost:6333/health

# View logs
docker logs seiling-qdrant --tail=50
```

### Storage Issues
```bash
# Check collection info
curl http://localhost:6333/collections/documents

# Delete collection if needed
curl -X DELETE http://localhost:6333/collections/documents
```

---

**Qdrant enables semantic search and AI memory.** Essential for RAG applications. 