-- Documents/ensures the UNIQUE constraint on yourcastle_signups.email that
-- src/app/api/yourcastle/signup/route.ts relies on for its duplicate-signup
-- check (a select-then-insert, which is race-prone without a DB-level
-- backstop).
--
-- Status: this table has no prior migration file in this repo (it predates
-- the supabase/migrations/ directory), so its schema was undocumented here.
-- Verified live against production on 2026-07-16 via a real duplicate-email
-- insert against the REST API: it was rejected with Postgres error 23505
-- ("duplicate key value violates unique constraint
-- yourcastle_signups_email_key"), confirming the constraint already exists
-- in production under that exact name.
--
-- This migration is a safety net for other environments (fresh local/staging
-- databases) where the constraint may not exist yet. It is additive and
-- idempotent: guarded by a catalog check so it is a no-op if the constraint
-- (under any name) is already present, and does not touch existing data.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'yourcastle_signups'::regclass
      and contype = 'u'
      and conkey = (
        select array_agg(attnum order by attnum)
        from pg_attribute
        where attrelid = 'yourcastle_signups'::regclass
          and attname = 'email'
      )
  ) then
    alter table yourcastle_signups
      add constraint yourcastle_signups_email_key unique (email);
  end if;
end;
$$;
