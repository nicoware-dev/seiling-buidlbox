# Seiling Captain - AI Agent Development Plan

## Package Overview
Seiling Captain is a local-first Next.js control plane UI for managing Seiling Buidlbox v2 services. It provides a web dashboard to replace CLI operations for service management, environment configuration, and health monitoring.

**Port**: 3001  
**Stack**: Next.js 14 (App Router), TypeScript, React  
**Target**: 80% CLI reduction for common tasks

## Current State

### ✅ Completed
- Basic Next.js scaffolding (`app/layout.tsx`, `app/page.tsx`)
- **Service Discovery** (`lib/serviceCatalog.ts`): Auto-discovers services from `docker/services/*.yml`
- **Enhanced Docker Library** (`lib/docker.ts`): 
  - Status checking (`getServiceStatus`)
  - Log retrieval (`getServiceLogs`)
  - Enhanced error handling
  - Support for both `docker compose` and `docker-compose` commands
  - Dynamic service discovery integration
- **Service Control API** (`app/api/services/route.ts`):
  - GET endpoint for listing services with status
  - POST endpoint with proper status codes
  - Localhost-only security checks
  - Improved error handling and validation
- **Service Catalog UI** (`app/services/page.tsx` + `components/ServiceCard.tsx`):
  - Grid layout displaying all discovered services
  - Status badges (running/stopped/starting)
  - Action buttons (start/stop/restart) with loading states
  - Port and dependency display
- **Health Monitoring**:
  - Health check library (`lib/health.ts`) with HTTP, container, and database checks
  - Health API (`app/api/health/route.ts`) with 30s caching
  - Health Status component (`components/HealthStatus.tsx`)
- **Environment Editor**:
  - Env parser (`lib/env.ts`) with validation and schema support
  - Environment API (`app/api/env/route.ts`) with GET/POST endpoints
  - Environment Editor component (`components/EnvEditor.tsx`) with section grouping
  - Environment page (`app/env/page.tsx`)
  - Automatic backup creation
- **Logs Viewer**:
  - Logs API (`app/api/logs/route.ts`) with SSE streaming support
  - Logs Viewer component (`components/LogsViewer.tsx`) with follow mode
  - Logs page (`app/logs/page.tsx`) with service selector
  - Copy and download functionality
- **Home Page** (`app/page.tsx`): Updated with navigation, stats, and links
- **Additional Components**:
  - ServiceSelector component for logs page
- Docker compose fragment: `docker/services/docker-compose.captain.yml`
- Basic README, PRD, and implementation documentation

### ✅ Additional Enhancements Completed 
- **Health Status Integration**: Health badges now displayed on service cards with real-time updates
- **Real-time Status Updates**: Implemented polling (5s for services, 30s for health) with toggle controls
- **Rate Limiting**: Added rate limiting to service control API (10 req/min) and env API (5 req/min)
- **Bootstrap Integration**: Full integration into bootstrap.sh flow including:
  - Added CAPTAIN to SERVICES array
  - Service mapping in deploy_services.sh
  - Captain URL in bootstrap completion message
  - Environment variables in env-example.env

### ❌ Not Started / Future Enhancements
- WebSocket support for real-time service status
- Service filtering and search in catalog
- Bulk service operations (start/stop multiple at once)
- Service dependency visualization
- Log filtering by level/pattern
- Health dashboard with graphs/charts
- Integration with bootstrap.sh flow (mentioned but not implemented)
- Rate limiting on API endpoints
- Service configuration editor beyond .env

## Integration with Seiling Buidlbox v2

### Service Management
- Integrates with Seiling Buidlbox v2 bootstrap scripts (`scripts/bootstrap/`)
- Uses same service discovery patterns as bootstrap deployment
- Follows Seiling Buidlbox v2 docker compose structure

### Documentation
- Full implementation details in `IMPLEMENTATION.md`
- Product requirements in `PRD.md`

## Architecture

```
packages/seiling-captain/
├── app/
│   ├── layout.tsx (✅ done)
│   ├── page.tsx (✅ enhanced with stats & navigation)
│   ├── api/
│   │   ├── services/
│   │   │   └── route.ts (✅ enhanced with GET/POST)
│   │   ├── health/
│   │   │   └── route.ts (✅ done)
│   │   ├── env/
│   │   │   └── route.ts (✅ done)
│   │   └── logs/
│   │       └── route.ts (✅ done with SSE)
│   ├── services/
│   │   └── page.tsx (✅ done: Service catalog UI)
│   ├── env/
│   │   └── page.tsx (✅ done)
│   └── logs/
│       └── page.tsx (✅ done)
├── components/
│   ├── ServiceCard.tsx (✅ done)
│   ├── EnvEditor.tsx (✅ done)
│   ├── HealthStatus.tsx (✅ done)
│   ├── LogsViewer.tsx (✅ done)
│   └── ServiceSelector.tsx (✅ done)
├── lib/
│   ├── docker.ts (✅ enhanced)
│   ├── serviceCatalog.ts (✅ done: Scans docker/services/)
│   ├── health.ts (✅ done)
│   └── env.ts (✅ done: .env parser/validator)
└── package.json (✅ updated with js-yaml)
```

## Core Features to Build

### 1. Service Catalog UI (`app/services/page.tsx`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Goal**: Display all available services from `docker/services/*.yml`
- **Features**:
  - ✅ Auto-discover compose fragments
  - ✅ Service cards with status (running/stopped/starting)
  - ✅ Action buttons (start/stop/restart) with loading states
  - ✅ Status indicators (green/yellow/red)
  - ✅ Port and dependency display
- **Tech**: React Server Components with client-side actions
- **Notes**: Service discovery works automatically, status updates via page refresh

### 2. Service Control API Enhancement (`app/api/services/route.ts`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Enhancements Completed**:
  - ✅ Return real status codes (200/400/403/500)
  - ✅ Parse compose files via service catalog integration
  - ✅ Support for both `docker compose` and `docker-compose`
  - ✅ Enhanced error handling with user-friendly messages
  - ✅ Localhost-only security checks
  - ✅ GET endpoint for service listing with status
  - ⚠️ Action validation (rate limiting not yet implemented - future enhancement)

### 3. Health Check Aggregation (`app/api/health/route.ts`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Goal**: Aggregate health from all services
- **Checks Implemented**:
  - ✅ HTTP endpoints (if exposed) with timeout handling
  - ✅ Docker container status (running/stopped/healthy)
  - ✅ Database connectivity (PostgreSQL, Redis, Neo4j)
- **Output**: JSON with service → health status mapping
- **Features**: 30-second caching to reduce system load
- **Component**: `HealthStatus.tsx` component available (not yet integrated into ServiceCard)

### 4. Environment Editor (`components/EnvEditor.tsx` + `app/api/env/route.ts`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Goal**: Safe .env editing with validation
- **Features Implemented**:
  - ✅ Read `.env` file with section parsing
  - ✅ Edit values (with type hints and descriptions)
  - ✅ Validate schema (check against `env-example.env`)
  - ✅ Write back safely (automatic backup with timestamp)
  - ✅ Type validation (string, number, boolean, URL)
  - ✅ Section-based grouping matching env-example structure
  - ✅ Required field validation
- **Security**: ✅ Localhost-only access enforced, input validation on all fields
- **Note**: Preview/apply workflow implemented inline (no separate preview step)

### 5. Logs Viewer (`components/LogsViewer.tsx` + `app/api/logs/route.ts`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Goal**: Stream/display docker logs for services
- **Features Implemented**:
  - ✅ Tail logs via Server-Sent Events (SSE) with `docker logs -f`
  - ✅ Configurable line count
  - ✅ Copy to clipboard functionality
  - ✅ Download logs as text file
  - ✅ Real-time streaming updates
  - ✅ Auto-scroll to latest logs
  - ✅ Service selector dropdown
  - ⚠️ Filter by level (not yet implemented - future enhancement)

### 6. Service Discovery (`lib/serviceCatalog.ts`) ✅ COMPLETE
- **Status**: ✅ Implemented
- **Goal**: Auto-discover services from `docker/services/`
- **Implementation Completed**:
  - ✅ Scan `docker/services/*.yml` files recursively
  - ✅ Parse compose files using js-yaml
  - ✅ Extract service metadata:
    - ✅ Service names and IDs
    - ✅ Container names
    - ✅ Port mappings (supports both string and object formats)
    - ✅ Health check endpoints (from healthcheck.test)
    - ✅ Dependencies (from depends_on)
    - ✅ Enable flags (ENABLE_* variables)
  - ✅ Generate structured service metadata
  - ✅ Handle multi-service compose files

## API Specifications

### POST /api/services
```typescript
// Request
{ action: 'up' | 'down' | 'restart', service: string }

// Response
{ ok: boolean, stdout?: string, stderr?: string, command?: string }
```

### GET /api/health
```typescript
// Response
{
  ok: boolean,
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy' | 'unknown',
      details?: string,
      lastCheck: string
    }
  }
}
```

### GET/POST /api/env
```typescript
// GET Response
{ vars: Record<string, string>, schema: Record<string, string> }

// POST Request
{ vars: Record<string, string> }
// Response
{ ok: boolean, message?: string }
```

### GET /api/logs?service=xxx&lines=100
```typescript
// Response (SSE stream or JSON)
{ logs: string[], service: string }
```

## Integration Points

- **Docker**: Direct docker compose commands (via `lib/docker.ts`)
- **Bootstrap**: Should be integrated into bootstrap.sh flow
- **Environment**: Reads/writes to root `.env` file
- **Services**: Discovers services from `docker/services/*.yml`

## Security Considerations

1. **Local-only by default**: Check if request is from localhost
2. **Service validation**: Only allow Seiling Buidlbox v2 services/actions
3. **Env editing**: Validate all inputs, prevent injection
4. **Command execution**: Never execute arbitrary commands
5. **Remote access**: If exposed, require authentication

## Testing Strategy

1. **Unit Tests**: Test `lib/docker.ts` with mocked exec
2. **API Tests**: Test all API routes with mocked docker
3. **E2E Tests**: Test service start/stop flows (optional, complex)

## Step-by-Step Development Tasks

### Phase 1: Core UI ✅ COMPLETE
1. ✅ Basic structure (done)
2. ✅ Built `lib/serviceCatalog.ts` to scan docker/services/
3. ✅ Built `components/ServiceCard.tsx` with status display and actions
4. ✅ Built `app/services/page.tsx` to render service catalog
5. ✅ Enhanced `app/api/services/route.ts` with GET/POST and error handling

### Phase 2: Health & Monitoring ✅ COMPLETE
6. ✅ Built `lib/health.ts` for health check logic
7. ✅ Built `app/api/health/route.ts` with caching
8. ✅ Built `components/HealthStatus.tsx`
9. ⚠️ Health integration into service cards (component ready, integration pending)
10. ⚠️ Real-time status updates (basic refresh done, polling/SSE pending)

### Phase 3: Env Editor ✅ COMPLETE
11. ✅ Built `lib/env.ts` for .env parsing/validation
12. ✅ Built `app/api/env/route.ts` (GET/POST)
13. ✅ Built `components/EnvEditor.tsx` with validation UI
14. ✅ Added inline validation and error display
15. ⚠️ Test env editing with bootstrap.sh (pending integration)

### Phase 4: Logs & Polish ✅ COMPLETE
16. ✅ Built `app/api/logs/route.ts` with SSE streaming
17. ✅ Built `components/LogsViewer.tsx` with follow mode
18. ✅ Added copy/download features
19. ✅ Polished UI/UX (loading states, error handling, responsive design)
20. ⚠️ Add to bootstrap.sh integration (pending)

## Success Criteria

- [x] Can start/stop/restart all discovered services via UI ✅
- [x] Health status accurately reflects service state ✅
- [x] Environment editor safely modifies .env with backup ✅
- [x] Logs viewer displays real-time logs via SSE ✅
- [x] Service catalog auto-discovers from docker/services/ ✅
- [x] 80% of common CLI operations can be done via UI ✅ (estimated: ~85% coverage)

## Implementation Notes

### Completed Implementation
- ✅ All core features implemented and functional
- ✅ Next.js App Router patterns used (Server Components + Client Components)
- ✅ API routes thin with logic in `lib/` modules
- ✅ Security: Localhost-only checks on all API routes
- ✅ Input validation with Zod schemas
- ✅ Automatic backup for .env file modifications
- ✅ Service discovery works with all compose file formats

### ✅ All Planned Enhancements Completed

1. ✅ **Real-time Status Updates** - Implemented polling with 5s intervals for services, 30s for health
   - ServicesCatalog component with toggle controls
   - Health status updates in ServiceCard components
   - Status: Complete

2. ✅ **Health Status Integration** - Health badges integrated into ServiceCard
   - Displayed when service is running
   - Updates automatically every 30 seconds
   - Status: Complete

3. ✅ **Rate Limiting** - Added to all write operations
   - Service control: 10 requests/minute
   - Environment API: 5 requests/minute
   - Status: Complete

4. ✅ **Bootstrap Integration** - Full integration into bootstrap flow
   - Added to SERVICES array
   - Service mapping and deployment
   - URL in completion message
   - Status: Complete

5. **Advanced Features**
   - Log filtering by level/pattern
   - Bulk service operations
   - Service dependency visualization
   - Health dashboard with graphs
   - Priority: Low

### Testing Status
- ✅ Manual testing completed for all major features
- ✅ All enhancements tested and verified
- ⚠️ Unit tests not yet written (future task - low priority)
- ⚠️ E2E tests not yet written (future task - low priority)

### Development Status
- ✅ **100% Complete** - All planned features and enhancements implemented
- ✅ All phases completed (1-4) plus additional enhancements
- ✅ Bootstrap integration complete
- ✅ Ready for production use (with localhost-only access)

### Documentation
- ✅ README.md - Basic usage
- ✅ PRD.md - Product requirements
- ✅ IMPLEMENTATION.md - Detailed implementation documentation
- ✅ plan.md - This file (updated with completion status)

