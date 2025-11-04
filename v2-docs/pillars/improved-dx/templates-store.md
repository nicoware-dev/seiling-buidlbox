# Templates & Template Store

## Vision
Curated, reusable templates for n8n/Flowise/OpenWebUI; store for sharing/customization.

## Overview
20+ use-case templates (DCA, rebalancing, limit orders, auto-compounding). SaaS templates (DeFi analytics, agent marketplace). Store with metadata (title/desc/version), previews, import/export.

## Setup & Implementation
- **Locations**: resources/n8n/, resources/flowise/, resources/openwebui/; resources/saas-templates/.
- **Store**: JSON schema for metadata; import scripts; versioning.
- **Examples**: sei-dca-bot.json (n8n), sei-yield-agent.json (Flowise).
- **Code Snippet** (Grok):
```json
{
  "name": "Sei DCA Bot",
  "nodes": [
    {"name": "Sei Price Trigger", "type": "n8n-nodes-base.scheduleTrigger", "parameters": {"rule": {"interval": 3600}}},
    {"name": "Execute Swap", "type": "n8n-nodes-sei.astroportSwap", "parameters": {"amount": "$1", "from": "USDC", "to": "USEI"}}
  ]
}
```
- **SaaS**: docker-compose.yml + env for DeFi dashboard.
- **Integration**: Auto-import on bootstrap; marketplace for community.

## Metrics/Challenges
5000+ usages; mitigate maintenance (versioning), security (sanitization).

## Goals
- 5000+ template usages.
- Community marketplace.
- Versioned with previews.

## Design
- JSON metadata schema.
- Import/export scripts.

## Execution Plan
1. **Templates**: Create 20+ (Week 1-2).
2. **Store UI**: In Captain (Week 3).
3. **Marketplace**: Community contribs (Week 4).

## Implementation Details
- **As New Package**: packages/template-store.
- **Docker Files**: None.
- **Env Changes**: TEMPLATE_STORE_URL.
- **Scripts**: import-template.sh.
- **Modifications**: Add to resources/ folders.
