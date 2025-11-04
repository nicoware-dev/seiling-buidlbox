# n8n Node Expansions

## Vision
10+ new Sei nodes for protocols/explorers/cross-chain.

## Overview
Extend n8n-nodes-sei with Astroport swaps, IBC transfers, SeiScan queries, MEV protection.

## Goals
- 5x workflow capabilities.
- Cover 90% Sei protocols.
- MEV/IBC support.

## Design
- TS nodes with n8n pattern.
- Shared Sei client lib.

## Execution Plan
1. **Core Nodes**: Protocol-specific (Week 1).
2. **Advanced**: Cross-chain (Week 2).
3. **Templates**: Pre-built (Week 3).

## Implementation Details
- **As Package Update**: packages/n8n-nodes-sei.
- **Docker Files**: None.
- **Env Changes**: None.
- **Scripts**: gulp build.
- **Modifications**: Add to existing node set.

## Setup & Implementation
- **Nodes**: astroportSwap, ibcTransfer, seiScanQuery.
- **Code Snippet** (Grok):
```ts
// nodes/AstroportSwap.ts
import { INodeType } from 'n8n-workflow';
export class AstroportSwap implements INodeType {
  async execute() {
    const tx = await astroport.swap({ from: 'USDC', to: 'SEI', amount });
    return { txHash: tx.hash };
  }
}
```
- **Integration**: Update packages/n8n-nodes-sei; templates showcase.

## Metrics/Challenges
5x workflow speed; mitigate RPC limits (caching).
