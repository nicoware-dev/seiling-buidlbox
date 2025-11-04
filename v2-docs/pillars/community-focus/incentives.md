# Contributor Incentives

## Vision
Reward PRs/issues/docs with tokens/NFTs/badges.

## Overview
Tiers (Bug $50, Feature $500, Docs $100); automation via GitHub bot. Badges (bronze/gold NFTs on Sei), Hall of Fame.

## Setup
- **Automation**: CI scripts for attribution; bot comments rewards.
- **Perks**: Early access, merch, token airdrops.
- **Code Snippet** (GPT5):
```bash
# contrib-script.sh
git log --author="$AUTHOR" --since="1.month" | wc -l
if [ $COMMITS -gt 10 ]; then echo "Gold Badge"; fi
```

## Metrics/Challenges
Retention +30%; mitigate abuse (review thresholds).
