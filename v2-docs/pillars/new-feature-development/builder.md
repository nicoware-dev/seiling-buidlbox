# Seiling Builder (No-Code Blockchain UI)

## Vision
Visual contract interaction/deploy.

## Overview
Wallet mgmt, ABI read/write, deploy from source, generate n8n workflows from actions. Sei EVM focus.

## Setup & Implementation
- **Fork**: Adapt Examples to Sei RPC/chain IDs.
- **Features**: Network selector (testnet/mainnet), function forms, tx history, workflow export.
- **Code Snippet** (Grok):
```typescript
// components/ContractInteract.tsx
const execute = async (abi, method, params) => {
  const tx = await seiClient.callContract({
    address: contractAddr,
    abi,
    method,
    params
  });
  return tx.hash;
};
```
- **Integration**: Port 3002; connect to MCP for tools.

## Metrics/Challenges
<1min deploys; mitigate ABI complexity (parsers).

## Goals
- <1min contract deploys.
- No-code for 80% tasks.
- Workflow gen from actions.

## Design
- React/Vite/Mantine UI.
- Wagmi for wallets, Sei SDK.

## Execution Plan
1. **Fork**: Adapt Examples (Week 1).
2. **Features**: Deploy/ABI (Week 2).
3. **Sei**: IBC/audit (Week 3).

## Implementation Details
- **As New Package**: packages/seiling-builder.
- **Docker Files**: docker-compose.builder.yml.
- **Env Changes**: BUILDER_PORT=3002.
- **Scripts**: None.
- **Modifications**: Update wagmi config for Sei.
