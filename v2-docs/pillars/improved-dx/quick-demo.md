# Quick Demo Mode

## Vision
Fast, minimal setup for demos with preloaded assets.

## Overview
PROFILE=demo enables core services (OpenWebUI/n8n/Flowise/MCP) with samples; idempotent imports, teardown.

## Goals
- <5min boot to first agent.
- Preloaded samples.
- Easy teardown.

## Design
- PROFILE=demo env flag.
- Idempotent imports.

## Execution Plan
1. **Config**: Add profile (Week 1).
2. **Samples**: Create assets (Week 2).
3. **Script**: Update bootstrap (Week 3).

## Implementation Details
- **As Modification**: bootstrap.sh.
- **Env Changes**: PROFILE=demo.
- **Scripts**: New import_sample_templates.sh.
- **Package**: None.

## Setup & Implementation
- **Config**: .env PROFILE=demo (flags, timeouts); import scripts.
- **Assets**: One workflow, flow, function.
- **Code Snippet** (GPT5):
```bash
# bootstrap.sh --profile=demo
if [ "$PROFILE" = "demo" ]; then
  import_sample_templates
fi
```
- **Integration**: localhost access; reset script.

## Metrics/Challenges
<5min boot; mitigate state (idempotent checks).
