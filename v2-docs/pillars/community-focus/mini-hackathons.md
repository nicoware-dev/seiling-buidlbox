# Mini-Hackathons

## Vision
Quarterly 48hr events for v2 projects/content.

## Overview
Themes (agents/DX/integrations); prizes 100-500 SEI; tracks (beginner/advanced). Platform: Devpost/GitHub; judging (impact/innovation).

## Setup
- **Lifecycle**: Planning (themes/starters), Execution (support), Post (judging/follow-up).
- **Starter Kits**: Templates for quick starts.
- **Code Snippet** (Supernova):
```typescript
// HackathonJudgingService
class HackathonJudgingService {
  scoreSubmission(sub: Submission, criteria: Criteria[]) {
    return criteria.reduce((sum, c) => sum + sub[c.key] * c.weight, 0);
  }
}
```

## Metrics/Challenges
100 participants/event; mitigate low turnout (promotion).
