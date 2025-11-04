# n8n Node Expansions

## Vision
10+ new Sei nodes for protocols/explorers/cross-chain.

## Overview
Extend n8n-nodes-sei with new nodes based on cambrian sdk defi protocol integrations. 1 node per protocol.

## Goals
- 5x workflow capabilities.
- Cover 90% Sei protocols.
- MEV/IBC support.

## Design
- TS nodes with n8n pattern.
- Shared Sei client lib.

## Implementation Details
- **As Package Update**: packages/n8n-nodes-sei.
- **Docker Files**: None.
- **Env Changes**: None.
- **Scripts**: gulp build.
- **Modifications**: Add to existing node set.

## Setup & Implementation
- **Nodes**: Based on cambrian sdk defi protocol integrations. 1 node per protocol.
- **Integration**: Update packages/n8n-nodes-sei; templates showcase.

## Metrics/Challenges
5x workflow speed; mitigate RPC limits (caching).
