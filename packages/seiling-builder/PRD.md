# PRD – Seiling Builder

## Summary
No-code UI for contract interaction and deployment on Sei (EVM). Part of Seiling Buidlbox v2 ecosystem.

## Users
- Developers and non-dev operators on Sei

## Goals & Metrics
- <1 minute to perform common interactions
- Support 80% of read/write workflows without code

## Functional Requirements
- Wallet connect, network selector (Sei testnet/mainnet)
- Load ABI JSON, list functions, read/write forms
- Show tx status and history
- Export actions as n8n workflow templates (later)

## Technical
- React + Vite, `wagmi` + `viem`
- Chain config for Sei EVM

## Milestones
- M1: Minimal read/write from ABI (this commit)
- M2: Deploy from source template
- M3: Workflow export and explorer integrations

