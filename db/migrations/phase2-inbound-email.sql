-- Phase 3A: Inbound Email Inbox
-- Adds inbox_address to agents, plus inbound_emails and inbound_attachments tables.

ALTER TABLE agents ADD COLUMN IF NOT EXISTS inbox_address text UNIQUE;

CREATE TABLE IF NOT EXISTS inbound_emails (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          uuid REFERENCES agents(id) ON DELETE CASCADE,
  transaction_id    uuid REFERENCES transactions(id) ON DELETE SET NULL,
  from_email        text NOT NULL,
  from_name         text,
  subject           text,
  body_text         text,
  message_id        text UNIQUE,
  in_reply_to       text,
  attachment_count  integer NOT NULL DEFAULT 0,
  processing_status text NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'completed', 'failed', 'duplicate')),
  error_message     text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inbound_attachments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_email_id  uuid NOT NULL REFERENCES inbound_emails(id) ON DELETE CASCADE,
  document_id       uuid REFERENCES documents(id) ON DELETE SET NULL,
  filename          text NOT NULL,
  content_type      text NOT NULL,
  size_bytes        integer NOT NULL,
  storage_path      text,
  is_pdf            boolean NOT NULL DEFAULT false,
  content_hash      text,
  extraction_status text NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending', 'processing', 'success', 'failed', 'skipped')),
  extracted_data    jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_emails_agent ON inbound_emails(agent_id);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_message_id ON inbound_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_inbound_attachments_email ON inbound_attachments(inbound_email_id);
