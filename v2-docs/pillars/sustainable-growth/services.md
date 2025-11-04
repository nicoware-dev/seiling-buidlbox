# Services (D4Y/DWY)

## Vision
Consulting/outsourcing for complex builds.

## Overview
D4Y ($1K-5K small), DWY ($10K+ enterprise); use v2 as base, bill hours.

## Setup
- **Offerings**: Custom agents, integrations, audits.
- **Process**: Intake form, proposal, delivery via GitHub.
- **Code Snippet** (Supernova):
```typescript
// services/d4y.ts
class D4YService {
  async createProposal(req: ProposalRequest) {
    const quote = calculateQuote(req.complexity);
    return { proposalId: 'd4y-123', quote, timeline: '2.4 weeks' };
  }
```
- **Integration**: Lead form in Captain; track in Supabase.

## Metrics/Challenges
$200K revenue Yr1; mitigate capacity (community freelancers).

## Goals
- $200K revenue Yr1.
- 50 clients.
- High satisfaction.

## Design
- D4Y/DWY packages.
- Intake/proposal process.

## Execution Plan
1. **Offerings**: Define packages (Week 1).
2. **Ops**: Templates/SLAs (Week 2).
3. **Marketing**: Case studies (Week 3).

## Implementation Details
- **As New Package**: packages/services-portal.
- **Docker Files**: None.
- **Env Changes**: None.
- **Scripts**: proposal-generator.sh.
- **Business Examples**: D4Y: Build custom DeFi agent ($3K, 2 weeks); DWY: Guided v2 setup workshop ($1K, 1 day).
