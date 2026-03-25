-- Phase 3.5A: Google Workspace Integration
-- Adds Google token storage and provider selection columns to agents table.

ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_token jsonb;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS email_provider text NOT NULL DEFAULT 'none'
  CHECK (email_provider IN ('none', 'outlook', 'google'));

ALTER TABLE agents ADD COLUMN IF NOT EXISTS calendar_provider text NOT NULL DEFAULT 'none'
  CHECK (calendar_provider IN ('none', 'outlook', 'google'));

-- Backfill: if agent already has outlook_token, set providers to 'outlook'
UPDATE agents
SET email_provider = 'outlook', calendar_provider = 'outlook'
WHERE outlook_token IS NOT NULL
  AND email_provider = 'none';
