# Migration Status Check — 2026-07-17

## Migrations in repo
- `supabase/migrations/20260715000000_add_source_to_contact_submissions.sql` — adds `source text` column to `contact_submissions`.
- `supabase/migrations/20260716000000_create_voice_demo_usage.sql` — creates `voice_demo_usage` table + `increment_voice_demo_usage(p_ip, p_daily_cap)` RPC for the TTS daily cost cap.

## Live verification against production (zjuoxaqdqqdtihmekrcz), via service-role key + `@supabase/supabase-js`

Checked with direct REST/RPC calls (no rows written):

| Check | Result | Evidence |
|---|---|---|
| `contact_submissions.source` column | **MISSING** | `select source from contact_submissions limit 1` → Postgres `42703`: "column contact_submissions.source does not exist" |
| `voice_demo_usage` table | **MISSING** | `select * from voice_demo_usage limit 1` → PostgREST `PGRST205`: table not found in schema cache |
| `increment_voice_demo_usage` RPC | **MISSING** | `rpc('increment_voice_demo_usage', ...)` → PostgREST `PGRST202`: function not found |

Both migrations are confirmed **unapplied in production** as of this check.

## Why I could NOT apply the migrations tonight

I have the Supabase **service-role key** and **project URL** only. Applying `ALTER TABLE` / `CREATE TABLE` / `CREATE FUNCTION` DDL requires one of:
- A direct Postgres connection string (no `DATABASE_URL` / `SUPABASE_DB_URL` in `.env.local` or anywhere in this repo)
- The Supabase CLI (`supabase db push`) — not installed in this sandbox, no `supabase` binary
- `psql` — not installed in this sandbox
- The Supabase Management API — requires a separate personal access token, not present in this environment
- A pre-existing `exec_sql`/raw-SQL RPC in the database — confirmed **not present** (probed live: `PGRST202`, function does not exist)

The service-role key only authorizes PostgREST calls to *existing* tables/functions — it cannot execute arbitrary DDL. This is exactly the gap the `20260716000000_create_voice_demo_usage.sql` file's own comment anticipated ("No agent in this environment has Supabase migration/MCP access... this file exists for a human to one-click-apply via the Supabase SQL editor or `supabase db push`").

I did not attempt any workaround that would require inventing schema beyond the committed SQL, per instructions.

## Action required (human, ~2 minutes)

Open the Supabase SQL Editor for project `zjuoxaqdqqdtihmekrcz` and run, in order:
1. `supabase/migrations/20260715000000_add_source_to_contact_submissions.sql`
2. `supabase/migrations/20260716000000_create_voice_demo_usage.sql`

Both are additive/idempotent (`if not exists` / `create or replace`), safe to run directly.

## Current production risk (unchanged, unresolved)
1. **Contact form leads may be silently dropped/500ing** — `source` column missing, matches the PGRST204 error already documented in the migration comment as observed live on 2026-07-15.
2. **TTS endpoint has NO persistent cost ceiling** — the fail-closed daily cap added Friday night (commits 709298f, 06a91f8) is a no-op in production; only the in-memory (reset-on-redeploy) limiter is active.

No test rows were inserted or need cleanup — all checks above were read-only probes against nonexistent columns/tables/functions, which correctly failed before any write occurred.
