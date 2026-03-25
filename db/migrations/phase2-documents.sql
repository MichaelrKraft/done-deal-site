-- Phase 2A: Document Storage & Tracking
-- Adds versioning, upload metadata, and visibility columns to documents table

ALTER TABLE documents ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES documents(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES agents(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_via text NOT NULL DEFAULT 'ui'
  CHECK (uploaded_via IN ('ui', 'inbound_email', 'client_portal', 'docusign'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size_bytes integer;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_hash text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'agent_only'
  CHECK (visibility IN ('agent_only', 'shared', 'client_visible'));

-- Update the status constraint to include 'superseded'
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_status_check
  CHECK (status IN ('missing', 'uploaded', 'sent', 'signed', 'n_a', 'superseded'));
