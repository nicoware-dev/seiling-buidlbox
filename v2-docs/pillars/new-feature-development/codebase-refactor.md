# Codebase Refactor

## Vision
Monorepo cleanup for maintainability.

## Overview
Shared libs, TS strict, CI/CD, docs.

## Setup & Implementation
- **Steps**: Extract utils to @seiling/utils; ESLint/Prettier; Vitest 80% coverage.
- **Code Snippet**:
```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["build"] }
  }
}
```
- **Integration**: Bootstrap runs lint/test.

## Metrics/Challenges
Zero breaking; mitigate via phased PRs.

## Goals
- Zero breaking changes.
- 80% test coverage.
- Easier contribs.

## Design
- Turbo for monorepo.
- Shared @seiling/utils.

## Execution Plan
1. **Libs**: Extract utils (Week 1).
2. **Quality**: Linters/tests (Week 2).
3. **CI**: GitHub Actions (Week 3).

## Implementation Details
- **As Modification**: Root turbo.json.
- **Docker Files**: None.
- **Env Changes**: None.
- **Scripts**: New lint/test scripts.
- **Package**: New @seiling/utils.
