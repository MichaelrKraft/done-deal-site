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
