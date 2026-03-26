ALTER TABLE agents ADD COLUMN IF NOT EXISTS preferred_model text
  NOT NULL DEFAULT 'claude-sonnet-4-6'
  CHECK (preferred_model IN ('claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'));
