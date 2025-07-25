# PostgreSQL

> **Primary database for data persistence**

PostgreSQL serves as the main database for all Seiling services, providing reliable data storage and advanced querying capabilities.

## Overview

- **Port**: 5432
- **Image**: `postgres:16-alpine`
- **Purpose**: Primary data storage
- **Status**: Always enabled (required)

## Configuration

### Default Settings
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=seiling123
POSTGRES_DB=seiling
```

### Connection Details
- **Host**: `seiling-postgres` (internal) / `localhost` (external)
- **Port**: 5432
- **Database**: seiling
- **User**: postgres

## Usage

### Services Using PostgreSQL
- **n8n**: Workflow data and execution history
- **ElizaOS**: Memory and conversation storage
- **Cambrian**: Portfolio and trading data
- **OpenWebUI**: User data and chat history

### Direct Access
```bash
# Connect to database
docker exec -it seiling-postgres psql -U postgres -d seiling

# Run queries
SELECT * FROM n8n_workflows;
SELECT * FROM eliza_memories;
```

### Backup and Restore
```bash
# Create backup
docker exec seiling-postgres pg_dump -U postgres seiling > backup.sql

# Restore backup
docker exec -i seiling-postgres psql -U postgres seiling < backup.sql
```

## Database Schema

### n8n Tables
- `n8n_workflows`: Workflow definitions
- `n8n_executions`: Execution history
- `n8n_credentials`: Stored credentials

### ElizaOS Tables
- `memories`: Conversation memory
- `goals`: Agent objectives
- `relationships`: User relationships

### Cambrian Tables
- `portfolios`: Portfolio data
- `trades`: Trading history
- `strategies`: Trading strategies

## Monitoring

### Health Check
```bash
# Check if PostgreSQL is ready
docker exec seiling-postgres pg_isready -U postgres

# View active connections
docker exec seiling-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Performance
```bash
# Database size
docker exec seiling-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('seiling'));"

# Table sizes
docker exec seiling-postgres psql -U postgres -d seiling -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## Maintenance

### Regular Tasks
```bash
# Analyze tables (weekly)
docker exec seiling-postgres psql -U postgres -d seiling -c "ANALYZE;"

# Vacuum database (monthly)
docker exec seiling-postgres psql -U postgres -d seiling -c "VACUUM;"

# Update statistics
docker exec seiling-postgres psql -U postgres -d seiling -c "VACUUM ANALYZE;"
```

### Log Management
```bash
# View logs
docker logs seiling-postgres

# Check slow queries
docker exec seiling-postgres psql -U postgres -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Troubleshooting

### Connection Issues
```bash
# Check if service is running
docker ps | grep postgres

# Check logs for errors
docker logs seiling-postgres --tail=50

# Test connection
docker exec seiling-postgres pg_isready -U postgres
```

### Performance Issues
```bash
# Check active connections
docker exec seiling-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check blocking queries
docker exec seiling-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Storage Issues
```bash
# Check disk usage
docker exec seiling-postgres df -h

# Check database size
docker exec seiling-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('seiling'));"
```

### Recovery
```bash
# Restart PostgreSQL
docker restart seiling-postgres

# Reset database (WARNING: loses all data)
docker compose down
docker volume rm seiling-buidlbox_postgres_data
docker compose up -d
```

## Security

### Production Recommendations
- Change default password
- Restrict network access
- Enable SSL connections
- Regular security updates
- Backup encryption

### Access Control
```sql
-- Create read-only user
CREATE USER readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE seiling TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```

---

**PostgreSQL is the foundation of data persistence.** All services depend on it for reliable data storage. 