-- Phase 3B: Client Portal — portal_links table
CREATE TABLE IF NOT EXISTS portal_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  token           text NOT NULL UNIQUE,
  party_role      text NOT NULL CHECK (party_role IN ('buyer', 'seller')),
  created_by      uuid NOT NULL REFERENCES agents(id),
  is_active       boolean NOT NULL DEFAULT true,
  expires_at      timestamptz,
  access_count    integer NOT NULL DEFAULT 0,
  last_accessed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_links_token ON portal_links(token);
CREATE INDEX IF NOT EXISTS idx_portal_links_transaction ON portal_links(transaction_id);
