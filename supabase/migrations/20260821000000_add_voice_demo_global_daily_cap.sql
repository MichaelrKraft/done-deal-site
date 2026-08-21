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
