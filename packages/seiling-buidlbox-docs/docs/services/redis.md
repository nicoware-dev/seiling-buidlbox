# Redis

> **Cache and session storage**

Redis provides high-performance caching and session management for all Seiling services.

## Overview

- **Port**: 6379
- **Image**: `redis:7-alpine`
- **Purpose**: Caching and session storage
- **Status**: Always enabled (required)

## Configuration

### Default Settings
```bash
REDIS_PASSWORD=seiling123
```

### Connection Details
- **Host**: `seiling-redis` (internal) / `localhost` (external)
- **Port**: 6379
- **Password**: seiling123

## Usage

### Services Using Redis
- **OpenWebUI**: Session management
- **Flowise**: Memory and conversation context
- **n8n**: Execution caching
- **ElizaOS**: Temporary data storage

### Direct Access
```bash
# Connect to Redis
docker exec -it seiling-redis redis-cli -a seiling123

# Basic commands
PING
KEYS *
INFO memory
```

## Common Operations

### Cache Management
```bash
# View all keys
docker exec seiling-redis redis-cli -a seiling123 KEYS "*"

# Check memory usage
docker exec seiling-redis redis-cli -a seiling123 INFO memory

# Clear all data (WARNING: loses cache)
docker exec seiling-redis redis-cli -a seiling123 FLUSHALL
```

### Monitoring
```bash
# Monitor commands in real-time
docker exec seiling-redis redis-cli -a seiling123 MONITOR

# Check connected clients
docker exec seiling-redis redis-cli -a seiling123 CLIENT LIST
```

## Troubleshooting

### Connection Issues
```bash
# Test Redis connection
docker exec seiling-redis redis-cli -a seiling123 PING

# Check service logs
docker logs seiling-redis --tail=50
```

### Performance Issues
```bash
# Check memory usage
docker exec seiling-redis redis-cli -a seiling123 INFO memory

# View slow queries
docker exec seiling-redis redis-cli -a seiling123 SLOWLOG GET 10
```

### Recovery
```bash
# Restart Redis
docker restart seiling-redis

# Clear cache if needed
docker exec seiling-redis redis-cli -a seiling123 FLUSHALL
```

---

**Redis ensures fast data access and session management.** Critical for system performance. 