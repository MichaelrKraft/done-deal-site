---
name: monetization-advisor
description: Expert knowledge of SaaS monetization strategy including pricing models, feature gating, upgrade flows, freemium design, and revenue optimization. Use when making decisions about what features to gate, how to price plans, where to add upgrade prompts, or how to structure a freemium model.
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Monetization Advisor

## The Golden Rule of SaaS Monetization
> The free tier should be valuable enough to attract users, but limited enough that power users want to upgrade.

## Feature Gating Framework

### What to put in Free tier
- Core functionality that demonstrates value
- Limited usage (e.g., 3 projects, 100 API calls/month)
- Basic features without advanced customization
- Community support only

### What to put in Pro tier ($19–$49/month)
- Unlimited usage of core features
- Advanced features that power users need
- Priority email support
- Integrations with popular tools
- Export/import capabilities
- Analytics and reporting

### What to put in Enterprise tier ($99+/month)
- Everything in Pro
- SSO/SAML authentication
- Custom integrations
- SLA guarantee
- Dedicated support/account manager
- Audit logs
- Custom contracts

## Upgrade Prompt Placement (High-Converting Locations)
1. **Usage limit reached** — "You've used 3/3 free projects. Upgrade to add more."
2. **Feature discovery** — User tries to use a Pro feature, show upgrade modal
3. **After success** — "You just saved 2 hours! Upgrade to automate this daily."
4. **Empty states** — "Unlock advanced analytics to see your trends"
5. **Dashboard** — Subtle "Upgrade to Pro" banner for free users

## Pricing Psychology
- Always show 3 tiers (anchoring effect — middle tier wins)
- Highlight the middle tier as "Most Popular"
- Annual pricing = 2 months free (20% discount)
- Show per-day cost for annual plans ("Less than $1/day")
- List what users LOSE by not upgrading, not just what they gain

## Revenue Readiness Checklist
- [ ] Stripe installed and configured
- [ ] Checkout session endpoint exists
- [ ] Webhook handler exists and handles subscription events
- [ ] Pricing page exists at /pricing
- [ ] Features are gated with isPremium() checks
- [ ] Upgrade prompts appear at friction points
- [ ] Customer portal link exists (let users manage billing)
- [ ] Trial period configured (14 days recommended)
- [ ] Cancellation flow exists

## Common Monetization Mistakes
1. Gating too aggressively — users churn before seeing value
2. No free tier — eliminates viral/word-of-mouth growth
3. Pricing too low — signals low quality, hard to raise later
4. No annual option — leaves 20-30% revenue on the table
5. Hiding the pricing page — reduces conversion
6. No trial period — increases friction for first payment
