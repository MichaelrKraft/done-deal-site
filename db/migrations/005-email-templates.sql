-- Phase 2B: Custom Email Templates
-- Allows agents to create reusable email templates with variable substitution

CREATE TABLE IF NOT EXISTS email_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      uuid REFERENCES agents(id) ON DELETE CASCADE,
  brokerage_id  uuid NOT NULL REFERENCES brokerages(id) ON DELETE CASCADE,
  name          text NOT NULL,
  category      text NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'under_contract', 'pre_closing', 'post_close', 'follow_up', 'compliance')),
  subject       text NOT NULL,
  body          text NOT NULL,
  variables     text[] NOT NULL DEFAULT '{}',
  is_shared     boolean NOT NULL DEFAULT false,
  usage_count   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_agent ON email_templates(agent_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_brokerage ON email_templates(brokerage_id);
