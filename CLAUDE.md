# done-deal-site — Project Memory

> This file is read by NightAgent at the start of every session.
> Keep it accurate. The better this file is, the better the agents perform.

## What This App Does
Marketing/landing site for Done Deal. Includes the Reme voice/TTS demo (Gemini-generated audio, not a conversational chatbot) and the public how-it-works/docs page.

## Target Customer
Real estate agents evaluating the Done Deal product

## Monetization Model
freemium

## Tech Stack
- next.js
- typescript
- supabase
- gemini
- React
- Next.js
- TypeScript

## Available Commands
- `npm run dev` — next dev
- `npm run build` — next build
- `npm run start` — next start
- `npm run lint` — eslint

## Architecture Notes
*(NightAgent will populate this as it learns the codebase. You can also add notes here manually.)*

### Reme voice-demo (Gemini TTS) cost cap audit — 2026-08-18
Audited `src/app/api/voice-demo/route.ts`'s two-layer cap (5 req/min/IP via
`rateLimit.ts`, 30 req/IP/day via `voiceDemoUsage.ts`) against live Gemini
2.5 Flash Preview TTS pricing: **$0.50/1M input tokens, $10.00/1M output
tokens, output audio = 25 tokens/second** (confirmed via ai.google.dev
pricing page, cross-checked against a second source).

- Cost driver is output audio duration, not input text length: $0.00025/sec
  of generated audio ($0.015/min).
- **Worst case per IP/day** (30 requests, each a maximal ~60s of audio):
  **~$0.45/day**. Realistic case (short demo phrases, a few seconds of
  audio each): **~$0.02–0.06/day per IP**.
- **Conclusion: the current cap is adequately conservative per-IP.** No
  change needed to the 5/min or 30/day numbers.
- **Residual gap (not fixed tonight, flagging for awareness)**: the cap is
  per-IP, not global. A distributed spike (many IPs at once — e.g. a bot
  swarm or viral traffic) has no aggregate ceiling; each IP is individually
  cheap but N IPs × $0.45/day has no upper bound. If this ever becomes a
  real concern, the next lever is a global daily spend/request ceiling in
  `voiceDemoUsage.ts` (e.g. a single shared counter row) in addition to the
  existing per-IP one — not needed today given this is a low-traffic
  marketing site, but worth revisiting if traffic grows materially.
- Also noted: `text` input has no server- or client-side max length —
  someone could paste a very long string. Input cost stays negligible even
  for large pastes ($0.001 for ~2000 tokens), but a longer text prompt could
  in theory increase requested output audio duration too. Not addressed
  tonight (low individual cost impact, would need product input on what a
  reasonable max demo length is).

## Code Standards
- Follow existing patterns in the codebase
- Add JSDoc comments to all new functions
- Write tests for all new features
- Never commit .env files or credentials

## Monetization Rules
- Free tier: core features with usage limits
- Pro tier: unlimited usage + advanced features
- Always show upgrade prompts at natural friction points
- Payment integration: Stripe preferred

## Important Files
*(NightAgent will populate this. You can also add key files manually.)*

## Recent Progress
- 8/21/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 8/19/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 8/18/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 8/17/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 8/16/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 8/5/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/17/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/16/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/15/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/14/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/13/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/7/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/6/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/5/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/4/2026: *(Lead agent appends here after all teammates finish)*

All three teammates completed their assigned scope on branch `nightagent/2026-07-04`, 6 commits total (`68755c9`, `6c4614f`, `710a418`, `c2cba9f`, `70428cc`, `b1dc283`). Working tree is clean; nothing left uncommitted.
- 7/4/2026: NightAgent initialized. Last commit: 37d98c0 fix: use nullish coalescing for Supabase env vars to prevent build crash

## Tomorrow's Top Priorities
*(Updated each morning by NightAgent after reviewing last night's work)*

## Known Issues / Blockers

### BLOCKED — needs human with Supabase SQL Editor access (yourcastle allocation + 2 other migrations)
**Status as of 2026-08-21: code-side work is DONE. Only the DB-side apply step remains, and it requires a human.**

Three migrations are written, tested against, and committed to this repo but **not applied to production** Supabase (project `zjuoxaqdqqdtihmekrcz`). This has been independently re-verified across 6+ NightAgent sessions (2026-07-15 through 2026-08-21) — it is a credentials/environment gap, not something another agent attempt will resolve:
- No `supabase` or `psql` CLI is installed in the agent sandbox.
- `.env.local` only has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — no `DATABASE_URL`/`SUPABASE_DB_URL`/`SUPABASE_ACCESS_TOKEN`.
- The service-role key authorizes PostgREST calls to *existing* tables/functions only — it cannot run DDL (`CREATE TABLE`/`CREATE FUNCTION`/`ALTER TABLE`). That requires a direct Postgres connection, which no agent has.

**Application code is already safe in the meantime**: `src/app/api/yourcastle/signup/route.ts` calls the atomic `allocate_yourcastle_signup` RPC first; if it 404s (`PGRST202`, migration not applied), it falls back to the pre-existing select-then-insert path instead of 500ing every signup. This fallback has a narrower, pre-existing race (not fixed by this migration) but is not a regression — see route comments and `src/app/api/yourcastle/signup/__tests__/route.test.ts` for full regression coverage of both paths. **No further code change is needed here; do not re-wire this again.**

**Action required (human, ~60 seconds)**: open the Supabase SQL Editor for `zjuoxaqdqqdtihmekrcz` (https://supabase.com/dashboard/project/zjuoxaqdqqdtihmekrcz/sql/new) and run the full copy-paste SQL block plus the atomic-allocation migration file, both documented in `NIGHTAGENT_MIGRATION_STATUS.md` at the repo root — plus the newer global-cap migration below (added 2026-08-21, not yet in that status doc). Then run `npm run smoke:schema` to confirm. The four pending migrations:
1. `supabase/migrations/20260715000000_add_source_to_contact_submissions.sql` — fixes silently-failing contact form leads (`contact_submissions.source` missing).
2. `supabase/migrations/20260716000000_create_voice_demo_usage.sql` — fixes TTS cost-cap no-op (currently voice demo is fully disabled/429s in prod as a safe fail-closed side effect).
3. `supabase/migrations/20260816000000_atomic_yourcastle_free_deal_allocation.sql` — closes the free-deal double-allocation race described above.
4. `supabase/migrations/20260821000000_add_voice_demo_global_daily_cap.sql` — adds the aggregate (all-IPs) daily spend ceiling for the Reme voice demo referenced in `src/lib/voiceDemoUsage.ts`. Code already calls it with a `p_global_daily_cap` param; until applied, `increment_voice_demo_usage` 404s (`PGRST202`) and `checkVoiceDemoDailyCap()` fails closed — same safe "voice demo returns 429" degraded state as #2 above, not a regression.

Once applied, delete the fallback branch in `yourcastle/signup/route.ts` per its own inline comment, and update this section to reflect resolution.

---
*Last updated by NightAgent: 2026-08-21T06:50:33.792Z*



























































<!-- coder1-mem:start -->
<!-- Auto-updated by coder1-mem on 2026-08-22 — do not edit this block manually -->
## Recent Session Context

**Project:** done-deal-site | **Sessions:** 126 | **Last active:** just now

Session topic: ...

<!-- coder1-mem:end -->
