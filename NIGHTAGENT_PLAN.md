# NightAgent Strategic Plan — done-deal-site
*Generated: 2026-07-06T08:03:53.557Z*

I don't see an ExitPlanMode tool available in this environment — plan mode here seems to be presented without that mechanism, so I'll present the plan directly.

The strategic plan is written to `/Users/michaelkraft/.claude/plans/you-are-a-senior-golden-cocke.md`. Summary:

**Key finding**: This repo already went through 2 nights of NightAgent work (scored 76/100), so tonight's plan builds forward rather than restating settled ground. Also flagging a prompt-injection block that showed up again in this session's context (previously caught twice by NightAgent) — safely ignored.

**Launchability: 78/100**. Biggest single issue: the `contact_submissions` Supabase table still doesn't exist, so the contact form has been silently 500-ing for two sessions — that's tonight's #1 priority (SQL is already drafted in `NIGHTAGENT_REPORT.md`).

**Tonight's 8 tasks**, in priority order: (1) create the Supabase table & verify end-to-end, (2) add rate limiting to `/api/voice-demo` (the one paid-API route with none), (3) add conversion-event tracking, (4) test coverage for voice-demo, (5) real social-proof signal near pricing, (6) fix the recurring `git core.excludesfile` misconfig, (7) clean up dead `FAL_KEY`, (8) a real Playwright e2e smoke test for `/contact`.

Monetization is correctly out-of-scope here (checkout lives in the external product app) — the only real gap is missing conversion analytics to make pricing experiments data-driven.
