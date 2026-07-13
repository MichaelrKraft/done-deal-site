-- Creates the contact_submissions table used by src/app/api/contact/route.ts.
--
-- Status: this has been an unresolved blocker flagged in 6+ consecutive
-- NightAgent sessions (see NIGHTAGENT_REPORT.md, 2026-07-04 entry onward) —
-- the contact form has been deployed and validated end-to-end but every
-- submission 500s because this table does not exist in production Supabase.
--
-- No agent in this environment has Supabase migration/MCP access, so this
-- file exists purely so a human can one-click-apply it via the Supabase
-- SQL editor or `supabase db push` / `supabase migration up` with the CLI,
-- instead of re-deriving the SQL from a markdown report every night.
--
-- Schema mirrors the existing yourcastle_signups conventions used elsewhere
-- in this codebase (uuid primary key, timestamptz created_at default now()).

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  source text,
  created_at timestamptz not null default now()
);

-- Row Level Security: this table is only ever written to via the service-role
-- key from the server-side API route (src/lib/supabase.ts `supabaseAdmin`),
-- never from the browser/anon client. Enable RLS with no policies so the
-- anon key cannot read or write this table even if it were ever used here.
alter table contact_submissions enable row level security;
