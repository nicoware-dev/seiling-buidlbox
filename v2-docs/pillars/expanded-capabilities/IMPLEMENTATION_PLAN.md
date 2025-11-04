# Expanded Capabilities Implementation Plan

## Overview
Implementation plan for adding extended capabilities to Seiling Buidlbox v2 using Docker containers, following the pattern established in `v2/examples/local-ai-packaged-main`. These capabilities enhance observability, privacy, infrastructure, and multi-modal agent support.

**Reference**: `v2/examples/local-ai-packaged-main/` (implementation patterns)  
**Pattern**: Modular Docker Compose fragments with `ENABLE_*` flags  
**Goal**: Seamless integration with existing Seiling Buidlbox v2 infrastructure

## Current State

### ✅ Already Implemented
- Basic service infrastructure (n8n, OpenWebUI, Flowise, Ollama, etc.)
- Docker Compose modular structure (`docker/services/*.yml`)
- Bootstrap script with `ENABLE_*` flags
- Service deployment automation

### ❌ Not Yet Implemented (Expanded Capabilities)
- **Langfuse** - LLM observability and tracing
- **Prometheus/Grafana** - System monitoring and metrics
- **SearXNG** - Privacy-focused meta-search (basic structure exists)
- **Supabase** - Full BaaS stack (basic structure exists)
- **Kokoro/Chatterbox** - Voice/Audio integration (basic structure exists)
- **Caddy/Cloudflared** - Modern proxy and tunneling

## Reference Implementation: local-ai-packaged-main

### Key Patterns to Follow

#### 1. Docker Compose Structure
- **Service Fragments**: One compose file per service in `docker/services/`
- **Modular Design**: Services can be enabled/disabled via `ENABLE_*` flags
- **Shared Networks**: All services on same Docker network for inter-service communication
- **Volume Management**: Persistent volumes for data storage
- **Health Checks**: Proper health checks for dependency management

#### 2. Environment Variables Pattern
- **Enable Flags**: `ENABLE_SERVICE=yes/no` for each service
- **Configuration**: Service-specific env vars (API keys, passwords, etc.)
- **Profiles**: Optional GPU/CPU profiles for resource-intensive services

#### 3. Integration Scripts
- **Start Script**: Python script for orchestrating service startup
- **Health Checks**: Wait for dependencies before starting dependent services
- **Secret Generation**: Automatic secret/key generation where needed

#### 4. Service Configuration
- **Caddyfile**: Reverse proxy configuration with auto-SSL
- **Settings Files**: Service-specific config files (e.g., `searxng/settings.yml`)
- **Environment Defaults**: Sensible defaults with override capability

## Capabilities to Implement

### 1. Langfuse (LLM Observability)

#### Overview
Open-source LLM engineering platform for tracing, debugging, and monitoring LLM calls across agents (n8n, Flowise, ElizaOS, Cambrian).

#### Docker Implementation
- **File**: `docker/services/docker-compose.langfuse.yml`
- **Services**:
  - `langfuse-web` - Main web UI
  - `langfuse-worker` - Background processing
  - `postgres` - Primary database (shared with Supabase if available)
  - `clickhouse` - Analytics database
  - `redis` - Queue/cache (shared or dedicated)
  - `minio` - S3-compatible storage for events/media

#### Configuration
```yaml
# docker/services/docker-compose.langfuse.yml
services:
  langfuse-web:
    image: langfuse/langfuse:3
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${LANGFUSE_NEXTAUTH_SECRET}
      - SALT=${LANGFUSE_SALT}
      - ENCRYPTION_KEY=${LANGFUSE_ENCRYPTION_KEY}
      - CLICKHOUSE_URL=http://clickhouse:8123
      - CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    expose:
      - 3000/tcp
    depends_on:
      postgres:
        condition: service_healthy
      clickhouse:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy

  langfuse-worker:
    image: langfuse/langfuse-worker:3
    environment:
      # Same as langfuse-web
    depends_on:
      # Same as langfuse-web

  clickhouse:
    image: clickhouse/clickhouse-server
    environment:
      - CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD}
    volumes:
      - langfuse_clickhouse_data:/var/lib/clickhouse
      - langfuse_clickhouse_logs:/var/log/clickhouse-server
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:8123/ping || exit 1

  minio:
    image: minio/minio
    command: server --address ":9000" --console-address ":9001" /data
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - langfuse_minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
```

#### Environment Variables
```bash
ENABLE_LANGFUSE=yes
LANGFUSE_NEXTAUTH_SECRET=<generated>
LANGFUSE_SALT=<generated>
LANGFUSE_ENCRYPTION_KEY=<generated>
CLICKHOUSE_PASSWORD=<generated>
MINIO_ROOT_PASSWORD=<generated>
```

#### Integration Points
- **SDK Integration**: Add Langfuse client to `@seiling/utils`
- **Agent Integration**: Instrument ElizaOS, Cambrian agents
- **n8n Integration**: Langfuse nodes for workflow tracing
- **MCP Integration**: Trace MCP tool calls

#### Port
- **Internal**: 3000 (langfuse-web)
- **External**: Proxied via Caddy/Traefik

### 2. Prometheus/Grafana (System Monitoring)

#### Overview
Metrics collection (Prometheus) and visualization (Grafana) for monitoring services, agents, and blockchain operations.

#### Docker Implementation
- **File**: `docker/services/docker-compose.prometheus-grafana.yml`
- **Services**:
  - `prometheus` - Metrics collection server
  - `grafana` - Dashboard visualization
  - `node-exporter` - Host metrics (optional)

#### Configuration
```yaml
# docker/services/docker-compose.prometheus-grafana.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    expose:
      - 9090/tcp
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_SERVER_ROOT_URL=http://localhost:3001
    volumes:
      - grafana_data:/var/lib/grafana
      - ./docker/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./docker/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    expose:
      - 3000/tcp
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

#### Prometheus Configuration
```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'sei-mcp'
    static_configs:
      - targets: ['seiling-mcp:5004']
    metrics_path: '/metrics'
  
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'
  
  - job_name: 'captain'
    static_configs:
      - targets: ['captain:3001']
    metrics_path: '/metrics'
```

#### Environment Variables
```bash
ENABLE_PROMETHEUS=yes
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<generated>
```

#### Integration Points
- **Metrics Endpoints**: Add `/metrics` to services (MCP, Captain, n8n)
- **Grafana Dashboards**: Pre-configured dashboards for Sei-specific metrics
- **Alerts**: Alert rules for high gas, service downtime, etc.

#### Ports
- **Prometheus**: 9090 (internal)
- **Grafana**: 3000 (internal, proxied)

### 3. SearXNG Enhancement (Privacy Search)

#### Overview
Enhance existing SearXNG integration with custom Sei-specific search engines and improved configuration.

#### Current State
- ✅ Basic SearXNG compose file exists
- ❌ Custom Sei engines not configured
- ❌ Settings not fully optimized

#### Enhancements Needed
- **File**: `docker/services/docker-compose.searxng.yml` (enhance existing)
- **Custom Engines**: Add SeiScan, SeiTrace, DeFiLlama Sei
- **Settings**: Optimize `searxng/settings.yml` for blockchain search

#### Configuration
```yaml
# Enhance existing docker/services/docker-compose.searxng.yml
services:
  searxng:
    image: docker.io/searxng/searxng:latest
    volumes:
      - ./docker/searxng:/etc/searxng:rw
      # Ensure settings.yml includes Sei engines
    environment:
      - SEARXNG_BASE_URL=http://localhost:8080/
```

#### Settings Configuration
```yaml
# docker/searxng/settings.yml
engines:
  - name: seiscan
    engine: seiscan
    shortcut: sc
    base_url: https://seiscan.app
    
  - name: seitrace
    engine: seitrace
    shortcut: st
    base_url: https://seitrace.io
```

#### Environment Variables
```bash
ENABLE_SEARXNG=yes
SEARXNG_SECRET_KEY=<auto-generated>
```

#### Integration Points
- **n8n Node**: SearXNG search node (already planned)
- **OpenWebUI Function**: Web search function
- **Agent Tools**: Search tool for agents

#### Port
- **Internal**: 8080 (proxied)

### 4. Supabase Enhancement (Backend as a Service)

#### Overview
Enhance existing Supabase setup with full stack (Auth, Storage, Realtime) for user management and data persistence.

#### Current State
- ✅ Basic Supabase compose exists (DB + Kong)
- ❌ Missing Auth service
- ❌ Missing Storage service
- ❌ Missing Realtime service
- ❌ Missing full configuration

#### Enhancements Needed
- **File**: `docker/services/docker-compose.supabase.yml` (enhance existing)
- **Full Stack**: Add auth, storage, realtime, studio
- **Configuration**: Proper env setup and migration scripts

#### Reference Pattern
From `local-ai-packaged-main`, Supabase uses:
- Full Supabase docker setup from official repo
- Includes: Kong, Auth, Storage, Realtime, Studio, DB, Analytics
- Requires extensive env configuration

#### Configuration Strategy
**Option A**: Use Supabase Docker repo (like local-ai-packaged)
```bash
# Include Supabase docker repo
include:
  - ./supabase/docker/docker-compose.yml
```

**Option B**: Standalone compose (current approach - enhance)
```yaml
# Enhance docker/services/docker-compose.supabase.yml
services:
  supabase-db:
    # Existing - keep
  supabase-kong:
    # Existing - keep
  supabase-auth:
    image: supabase/gotrue:latest
    # Add auth service
  supabase-storage:
    image: supabase/storage-api:latest
    # Add storage service
  supabase-realtime:
    image: supabase/realtime:latest
    # Add realtime service
  supabase-studio:
    image: supabase/studio:latest
    # Add admin UI
```

#### Environment Variables
```bash
ENABLE_SUPABASE=yes
SUPABASE_DB_PASSWORD=<generated>
SUPABASE_JWT_SECRET=<generated>
SUPABASE_ANON_KEY=<generated>
SUPABASE_SERVICE_ROLE_KEY=<generated>
SUPABASE_DASHBOARD_USERNAME=admin
SUPABASE_DASHBOARD_PASSWORD=<generated>
SUPABASE_POOLER_TENANT_ID=<generated>
```

#### Integration Points
- **Captain UI**: Supabase auth integration
- **Template Store**: Supabase storage for templates
- **n8n**: Supabase nodes for data operations
- **Real-time**: Live updates for service status

#### Ports
- **Kong**: 8000 (API gateway)
- **Studio**: 3000 (admin UI, proxied)

### 5. Kokoro/Chatterbox (Voice/Audio)

#### Overview
Voice-enabled multi-modal agents with TTS/ASR for hands-free Sei interactions.

#### Current State
- ✅ Basic compose file exists (`docker-compose.kokoro-chatterbox.yml`)
- ❌ Needs enhancement with proper configuration
- ❌ Integration points not implemented

#### Enhancements Needed
- **File**: `docker/services/docker-compose.kokoro-chatterbox.yml` (enhance existing)
- **Services**: Ensure Kokoro TTS/ASR and Chatterbox UI are properly configured
- **Integration**: Connect to OpenWebUI and n8n

#### Configuration
```yaml
# Enhance existing docker/services/docker-compose.kokoro-chatterbox.yml
services:
  kokoro:
    image: ghcr.io/codewithryan/kokoro:latest
    # TTS/ASR service
    expose:
      - 3080/tcp
    environment:
      - VOICE_MODEL=${VOICE_MODEL:-whisper}
    
  chatterbox:
    image: ghcr.io/opentalkz/chatterbox:latest
    # Voice-enabled chat UI
    expose:
      - 3008/tcp
    depends_on:
      - kokoro
```

#### Environment Variables
```bash
ENABLE_KOKORO=yes
VOICE_MODEL=whisper
CHATTERBOX_API_KEY=<optional>
```

#### Integration Points
- **OpenWebUI**: Voice input/output integration
- **n8n Node**: Voice I/O node
- **Agent Tools**: Voice-enabled tool calls

#### Port
- **Internal**: 3008 (chatterbox), 3080 (kokoro, proxied)

### 6. Caddy/Cloudflared (Proxy & Tunneling)

#### Overview
Modern reverse proxy (Caddy) with auto-SSL and zero-trust tunneling (Cloudflared) for secure service exposure.

#### Docker Implementation
- **Files**: 
  - `docker/services/docker-compose.caddy.yml`
  - `docker/services/docker-compose.cloudflared.yml` (optional)

#### Caddy Configuration
```yaml
# docker/services/docker-compose.caddy.yml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - 80:80/tcp
      - 443:443/tcp
    volumes:
      - ./docker/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    environment:
      - N8N_HOSTNAME=${N8N_HOSTNAME:-:8001}
      - WEBUI_HOSTNAME=${WEBUI_HOSTNAME:-:8002}
      - CAPTAIN_HOSTNAME=${CAPTAIN_HOSTNAME:-:8003}
      - LANGFUSE_HOSTNAME=${LANGFUSE_HOSTNAME:-:8004}
      - GRAFANA_HOSTNAME=${GRAFANA_HOSTNAME:-:8005}
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

#### Caddyfile Template
```caddyfile
# docker/caddy/Caddyfile
{
    email ${LETSENCRYPT_EMAIL:-internal}
    auto_https disable_redirects
}

# N8N
{$N8N_HOSTNAME} {
    reverse_proxy n8n:5678
}

# OpenWebUI
{$WEBUI_HOSTNAME} {
    reverse_proxy openwebui:8080
}

# Captain
{$CAPTAIN_HOSTNAME} {
    reverse_proxy captain:3001
}

# Langfuse
{$LANGFUSE_HOSTNAME} {
    reverse_proxy langfuse-web:3000
}

# Grafana
{$GRAFANA_HOSTNAME} {
    reverse_proxy grafana:3000
}

# Add security headers
header {
    Strict-Transport-Security "max-age=31536000;"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
}
```

#### Cloudflared Configuration (Optional)
```yaml
# docker/services/docker-compose.cloudflared.yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARED_TUNNEL_TOKEN}
    restart: unless-stopped
```

#### Environment Variables
```bash
ENABLE_CADDY=yes
ENABLE_CLOUDFLARED=no  # Optional
N8N_HOSTNAME=:8001  # Port number or domain
WEBUI_HOSTNAME=:8002
CAPTAIN_HOSTNAME=:8003
LANGFUSE_HOSTNAME=:8004
GRAFANA_HOSTNAME=:8005
LETSENCRYPT_EMAIL=your-email@example.com  # For SSL certs
CLOUDFLARED_TUNNEL_TOKEN=<from-cloudflare-dashboard>
```

#### Integration Points
- **Service Routing**: Route all services through Caddy
- **SSL**: Automatic HTTPS certificates via Let's Encrypt
- **Security**: Security headers, rate limiting

#### Ports
- **Caddy**: 80 (HTTP), 443 (HTTPS)
- **Cloudflared**: No exposed ports (tunnel only)

## Implementation Phases

### Phase 1: Foundation Services (Week 1-2)

#### Week 1: Observability Stack
1. ✅ Review existing service structure
2. ❌ Create `docker/services/docker-compose.langfuse.yml`
3. ❌ Create `docker/services/docker-compose.prometheus-grafana.yml`
4. ❌ Create `docker/prometheus/prometheus.yml` configuration
5. ❌ Create `docker/grafana/` directory structure with dashboards
6. ❌ Add Langfuse volumes to main compose
7. ❌ Add Prometheus/Grafana volumes to main compose
8. ❌ Update bootstrap script to support new services
9. ❌ Generate required secrets in env setup

#### Week 2: Testing & Integration
10. ❌ Test Langfuse startup and health
11. ❌ Test Prometheus scraping
12. ❌ Create basic Grafana dashboards
13. ❌ Add metrics endpoints to existing services
14. ❌ Test SDK integration with Langfuse

### Phase 2: Privacy & Search (Week 3)

#### Week 3: SearXNG Enhancement
15. ❌ Enhance existing SearXNG compose file
16. ❌ Create/update `docker/searxng/settings.yml` with Sei engines
17. ❌ Add custom Sei search engine configurations
18. ❌ Test SearXNG with custom engines
19. ❌ Update integration documentation

### Phase 3: Backend Services (Week 4-5)

#### Week 4: Supabase Enhancement
20. ❌ Review Supabase Docker repo structure (if using repo approach)
21. ❌ Enhance existing Supabase compose or integrate repo
22. ❌ Add Auth, Storage, Realtime services
23. ❌ Configure Supabase Studio
24. ❌ Set up migration scripts
25. ❌ Generate all required Supabase secrets

#### Week 5: Supabase Integration
26. ❌ Test Supabase stack startup
27. ❌ Create Supabase client in `@seiling/utils`
28. ❌ Integrate Supabase auth in Captain
29. ❌ Test storage for template store
30. ❌ Test realtime subscriptions

### Phase 4: Voice & Proxy (Week 6-7)

#### Week 6: Voice Integration
31. ❌ Enhance Kokoro/Chatterbox compose file
32. ❌ Configure voice models and settings
33. ❌ Test voice services startup
34. ❌ Create integration with OpenWebUI
35. ❌ Test voice input/output

#### Week 7: Proxy & Tunneling
36. ❌ Create Caddy compose file
37. ❌ Create Caddyfile template
38. ❌ Configure reverse proxy for all services
39. ❌ Test SSL certificate generation
40. ❌ Create Cloudflared compose (optional)
41. ❌ Test Cloudflared tunnel (optional)

### Phase 5: Integration & Documentation (Week 8)

#### Week 8: Final Integration
42. ❌ Integrate Langfuse SDK into agents
43. ❌ Add Prometheus metrics to all services
44. ❌ Create Grafana dashboards for Sei-specific metrics
45. ❌ Update all service documentation
46. ❌ Create integration guides
47. ❌ Test complete stack deployment
48. ❌ Update bootstrap script completion message

## Bootstrap Script Updates

### Service Mapping
Add to `scripts/bootstrap/deploy_services.sh`:
```bash
get_service_file_base() {
  local service="$1"
  case "$service" in
    # ... existing mappings ...
    LANGFUSE) echo "langfuse" ;;
    PROMETHEUS) echo "prometheus-grafana" ;;
    CADDY) echo "caddy" ;;
    CLOUDFLARED) echo "cloudflared" ;;
    # ... rest ...
  esac
}
```

### Environment Configuration
Add to `scripts/bootstrap/configure_env.sh`:
- Secret generation for Langfuse, Supabase, Grafana
- Caddy hostname configuration
- Cloudflared token input (if enabled)

### Health Checks
Add to `scripts/bootstrap/health_check.sh`:
- Langfuse health check
- Prometheus health check
- Grafana health check
- Supabase services health checks

## Docker Volume Management

### Volumes to Add
```yaml
# In main docker-compose.yml or service-specific files
volumes:
  # Langfuse
  langfuse_postgres_data:
  langfuse_clickhouse_data:
  langfuse_clickhouse_logs:
  langfuse_minio_data:
  
  # Prometheus/Grafana
  prometheus_data:
  grafana_data:
  
  # Caddy
  caddy_data:
  caddy_config:
  
  # Supabase (if not using repo)
  supabase_auth_data:
  supabase_storage_data:
```

## Environment Variables Summary

### New Variables to Add
```bash
# Langfuse
ENABLE_LANGFUSE=no
LANGFUSE_NEXTAUTH_SECRET=
LANGFUSE_SALT=
LANGFUSE_ENCRYPTION_KEY=
CLICKHOUSE_PASSWORD=
MINIO_ROOT_PASSWORD=

# Prometheus/Grafana
ENABLE_PROMETHEUS=no
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=

# SearXNG (enhancement)
SEARXNG_SECRET_KEY=

# Supabase (enhancement)
SUPABASE_JWT_SECRET=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DASHBOARD_USERNAME=admin
SUPABASE_DASHBOARD_PASSWORD=
SUPABASE_POOLER_TENANT_ID=

# Kokoro (enhancement)
VOICE_MODEL=whisper

# Caddy
ENABLE_CADDY=no
N8N_HOSTNAME=:8001
WEBUI_HOSTNAME=:8002
CAPTAIN_HOSTNAME=:8003
LANGFUSE_HOSTNAME=:8004
GRAFANA_HOSTNAME=:8005
LETSENCRYPT_EMAIL=

# Cloudflared (optional)
ENABLE_CLOUDFLARED=no
CLOUDFLARED_TUNNEL_TOKEN=
```

## Integration with Existing Services

### Captain Integration
- **Supabase Auth**: User authentication
- **Grafana**: Link to monitoring dashboards
- **Service Status**: Real-time updates via Supabase Realtime

### n8n Integration
- **Langfuse Node**: Trace workflow executions
- **SearXNG Node**: Web search capability
- **Supabase Nodes**: Data operations
- **Prometheus Node**: Metrics export

### Agent Integration (ElizaOS/Cambrian)
- **Langfuse SDK**: Automatic tracing of LLM calls
- **SearXNG Tool**: Search tool for agents
- **Supabase Tools**: Data persistence tools

### MCP Integration
- **Langfuse Tracing**: Trace MCP tool calls
- **Metrics Export**: Export MCP metrics to Prometheus

## Security Considerations

### Secrets Management
1. **Auto-generation**: Generate secrets automatically during bootstrap
2. **Storage**: Store in `.env` file (gitignored)
3. **Rotation**: Document secret rotation procedures
4. **Validation**: Validate secret complexity/strength

### Network Security
1. **Internal Only**: Services expose ports internally only
2. **Reverse Proxy**: All external access through Caddy
3. **Firewall**: Close unnecessary ports in public deployments
4. **TLS**: Force HTTPS via Caddy

### Access Control
1. **Supabase RLS**: Row-level security policies
2. **Grafana Auth**: Admin credentials required
3. **Langfuse Auth**: NextAuth authentication
4. **API Keys**: Optional API keys for external access

## Testing Strategy

### Unit Testing
- Docker Compose config validation
- Environment variable validation
- Health check scripts

### Integration Testing
- Service startup and dependency resolution
- Inter-service communication
- Health check endpoints

### End-to-End Testing
- Full stack deployment
- Service discovery
- Metrics collection
- Tracing functionality

## Documentation Requirements

### Service Documentation
1. **README Updates**: Add each service to main README
2. **Service-Specific Docs**: Individual docs for each capability
3. **Configuration Guides**: Step-by-step setup guides
4. **Integration Examples**: Code examples for integration

### API Documentation
1. **Langfuse API**: How to use Langfuse SDK
2. **Prometheus Metrics**: Available metrics endpoints
3. **Supabase API**: Client usage examples
4. **SearXNG API**: Search query examples

### Troubleshooting Guides
1. **Common Issues**: Service startup problems
2. **Health Checks**: How to verify services are running
3. **Debugging**: Log locations and debugging tips

## Success Criteria

- [ ] All expanded capabilities services deployable via `ENABLE_*` flags
- [ ] Langfuse tracing working across all agents
- [ ] Prometheus collecting metrics from all services
- [ ] Grafana dashboards showing Sei-specific metrics
- [ ] SearXNG with custom Sei engines functional
- [ ] Supabase full stack (auth/storage/realtime) working
- [ ] Kokoro/Chatterbox voice integration functional
- [ ] Caddy reverse proxy routing all services
- [ ] All services accessible via HTTPS (if Caddy enabled)
- [ ] Bootstrap script handles all new services
- [ ] Documentation complete for all capabilities

## Known Challenges & Mitigations

### Challenge 1: Resource Requirements
- **Issue**: Multiple services require significant resources
- **Mitigation**: Services are optional (ENABLE_* flags), resource profiling

### Challenge 2: Secret Management
- **Issue**: Many services require generated secrets
- **Mitigation**: Auto-generation in bootstrap script, secure storage

### Challenge 3: Dependency Complexity
- **Issue**: Services depend on each other (e.g., Langfuse needs Postgres)
- **Mitigation**: Proper health checks, dependency ordering in compose

### Challenge 4: Configuration Complexity
- **Issue**: Complex service configurations (Supabase, Langfuse)
- **Mitigation**: Sensible defaults, clear documentation, example configs

### Challenge 5: Port Conflicts
- **Issue**: Multiple services want same ports
- **Mitigation**: Internal ports only, reverse proxy for external access

## File Structure After Implementation

```
docker/
├── services/
│   ├── docker-compose.langfuse.yml (❌ TODO)
│   ├── docker-compose.prometheus-grafana.yml (❌ TODO)
│   ├── docker-compose.searxng.yml (✅ exists, enhance)
│   ├── docker-compose.supabase.yml (✅ exists, enhance)
│   ├── docker-compose.kokoro-chatterbox.yml (✅ exists, enhance)
│   ├── docker-compose.caddy.yml (❌ TODO)
│   └── docker-compose.cloudflared.yml (❌ TODO - optional)
├── prometheus/
│   └── prometheus.yml (❌ TODO)
├── grafana/
│   ├── dashboards/ (❌ TODO)
│   └── datasources/ (❌ TODO)
├── caddy/
│   └── Caddyfile (❌ TODO)
└── searxng/
    └── settings.yml (❌ TODO - enhance)

scripts/bootstrap/
├── deploy_services.sh (❌ TODO - update service mapping)
├── configure_env.sh (❌ TODO - add secret generation)
└── health_check.sh (❌ TODO - add new health checks)

packages/@seiling/utils/
└── src/
    ├── langfuseClient.ts (❌ TODO)
    └── supabaseClient.ts (✅ exists, may enhance)

env-example.env (❌ TODO - add new variables)
```

## Migration Notes

- **Backward Compatible**: All new services are optional via ENABLE_* flags
- **Existing Services**: No changes to existing service configurations
- **Environment**: New variables added with defaults
- **Bootstrap**: Enhanced but backward compatible

## Next Steps

1. Review and approve this plan
2. Start Phase 1 implementation (Observability Stack)
3. Test each phase before moving to next
4. Document as you go
5. Iterate based on feedback

---

## Implementation Status

### ✅ Completed (All Services Implemented)

All expanded capabilities have been successfully implemented:

1. **Langfuse** - ✅ Complete
   - Docker compose with web, worker, ClickHouse, MinIO
   - Configuration files created
   - Bootstrap script integration
   - Health checks implemented

2. **Prometheus/Grafana** - ✅ Complete
   - Docker compose with Prometheus and Grafana
   - Prometheus configuration with scrape jobs
   - Grafana provisioning for datasources and dashboards
   - Bootstrap script integration

3. **SearXNG** - ✅ Complete
   - Enhanced compose file with proper configuration
   - Sei-specific search engines configured
   - Settings file with custom engines

4. **Supabase** - ✅ Complete
   - Full stack implementation (DB, Kong, Auth, Storage, Realtime, Studio)
   - Kong configuration file
   - All secrets generation
   - Health checks for all services

5. **Kokoro/Chatterbox** - ✅ Complete
   - Voice services compose file
   - TTS/ASR configuration
   - Health checks

6. **Caddy** - ✅ Complete
   - Reverse proxy compose file
   - Caddyfile with service routing
   - SSL configuration

7. **Cloudflared** - ✅ Complete
   - Optional tunneling service
   - Token-based configuration

### Documentation

- ✅ All service documentation updated
- ✅ README.md updated with new services
- ✅ docker/README.md updated
- ✅ Individual service guides created
- ✅ Configuration examples provided

**Ready to use extended capabilities! 🚀**

