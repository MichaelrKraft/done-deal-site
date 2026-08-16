# Migration Status Check — 2026-08-16

## TL;DR for the human (copy-paste, ~60 seconds)

Open the Supabase SQL Editor for project `zjuoxaqdqqdtihmekrcz`:
https://supabase.com/dashboard/project/zjuoxaqdqqdtihmekrcz/sql/new

Paste this whole block and click **Run** once:

```sql
-- 1. contact_submissions.source (fixes silently-failing contact form leads)
alter table contact_submissions
  add column if not exists source text;

-- 2. voice_demo_usage table + RPC (fixes TTS cost-cap no-op)
create table if not exists voice_demo_usage (
  ip text not null,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip, usage_date)
);

alter table voice_demo_usage enable row level security;

create or replace function increment_voice_demo_usage(p_ip text, p_daily_cap integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into voice_demo_usage (ip, usage_date, request_count)
  values (p_ip, current_date, 1)
  on conflict (ip, usage_date)
  do update set
    request_count = voice_demo_usage.request_count + 1,
    updated_at = now()
  returning request_count into current_count;

  if current_count > p_daily_cap then
    return false;
  end if;

  return true;
end;
$$;
```

Then verify it worked by running, from a machine with this repo and `.env.local`:

```bash
npm run smoke:schema
```

Expected output: `smoke-test-schema: all 3 checks passed.`

### Optional third migration (not urgent, can go in the same paste)
A third migration was added tonight (2026-08-16) to fix a real but low-severity
race condition (free-deal counter over-allocation under concurrent signups —
see "Bugs Fixed" in `NIGHTAGENT_REPORT.md`). It is **not** required to resolve
the two production risks above and the application code does not depend on it
yet (see the migration file's header comment for why). Apply it whenever
convenient, no urgency:

```sql
-- supabase/migrations/20260816000000_atomic_yourcastle_free_deal_allocation.sql
-- (see that file for the full function body + comments)
```
Just run the file directly from the SQL Editor's "paste file" option, or
copy its contents — it's independent of the two migrations above.

---

## Why an agent can't apply this (verified again tonight, not assumed)

Checked fresh this session, not carried over from prior reports:
- `which supabase` → not installed, no CLI in this sandbox.
- `which psql` → not installed.
- `env | grep -i supabase` and `.env.local` → only `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are present.
  No `DATABASE_URL`, no `SUPABASE_DB_URL`, no `SUPABASE_ACCESS_TOKEN`
  (Management API token) anywhere in env or `.env.local`.
- Probed for a pre-existing `exec_sql`-style raw-SQL RPC in the live database
  — none exists (would 404 the same way `increment_voice_demo_usage` does).

The service-role key authorizes PostgREST calls to *existing* tables/functions
only — it cannot run `ALTER TABLE` / `CREATE TABLE` / `CREATE FUNCTION` DDL.
That requires a direct Postgres connection (CLI, `psql`, or Management API),
none of which are available to any agent in this repo's sandbox. This has now
been independently confirmed across 4+ NightAgent sessions (2026-07-15
through 2026-08-16) — it is an environment/credentials gap, not something a
smarter agent attempt will resolve without one of those being added.

## Live verification against production tonight (read-only probes)

| Check | Result | Evidence |
|---|---|---|
| `contact_submissions.source` column | **MISSING** | `42703`: "column contact_submissions.source does not exist" |
| `voice_demo_usage` table | **MISSING** | `PGRST205`: table not found in schema cache |
| `increment_voice_demo_usage` RPC | **MISSING** | `PGRST202`: function not found in schema cache |

Confirmed via `npm run smoke:schema` (0/3 passed) and independently via a
direct fetch probe. No test rows written — all checks are read-only.

## Current production behavior while unapplied (verified in code, not just assumed)

- **Contact form**: `src/app/api/contact/route.ts` inserts with `source:
  'contact-page'`. Since the column doesn't exist, `insertError` is truthy,
  the route's existing `if (insertError) throw insertError;` fires, and the
  route returns a real `500` with `{ error: 'Internal server error' }` — the
  user sees a visible failure and the lead is NOT silently swallowed. It is
  still lost (no fallback capture path exists), but the failure is loud, not
  silent. No code change was needed for this part; it already fails loudly.
- **Voice demo TTS cost cap**: `src/lib/voiceDemoUsage.ts`
  `checkVoiceDemoDailyCap()` already fails closed — when the RPC 404s,
  `error` is truthy and the function returns `{ allowed: false }`, which
  makes `src/app/api/voice-demo/route.ts` return a `429` and refuse to call
  the paid Gemini TTS API. **Net effect: the voice demo is currently fully
  disabled in production** (every request 429s) rather than unlimited/no-op.
  This is safe (no cost risk) but degrades the demo to non-functional until
  the migration is applied — worth knowing when triaging "why doesn't the
  Reme demo work" reports.

## Action required (human, ~60 seconds)

Run the SQL block at the top of this file in the Supabase SQL Editor, then
run `npm run smoke:schema` to confirm all 3 checks pass.
