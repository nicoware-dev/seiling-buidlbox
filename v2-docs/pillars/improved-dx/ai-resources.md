# AI Development Resources & Agent Context

## Vision
Standardize AI-assisted coding with project-specific context files for tools like Cursor, Claude, Junie.

## Overview
Provide templates for AGENTS.md (instructions), CLAUDE.md (guidelines), .cursorrules (project rules), .junie/guidelines.md, llms.txt. Enable context preservation, prompt engineering, sub-agents. Benefits: Consistent AI behavior, faster dev, reduced errors.

## Goals
- 90% AI coding accuracy.
- Standardize context for tools.
- Auto-generate from repo.

## Design
- Templates for key files (AGENTS.md etc.).
- Precedence rules for inheritance.

## Execution Plan
1. **Templates**: Create samples (Week 1).
2. **Script**: Generate script (Week 2).
3. **Integration**: Add to OS/docs (Week 3).

## Implementation Details
- **As New Scripts**: scripts/generate-context.sh.
- **Env Changes**: None.
- **Modifications**: Add to bootstrap.sh optional.
- **Package**: shared/ai-resources.

## Setup & Implementation
- **Files Structure**: Root-level: AGENTS.md, CLAUDE.md; .cursor/rules/, .junie/.
- **Scaffold Script**: `scripts/generate-context.sh` to auto-populate from repo scan.
- **Precedence**: Child > parent; repo > global.
- **Code Snippet** (Supernova):
```markdown
# CLAUDE.md Template
IMPORTANT: Use Sei testnet for simulations. Core: packages/sei-mcp-server/src/tools.ts. Style: TS strict, async/await.
```
- **Integration**: Link in Seiling OS, docs; IDE support (.cursorrules).

## Metrics/Challenges
90% AI accuracy; mitigate updates (version with releases), tool-specific variants.
