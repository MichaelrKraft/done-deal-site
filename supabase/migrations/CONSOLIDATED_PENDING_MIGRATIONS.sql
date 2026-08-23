-- ============================================================================
-- CONSOLIDATED PENDING MIGRATIONS — manual-apply convenience copy
-- ============================================================================
-- This file is NOT a real migration and Supabase will never run it
-- automatically (it is intentionally excluded from normal migration
-- ordering by its name/prefix). It exists purely so a human can copy-paste
-- ONCE into the Supabase SQL Editor instead of opening four separate files.
--
-- Project: zjuoxaqdqqdtihmekrcz
-- SQL Editor: https://supabase.com/dashboard/project/zjuoxaqdqqdtihmekrcz/sql/new
--
-- Contains, in the correct dependency order, the full contents of:
--   1. 20260715000000_add_source_to_contact_submissions.sql
--   2. 20260716000000_create_voice_demo_usage.sql
--   3. 20260816000000_atomic_yourcastle_free_deal_allocation.sql
--   4. 20260821000000_add_voice_demo_global_daily_cap.sql
--
-- Safe to run as a single paste: file 4's `create or replace function
-- increment_voice_demo_usage` supersedes file 2's version of the same
-- function (same name, added optional param), which is why file 2 must
-- run before file 4 rather than being skipped.
--
-- After running, verify with:
--   npm run smoke:schema
--
-- Once confirmed applied, see CLAUDE.md's "Known Issues / Blockers" section
-- for the follow-up code changes (removing fallback branches) that become
-- safe to make.
-- ============================================================================


-- ============================================================================
-- 1. 20260715000000_add_source_to_contact_submissions.sql
-- ============================================================================
-- Fixes schema drift discovered 2026-07-15: production's `contact_submissions`
-- table was NOT created by 20260713020357_create_contact_submissions.sql.
-- It already existed (rows dated 2026-06-04, before that migration file was
-- even written) with a different shape: it has `ip` and `user_agent` columns
-- instead of `source`. Nothing in this codebase writes to `ip`/`user_agent`,
-- so they're left alone (non-destructive) rather than dropped.
--
-- src/app/api/contact/route.ts inserts a `source` value ('contact-page') on
-- every submission. Without this column, every live submission 500s with
-- Supabase error PGRST204 "Could not find the 'source' column of
-- 'contact_submissions' in the schema cache" — verified live against
-- production via the REST API on 2026-07-15.
--
-- This migration is additive only: safe to run against the existing table
-- regardless of which columns it already has.

alter table contact_submissions
  add column if not exists source text;


-- ============================================================================
-- 2. 20260716000000_create_voice_demo_usage.sql
-- ============================================================================
-- Persistent per-IP daily usage cap for the Reme voice demo (src/app/api/voice-demo/route.ts).
--
-- Why: the existing rate limiter (src/lib/rateLimit.ts) is in-memory only,
-- so it resets to zero on every redeploy/restart. The voice demo calls the
-- paid Gemini TTS API, so a burst of requests right after a deploy could run
-- up API costs before the in-memory counter has any state. This table +
-- function give a persistent backstop that survives restarts.
--
-- No agent in this environment has Supabase migration/MCP access (see
-- 20260713020357_create_contact_submissions.sql), so this file exists for a
-- human to one-click-apply via the Supabase SQL editor or `supabase db push`.

create table if not exists voice_demo_usage (
  ip text not null,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip, usage_date)
);

-- Row Level Security: only ever accessed via the service-role key from the
-- server-side API route, never from the browser/anon client.
alter table voice_demo_usage enable row level security;

-- Atomically checks the current day's count for an IP against the cap and,
-- if under the cap, increments it in the same statement. Using `insert ...
-- on conflict do update` with a row-level lock (implicit in the upsert)
-- prevents a race where two concurrent requests both read "under cap" before
-- either writes back an incremented count.
--
-- NOTE: this version is superseded by the `create or replace function` in
-- section 4 below (adds an optional p_global_daily_cap param). Kept here so
-- the table/RLS setup statements above still run in the right order; running
-- both function definitions back-to-back is harmless.
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

-- Periodic cleanup is left to a human/cron (e.g. `delete from voice_demo_usage
-- where usage_date < current_date - interval '7 days'`) since this repo has
-- no scheduled job runner. Rows are tiny (one per IP per day) so unbounded
-- growth over weeks is not an operational risk before that's added.


-- ============================================================================
-- 3. 20260816000000_atomic_yourcastle_free_deal_allocation.sql
-- ============================================================================
-- Fixes a read-then-write race in src/app/api/yourcastle/signup/route.ts:
-- it reads the current signup count, computes gotFreeDeal/spotNumber in
-- application code, then inserts. Two concurrent signups can both read the
-- same count before either insert lands, so both can be granted a free deal
-- even once FREE_DEAL_LIMIT has technically been reached (over-allocation).
--
-- Documented but explicitly not fixed in the 2026-08-05 NightAgent session
-- (see NIGHTAGENT_REPORT.md) pending a migration-authoring session, since a
-- proper fix needs an atomic Postgres function — same pattern as
-- increment_voice_demo_usage in 20260716000000_create_voice_demo_usage.sql.
--
-- This function performs the count-check-insert as a single statement so
-- concurrent requests serialize on the insert rather than racing on a
-- separate read. It is intentionally NOT yet called from
-- src/app/api/yourcastle/signup/route.ts: switching the route to call this
-- RPC before the migration is applied to production would make every
-- signup 500 (function not found) instead of just leaving the existing,
-- narrower race in place. Given the two other migrations already stuck
-- pending human application in this repo, wiring in a third dependency
-- would compound the outage risk. Once this migration is applied (see
-- NIGHTAGENT_MIGRATION_STATUS.md), a follow-up change should swap the
-- route's "select count then insert" block for a single call to
-- allocate_yourcastle_signup(...), matching the shape of
-- checkVoiceDemoDailyCap's supabaseAdmin.rpc(...) call in
-- src/lib/voiceDemoUsage.ts.

create or replace function allocate_yourcastle_signup(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_brokerage text,
  p_source text,
  p_free_deal_limit integer
)
returns table (
  new_id uuid,
  got_free_deal boolean,
  spot_number integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_count integer;
  v_got_free_deal boolean;
  v_spot_number integer;
  v_new_id uuid;
begin
  -- Lock out concurrent allocations for the duration of this transaction so
  -- the count-then-insert below cannot race with another call to this same
  -- function. advisory xact lock is released automatically at commit/rollback.
  perform pg_advisory_xact_lock(hashtext('yourcastle_signup_allocation'));

  select count(*) into v_current_count from yourcastle_signups;

  v_got_free_deal := v_current_count < p_free_deal_limit;
  v_spot_number := v_current_count + 1;

  insert into yourcastle_signups (
    first_name, last_name, email, phone, brokerage, free_deal, spot_number, source
  ) values (
    p_first_name, p_last_name, p_email, p_phone, p_brokerage, v_got_free_deal, v_spot_number, p_source
  )
  returning id into v_new_id;

  new_id := v_new_id;
  got_free_deal := v_got_free_deal;
  spot_number := v_spot_number;
  return next;
end;
$$;


-- ============================================================================
-- 4. 20260821000000_add_voice_demo_global_daily_cap.sql
-- ============================================================================
-- Adds an aggregate (all-IPs) daily cap for the Reme voice demo, on top of
-- the existing per-IP cap in 20260716000000_create_voice_demo_usage.sql.
--
-- Why: the per-IP cap (30 req/day) is proven cost-safe per IP (see CLAUDE.md's
-- Gemini TTS pricing audit: worst case ~$0.45/IP/day). But it has no ceiling
-- across IPs — a distributed spike (many IPs at once, e.g. a bot swarm or
-- viral traffic) could still run up unbounded aggregate cost since each IP
-- is individually cheap. This adds a single shared counter row, checked in
-- the same atomic statement as the per-IP check, so the total request count
-- across all IPs for a given day is capped too.
--
-- Same "no agent has Supabase DDL access" situation as prior migrations in
-- this repo — this file is ready for a human to apply via the Supabase SQL
-- Editor or `supabase db push`.

create table if not exists voice_demo_usage_global (
  usage_date date primary key,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table voice_demo_usage_global enable row level security;

-- Atomically checks + increments BOTH the per-IP counter (existing table)
-- and the new global counter in one statement, so a request is only allowed
-- through when it is under both caps. Replaces increment_voice_demo_usage
-- with a version that also enforces p_global_daily_cap; kept as the same
-- function name/signature-compatible caller contract (extra param) so only
-- one RPC needs to be called per request.
create or replace function increment_voice_demo_usage(
  p_ip text,
  p_daily_cap integer,
  p_global_daily_cap integer default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  global_count integer;
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

  -- Global cap is optional (null skips the aggregate check) so existing
  -- callers that don't pass it keep prior per-IP-only behavior.
  if p_global_daily_cap is not null then
    insert into voice_demo_usage_global (usage_date, request_count)
    values (current_date, 1)
    on conflict (usage_date)
    do update set
      request_count = voice_demo_usage_global.request_count + 1,
      updated_at = now()
    returning request_count into global_count;

    if global_count > p_global_daily_cap then
      return false;
    end if;
  end if;

  return true;
end;
$$;

-- Same cleanup note as voice_demo_usage: no scheduled job runner in this
-- repo, so periodic deletion of old rows (`delete from voice_demo_usage_global
-- where usage_date < current_date - interval '7 days'`) is left to a human/cron.
-- Growth is one row per day, so this is not an operational risk in the interim.

-- ============================================================================
-- END OF CONSOLIDATED BLOCK
-- ============================================================================
