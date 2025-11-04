# Bounties Program

## Vision
Outsource tasks (bugs/features/docs) with SEI/SEILING rewards.

## Overview
GitHub-based; tiers (Easy $50, Med $200, Hard $1K); categories (dev/design/research). Lifecycle: Create (labels/templates), Apply (PRs), Review (multi-stage), Payout (multisig).

## Setup
- **Platform**: GitHub issues/labels; bounty index (MD/JSON).
- **Process**: SLA 7 days review; valuation algo (complexity * rate).
- **Code Snippet** (Supernova):
```typescript
// BountyCreationService
class BountyCreationService {
  createBounty(description: string, reward: number, category: string) {
    // Validate, post issue, multisig escrow
    return { id: 'bty-123', status: 'open' };
  }
}
```

## Metrics/Challenges
200 bounties/yr; mitigate disputes (DAO vote), low quality (criteria).
