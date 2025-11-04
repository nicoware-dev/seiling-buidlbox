# MCP v2

## Vision
Upgrade Sei MCP Server for multi-session, cross-chain tool chaining.

## Overview
Hackathon-won protocol for advanced AI-blockchain ops. Benefits: Persistent context, IBC support.

## Setup
- **Docker**: Update `docker/services/docker-compose.sei-mcp.yml` to v2 image.
- **Config**: `.env` session secret, chains (sei,cosmos); port 5004.
- **Enable**: `ENABLE_MCP_V2=yes`.

## Integration
- **v2 Usage**: Update ElizaOS/Cambrian for sessions; new n8n node for chaining.
- **Sei Adaptation**: IBC for cross-chain; validate actions.
- **Code Snippet** (Grok):
```typescript
app.post('/mcp/v2/chain', async (req, res) => {
  const { sessionId, chain, tools } = req.body;
  const results = await executeChainedTools(sessionId, chain, tools);
  res.json({ session: sessionId, results });
});
```

## Metrics/Challenges
Backward compat; mitigate breaking (v1 endpoints), complexity (Sei-only first).

## Goals
- Backward compat with v1.
- Enable sessions/cross-chain.
- Sei-only first, then IBC.

## Design
- Upgraded server with session mgmt.
- Client configs for Eliza/Cambrian.

## Execution Plan
1. **Upgrade**: New Docker image (Week 1).
2. **Features**: Sessions/chaining (Week 2).
3. **Nodes**: Update n8n (Week 3).

## Implementation Details
- **As Package Update**: packages/sei-mcp-server v2.
- **Docker Files**: Update docker-compose.sei-mcp.yml.
- **Env Changes**: ENABLE_MCP_V2=yes, SESSION_SECRET.
- **Scripts**: migration script for v1 to v2.
- **Modifications**: Update elizaos/cambrian clients.
