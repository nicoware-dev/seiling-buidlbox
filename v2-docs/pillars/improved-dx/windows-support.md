# Windows Support

## Vision
Reliable first-run on Windows via preflight/fixes.

## Overview
Preflight checks (EOL, paths, Docker); enhanced windows_docker_helper.sh.

## Goals
- 95% first-run success on Windows.
- Auto-fix common issues.

## Design
- Preflight checks in bootstrap.
- Helper script enhancements.

## Execution Plan
1. **Checks**: Identify issues (Week 1).
2. **Fixes**: Implement auto-fixes (Week 2).
3. **Docs**: Write guides (Week 3).

## Implementation Details
- **As Modification**: scripts/windows_docker_helper.sh.
- **Env Changes**: None.
- **Scripts**: Add to preflight.sh.
- **Package**: None.

## Setup & Implementation
- **Preflight**: bootstrap invokes checks (line endings, permissions, daemon).
- **Fixes**: Auto-convert EOL, suggest WSL paths, restart Docker.
- **Code Snippet** (GPT5):
```bash
# preflight.sh
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  check_docker_daemon
  fix_line_endings
fi
```
- **Docs**: Known issues/remedies.

## Metrics/Challenges
95% success; mitigate nuances (test all OS).
