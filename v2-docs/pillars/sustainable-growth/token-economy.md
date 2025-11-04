# Token Economy

## Vision
SEILING for payments/governance/rewards.

## Overview
Utility token; 1B supply (40% community, 20% dev, etc.). Fees (5% marketplace), staking for subs discounts.

## Setup
- **Utility**: Vote, stake for access, bounties.
- **Distribution**: Vesting, emissions.
- **Code Snippet** (Grok):
```typescript
// token/utils.ts
const SEILING = {
  totalSupply: 1000000000,
  utility: ['vote', 'stake', 'discounts']
};
```
- **Integration**: Wallet connect in Captain; DAO via Snapshot.

## Metrics/Challenges
$1M TVL; mitigate volatility (stablecoin pairs).

## Goals
- $1M TVL in SEILING.
- High participation in governance.
- Aligned incentives.

## Design
- Utility token with vesting.
- Staking for discounts/rewards.

## Execution Plan
1. **Token**: Deploy contract (Week 1).
2. **Integration**: Payments in UIs (Week 2).
3. **Launch**: Airdrop/community (Week 3).

## Implementation Details
- **As New Package**: packages/seiling-token.
- **Docker Files**: None.
- **Env Changes**: TOKEN_ADDRESS.
- **Scripts**: distribution-script.sh.
- **Business Examples**: Pay subs with SEILING for 20% discount; stake for governance voting power.
