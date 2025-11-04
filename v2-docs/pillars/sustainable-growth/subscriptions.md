# Subscriptions

## Vision
Tiered hosted v2 for ease/scalability.

## Overview
Freemium to premium ($10-100/mo); features: Hosted services, priority support, more resources. Managed sub for full stack.

## Setup
- **Tiers**: Free (local), Pro ($29/mo, cloud services), Enterprise ($99/mo, custom + support).
- **Features**: Cloud deploys (Coolify), premium templates, dedicated instances.
- **Code Snippet** (GPT5):
```typescript
// api/subscriptions/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(key);
export async function POST(req) {
  const { tier } = await req.json();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: tiers[tier].price_id, quantity: 1 }],
    success_url: '/dashboard?status=active'
  });
  return { url: session.url };
}
```
- **Integration**: Stripe/SEI in Captain; usage limits.

## Metrics/Challenges
5K subs Yr2; mitigate churn (value first), pricing (A/B test).

## Goals
- $500K Yr1 revenue.
- 5K subscribers.
- 20% churn reduction.

## Design
- Tiered freemium model.
- Stripe billing with SEI option.

## Execution Plan
1. **Tiers**: Define features (Week 1).
2. **Billing**: Integrate Stripe (Week 2).
3. **Launch**: Marketing push (Week 3).

## Implementation Details
- **As New Package**: packages/subscriptions.
- **Docker Files**: None (cloud-hosted).
- **Env Changes**: STRIPE_KEY, SUB_TIERS.
- **Scripts**: webhook handler.
- **Business Examples**: Starter: Basic hosting; Pro: Custom domain + support (e.g., deploy v2 to AWS with monitoring).
