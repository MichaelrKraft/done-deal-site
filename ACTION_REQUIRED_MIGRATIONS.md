# ACTION REQUIRED: Apply pending Supabase migrations (human, ~60 seconds)

**This has blocked 6+ NightAgent sessions since 2026-07-15. No agent sandbox has DB
credentials capable of DDL — only a human with Supabase SQL Editor access can close this.**

## Impact right now, in production

- **Reme voice demo is dead** — every request 429s (fails closed, by design, but it means
  the homepage demo does nothing for visitors).
- **Contact form leads are silently losing attribution** — `contact_submissions.source`
  column doesn't exist yet, so every submission is missing where it came from.
- **YourCastle free-deal signup has an unpatched double-allocation race** — the atomic
  allocation function isn't installed, so signup falls back to a narrower but still-racy
  select-then-insert path.

## Do this (3 steps, under 60 seconds)

1. Open the Supabase SQL Editor for project `zjuoxaqdqqdtihmekrcz`:
   https://supabase.com/dashboard/project/zjuoxaqdqqdtihmekrcz/sql/new

2. Paste the **entire contents** of this file and click **Run** once:
   `supabase/migrations/CONSOLIDATED_PENDING_MIGRATIONS.sql`
   (This is all 4 pending migrations already concatenated in the correct order.)

3. Verify it worked:
   ```
   npm run smoke:schema
   ```

## After it's confirmed applied

Delete the fallback branch in `src/app/api/yourcastle/signup/route.ts` (search for
`TRANSITIONAL FALLBACK` in that file) and update the "Known Issues / Blockers" section
of `CLAUDE.md` to mark this resolved.

Full background: `CLAUDE.md` → "Known Issues / Blockers" → "BLOCKED — needs human with
Supabase SQL Editor access", and `NIGHTAGENT_MIGRATION_STATUS.md`.
