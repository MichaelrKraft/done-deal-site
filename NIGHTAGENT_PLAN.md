# NightAgent Strategic Plan — done-deal-site
*Generated: 2026-08-23T06:33:47.658Z*

ExitPlanMode isn't available as a deferred tool here — it must already be in the active tool set or this session handles plan exit differently. Let me present the plan directly to the user as my final answer, since that's the substantive deliverable.

## Done Deal Site — Strategic Plan Summary

**Launchability: 79/100.** This is a more mature site than a first pass suggested — real pricing tiers ($197/deal, $997/yr, $2,500/yr), branded error pages, Telegram lead alerts, and solid Vitest/Playwright coverage are all already in place. Billing correctly lives outside this repo (CTAs route to `app.done-deal.info/signup`).

**The one real problem**: the flagship Reme voice demo is **silently broken in production right now** — its Supabase usage-cap RPCs 404 because migrations were never applied, so it fails closed (429) with no explanation to visitors. Two lead-capture paths (contact form's `source` field, yourcastle's atomic allocation) are also running in degraded fallback states for the same reason — all four blocked on a human applying pending SQL migrations that no agent can reach.

**Tonight's priorities** (full detail in the plan file):
1. Add a visible "temporarily at capacity" message when the voice demo fails, instead of silent failure
2. Regression test for that failure path
3. Consolidate the 4 pending migrations into one true copy-paste block to lower the friction for the human fix
4. Extend the existing Telegram bot to alert when the demo's RPC 404s
5. Verify contact-form submissions aren't silently failing outright (not just losing `source` attribution)
6. Character counter on the demo's text input
7. Spot-check UTM tagging on CTA links

Full plan with rationale, effort estimates, and verification steps is at `/Users/michaelkraft/.claude/plans/you-are-a-senior-pure-marshmallow.md`.
