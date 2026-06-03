-- Run this once in your Supabase SQL editor
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

-- Indexes for lookup and reporting
create index if not exists contact_submissions_email_idx on contact_submissions(email);
create index if not exists contact_submissions_created_at_idx on contact_submissions(created_at desc);

-- Allow the service role to insert/select (RLS off for simplicity)
alter table contact_submissions disable row level security;
