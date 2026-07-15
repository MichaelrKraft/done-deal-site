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
