# Gamification

## Vision
Engage via milestones, points, NFTs for usage/contribs.

## Overview
20 levels (first agent, PR, template); track with Supabase; rewards SEILING/ERC-721 NFTs. Events bus (webhooks/CI).

## Setup
- **Tracking**: Supabase tables for events; optional Sei mint.
- **UI**: Leaderboards in Captain.
- **Code Snippet** (Grok):
```typescript
// gamification.ts
const milestones = [
  { level: 1, event: 'first_agent', reward: 10 },
  { level: 5, event: 'pr_merged', reward: 50, nft: true }
];
```

## Metrics/Challenges
70% engagement; mitigate cheating (server-side verify).
