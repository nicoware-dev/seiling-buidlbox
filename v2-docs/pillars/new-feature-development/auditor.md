# Seiling Auditor (Smart Contract Auditor)

## Vision
AI/static analysis for Sei contracts.

## Overview
Web UI for uploads, Slither/Mythril scans, AI reports (vulns/fixes). Sei-specific (EVM/IBC).

## Setup & Implementation
- **Stack**: Next.js, Postgres/Redis, Dockerized tools.
- **Features**: Multi-Solidity support, webhook status, OpenWebUI function.
- **Code Snippet** (Grok):
```dockerfile
# docker-compose.auditor.yml
services:
  auditor-web:
    image: nextjs-auditor
  slither:
    image: trailofbits/slither:latest
    volumes: - .:/contracts
```
- **Integration**: Port 3003; n8n for remediation workflows.

## Metrics/Challenges
90% vuln detect; mitigate false positives (AI tuning).

## Goals
- 90% vuln detection.
- Sei-specific checks.
- Batch audits.

## Design
- Next.js UI, Prisma DB.
- Dockerized Slither/Mythril.

## Implementation Details
- **As New Package**: packages/seiling-auditor.
- **Docker Files**: docker-compose.auditor.yml.
- **Env Changes**: AUDITOR_PORT=3003.
- **Scripts**: None.
- **Modifications**: Replace SeiScan with SeiTrace.
