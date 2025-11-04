# Seiling Buidlbox v2 Overview

## Vision & Mission
Seiling Buidlbox v2 is a no-code/low-code AI platform for building Sei Network dApps, transitioning from centralized tools to a decentralized, community-driven ecosystem. Mission: Democratize blockchain dev with AI agents, multi-modal interfaces, and modular services. Core Principles: Accessibility (no-code entry), Modularity (toggle services), Observability (trace everything), Community-Centric (DAO governance), Sustainability (token economy).

## What's New in v2 (vs v1)
v1 focused on core AI tools (ElizaOS, Cambrian, n8n nodes). v2 expands to:
- **Expanded Capabilities**: 8+ services (Langfuse, Supabase, SearXNG, voice, MCP v2, observability, proxies, Coolify).
- **New Features**: UIs (Captain control plane, Builder no-code, OS workspace, Auditor contracts).
- **Improved DX**: Templates/store, tutorials/videos, AI context files, quick demo, Windows support.
- **Community Focus**: Bounties, incentives, gamification, mini-hackathons, token governance.
- **Sustainable Growth**: Subscriptions, premium templates, services marketplace, tokenomics.

## Architecture
![Architecture Diagram](assets/architecture.png)

**Layers**:
- **Control Plane**: Seiling Captain (service mgmt), OS (workspaces).
- **AI/Data Layer**: ElizaOS/Cambrian (agents), n8n/Flowise (workflows), Qdrant/Supabase (storage), Langfuse (observability), SearXNG (search).
- **Extension Layer**: MCP v2 (tools), voice (Kokoro), proxies (Caddy/Cloudflared), deploys (Coolify).

**Docker Modularity**: 20+ compose fragments in docker/services/; enable via .env flags. Bootstrap.sh orchestrates setup.

**Sei Integration**: EVM-compatible RPC, SDK nodes for n8n, wallet connect in UIs.

## Five Pillars
1. **Expanded Capabilities**: Optional bundles for prod-ready (observability, backend, search, voice, protocol, deploy/proxy).
2. **New Feature Development**: UIs for no-code (Builder), mgmt (Captain), workspace (OS), auditing (Auditor).
3. **Improved DX**: Resources/templates/tutorials for faster Sei dev.
4. **Community Focus**: Bounties/gamification/hackathons for contributions.
5. **Sustainable Growth**: Monetization via subs/tokens/services.

## Phased Roadmap
- **Phase 1 (Q1-Q2)**: Core pillars (expanded + improved DX); MVP UIs.
- **Phase 2 (Q3-Q4)**: Community + new features; observability full.
- **Phase 3 (Q1-Q2 next)**: Sustainable growth; DAO launch.

v2 empowers 10x more devs to build on Sei with AI, community, and sustainability.
