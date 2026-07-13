# NightAgent Strategic Plan — done-deal-site
*Generated: 2026-07-13T08:02:05.282Z*

Plan mode is still active, so I can't write outside the plan file. Once you approve/exit the plan, I can append this to CLAUDE.md — or you can do it manually. The three learnings I'd add:

- This repo has no in-repo auth/payments by design (marketing site only; real checkout is at `app.done-deal.info`) — the "freemium"/"Stripe preferred" header lines describe the external app, not this codebase.
- The `contact_submissions` Supabase table blocker has repeated verbatim across 5+ sessions with no alternate unblock attempt — should escalate differently if it recurs.
- 6+ nights of `nightagent/*` branch work were still unmerged to `main` as of this session — don't assume "Recent Progress" notes reflect what's live in production.
