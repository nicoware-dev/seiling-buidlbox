# Seiling Buidlbox v2 Research Plan

## Overview
Systematic research to identify/evaluate open-source projects accelerating v2 across pillars. Phases: Discovery (scan repos), Evaluation (score fit/reusability), Prototyping (PoCs), Synthesis (integrate best). Weighted Scoring: Fit (40%), Reusability (30%), Impact (20%), Risk (10%). Targets: 20+ projects; 3-month cycle per pillar. Tools: GitHub search, HN/Discord, benchmarks.

## Phases
1. **Discovery** (Week 1-2): Keywords (e.g., "self-hosted LLM observability"); sources (GitHub, Awesome lists); initial list 50+.
2. **Evaluation** (Week 3): Score matrix; deep-dive (stars, activity, docs); shortlist 10.
3. **Prototyping** (Week 4): Docker PoC; test with Sei (e.g., MCP compat); metrics (setup time, perf).
4. **Synthesis** (Week 5): Roadmap integration; docs/pull-request if fork.

## Pillar Targets
- **Expanded Capabilities**: Langfuse (observability), Supabase (BaaS), Coolify (PaaS), SearXNG (search), Kokoro (voice).
- **New Features**: OS, Auditos, Builder, Captain.
- **Improved DX**: Cursor rules (AI context), Docusaurus (docs), n8n templates.
- **Community**: Bounty tools (Gitcoin), DAO (Snapshot).
- **Sustainable**: Stripe (payments), Open SaaS (subs).

## Example: Observability (Langfuse)
- **Discovery**: "open-source LLM tracing".
- **Eval**: Score 9.5/10 (Langfuse: active, Docker-ready).
- **PoC**: Integrate with ElizaOS; trace MCP calls.
- **Outcome**: Adopt as ENABLE_LANGFUSE bundle.

## Risks & Metrics
Risks: Fork maintenance (prefer APIs), compat (EVM test). Metrics: 80% reuse rate, <1 week per integration. Review quarterly.
