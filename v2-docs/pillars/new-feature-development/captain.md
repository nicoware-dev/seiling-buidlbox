# Seiling Captain (System Management UI)

## Vision
Web dashboard for service control, replacing CLI for common tasks.

## Overview
Local-first Next.js app; manage .env, start/stop/restart, health/logs. Local-only default; auth for remote.

## Goals
- 80% CLI reduction.
- Intuitive mgmt for non-devs.
- Real-time monitoring.

## Design
- Next.js dashboard with React Query.
- Service cards, env editor.

## Implementation Details
- **As New Package**: packages/seiling-captain.
- **Docker Files**: docker-compose.captain.yml.
- **Env Changes**: CAPTAIN_PORT=3001.
- **Scripts**: Add to bootstrap.sh.
- **Modifications**: None.

## Setup & Implementation
- **Architecture**: Next.js API routes wrap docker compose (whitelist commands); service catalog from fragments.
- **Features**: Env editor/validation, health (HTTP/DB), logs (docker logs -f link).
- **Code Snippet** (Grok):
```typescript
// api/services/route.ts
import { exec } from 'child_process';
export async function POST(req) {
  const { action, service } = await req.json();
  if (!whitelist.includes(action)) throw 'Unauthorized';
  return exec(`docker compose ${action} ${service}`);
}
```
- **Integration**: Run on port 3001; link from bootstrap.

## Metrics/Challenges
80% CLI reduction; mitigate security (local/auth).
