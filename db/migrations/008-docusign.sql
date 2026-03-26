-- Phase 4: DocuSign E-Signature Integration
-- Adds esign tracking columns to documents and a new esign_events table.

-- Add esign columns to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS esign_status text
  CHECK (esign_status IN ('created', 'sent', 'delivered', 'signed', 'declined', 'voided'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS esign_provider text
  CHECK (esign_provider IN ('docusign', 'dotloop'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS esign_metadata jsonb NOT NULL DEFAULT '{}';

-- Add docusign_token to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS docusign_token jsonb;

-- E-sign webhook events log
CREATE TABLE IF NOT EXISTS esign_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     uuid REFERENCES documents(id) ON DELETE SET NULL,
  transaction_id  uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  provider        text NOT NULL DEFAULT 'docusign',
  event_type      text NOT NULL,
  envelope_id     text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}',
  processed       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_esign_events_envelope ON esign_events(envelope_id);
CREATE INDEX IF NOT EXISTS idx_esign_events_transaction ON esign_events(transaction_id);
