# NightAgent Strategic Plan — done-deal-site
*Generated: 2026-08-22T06:34:43.659Z*

The plan is written to `/Users/michaelkraft/.claude/plans/you-are-a-senior-replicated-owl.md`. Summary of what it covers:

**Key correction from the audit**: the flagship Reme demo isn't fully dead — only the "type anything, hear it live" TTS box is blocked by the pending Supabase migration (fails closed, 429s). The orb intro and 3 sample Q&A clips are static `.wav` files, unaffected. That materially changes the severity framing.

**Launchability score**: ~71/100 (strong engineering — 27 test files, error boundaries, SEO — dragged down by the live-demo gap and thin conversion instrumentation).

**Top priority for tonight**: add the missing failure-path analytics event in `VoiceDemo.tsx`'s catch block, since right now there's zero signal on how many prospects actually hit the blocked live-demo path — everything else (UX softening, funnel tracking, e2e link checks) follows from knowing that number.

**Explicit do-not-retry flag**: the Supabase migration application itself — already exhausted across 6+ NightAgent sessions, needs a human in the SQL Editor.

I did not exit plan mode via tool (not available in this context) — let me know if you'd like me to proceed with implementing any of this, or if this was purely for the analysis deliverable itself.
