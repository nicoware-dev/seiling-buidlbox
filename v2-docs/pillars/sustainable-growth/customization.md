# Customization

## Vision
Enterprise tailoring (on-prem, branding).

## Overview
On-prem v2, custom services, white-label.

## Setup
- **Options**: Branding, custom bundles, SLAs.
- **Process**: Gap analysis, build, deploy.
- **Code Snippet** (GPT5):
```yaml
# custom-compose.yml
services:
  custom-ui:
    image: seiling-v2-custom
    env_file: .env.custom
```

## Metrics/Challenges
10 enterprise clients; mitigate IP (contracts).

## Goals
- 10 enterprise clients.
- Custom revenue stream.
- Tailored solutions.

## Design
- On-prem/white-label options.
- Modular custom bundles.

## Execution Plan
1. **Options**: Define services (Week 1).
2. **Process**: Build/delivery flow (Week 2).
3. **Pilots**: First clients (Week 3+).

## Implementation Details
- **As Modification**: Custom branches in repo.
- **Docker Files**: custom-compose.yml templates.
- **Env Changes**: CUSTOM_ENABLED.
- **Scripts**: custom-build.sh.
- **Business Examples**: White-label Captain for corp branding ($5K, 3 weeks).
