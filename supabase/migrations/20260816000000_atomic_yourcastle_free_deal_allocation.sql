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
