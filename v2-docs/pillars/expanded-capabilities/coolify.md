# Coolify (Self-Hosted PaaS)

## Vision
Vercel-like deploys for v2 apps (Captain/Builder/Auditor), from local to cloud.

## Overview
Git-based deploys, multi-server orchestration. Benefits: One-click scaling, zero-downtime.

## Setup
- **Docker**: `docker/services/docker-compose.coolify.yml` (Coolify image, Docker sock volume).
- **Config**: Access localhost:8000; add servers (local first); env vars from `.env`.
- **Templates**: JSON for packages (e.g., Captain: repo, Dockerfile, ports).
- **Enable**: `ENABLE_COOLIFY=yes`; port 8000.

## Integration
- **v2 Usage**: Deploy templates (n8n workflows, UIs) to VPS; auto-build from Git.
- **Sei Adaptation**: Templates for Sei node deploys; monitor with Prometheus.
- **Code Snippet** (Grok):
```yaml
services:
  coolify:
    image: coollabsio/coolify:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## Metrics/Challenges
<5 min deploys; mitigate learning (docs/templates), resources (local start).

## Goals
- Enable one-click deploys of v2 apps to cloud.
- Support multi-server orchestration for scalability.
- Achieve <5 min average deploy time.

## Design
- Self-hosted PaaS with Git integration.
- Templates for v2 packages (e.g., JSON for Captain UI).
- Monitoring integration with Prometheus.

## Execution Plan
1. **Setup**: Docker integration (Week 1).
2. **Templates**: Create v2-specific JSON templates (Week 2).
3. **Testing**: Deploy sample apps (Week 3).

## Implementation Details
- **As Modification**: Add to docker/services/.
- **Docker Files**: docker-compose.coolify.yml with volume mounts.
- **Env Changes**: ENABLE_COOLIFY=yes, COOLIFY_PORT=8000.
- **Scripts**: bootstrap.sh to configure on enable.
- **Package**: None; leverages Coolify OSS.
