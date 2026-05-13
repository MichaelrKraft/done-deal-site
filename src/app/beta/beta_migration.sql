-- Run this once in your Supabase SQL editor
-- Step 1: Brokerage config table
create table if not exists beta_brokerages (
  slug text primary key,
  name text not null,
  short_name text not null,
  badge_text text not null,
  scarcity_label text not null,
  free_deal_limit integer not null default 20,
  source_tag text not null,
  waitlist_message text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table beta_brokerages disable row level security;

-- Step 2: Unified signups table (brokerage_slug + email unique together)
create table if not exists beta_signups (
  id uuid primary key default gen_random_uuid(),
  brokerage_slug text not null references beta_brokerages(slug),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  free_deal boolean default false,
  spot_number integer,
  source text not null,
  created_at timestamptz default now(),
  unique(brokerage_slug, email)
);
create index if not exists beta_signups_slug_idx on beta_signups(brokerage_slug);
alter table beta_signups disable row level security;

-- Step 3: Seed brokerage configs
insert into beta_brokerages (slug, name, short_name, badge_text, scarcity_label, free_deal_limit, source_tag, waitlist_message) values
  (
    'yourcastle',
    'Your Castle Real Estate',
    'Your Castle',
    'Your Castle Real Estate — Exclusive Agent Offer',
    'of 20 FREE deals remaining for today''s event',
    20,
    'yourcastle-event-2026',
    'The 20 free deals went fast — but you''re signed up. We''ll be in touch with a special offer just for Your Castle agents.'
  ),
  (
    'exprealty',
    'eXp Realty',
    'eXp Realty',
    'eXp Realty — Exclusive Beta Offer',
    'of 20 FREE deals remaining for the eXp beta cohort',
    20,
    'exprealty-beta-2026',
    'The free deals went fast — but you''re signed up. We''ll be in touch with a special offer just for eXp agents.'
  )
on conflict (slug) do nothing;

-- Step 4: Migrate existing yourcastle_signups → beta_signups
-- Safe to run multiple times (on conflict do nothing)
insert into beta_signups (brokerage_slug, first_name, last_name, email, phone, free_deal, spot_number, source, created_at)
select
  'yourcastle',
  first_name,
  last_name,
  email,
  phone,
  free_deal,
  spot_number,
  source,
  created_at
from yourcastle_signups
on conflict (brokerage_slug, email) do nothing;
