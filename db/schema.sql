-- Done Deal: Full Postgres schema
-- Run this in your Supabase SQL editor or via migration

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS brokerages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email_domain    text,
  config          jsonb NOT NULL DEFAULT '{}',
  branding        jsonb NOT NULL DEFAULT '{}',
  checklist_template jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brokerage_id      uuid NOT NULL REFERENCES brokerages(id) ON DELETE CASCADE,
  auth_user_id      uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name              text NOT NULL,
  email             text NOT NULL UNIQUE,
  outlook_token     jsonb,
  telegram_id       text,
  whatsapp_id       text,
  autonomy_default  text NOT NULL DEFAULT 'supervised'
                    CHECK (autonomy_default IN ('supervised', 'autonomous')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  brokerage_id     uuid NOT NULL REFERENCES brokerages(id) ON DELETE CASCADE,
  property_address text NOT NULL,
  side             text NOT NULL CHECK (side IN ('buyer', 'seller')),
  stage            text NOT NULL DEFAULT 'pre_listing'
                   CHECK (stage IN ('pre_listing', 'active_listing', 'under_contract',
                                    'pre_closing', 'closed', 'archived')),
  mec_date         date,
  closing_date     date,
  list_price       numeric(12,2),
  sale_price       numeric(12,2),
  earnest_money    numeric(10,2),
  property_details jsonb NOT NULL DEFAULT '{}',
  autonomy_mode    text NOT NULL DEFAULT 'supervised'
                   CHECK (autonomy_mode IN ('supervised', 'autonomous')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parties (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  role           text NOT NULL CHECK (role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent',
                                               'lender', 'title', 'inspector', 'appraiser',
                                               'hoa', 'other')),
  name           text NOT NULL,
  email          text,
  phone          text,
  company        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deadlines (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id   uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  name             text NOT NULL,
  due_date         date NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'completed', 'waived', 'extended', 'breached')),
  calculated_from  text CHECK (calculated_from IN ('mec', 'closing')),
  days_offset      integer,
  is_business_days boolean NOT NULL DEFAULT false,
  risk_level       text NOT NULL DEFAULT 'medium'
                   CHECK (risk_level IN ('low', 'medium', 'high')),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  stage          text NOT NULL,
  title          text NOT NULL,
  description    text,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'n_a')),
  risk_level     text NOT NULL DEFAULT 'medium'
                 CHECK (risk_level IN ('low', 'medium', 'high')),
  assigned_to    text NOT NULL DEFAULT 'agent'
                 CHECK (assigned_to IN ('agent', 'ai', 'lender', 'title', 'inspector',
                                        'buyer', 'seller')),
  due_date       date,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id        uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  doc_type              text NOT NULL,
  display_name          text NOT NULL,
  status                text NOT NULL DEFAULT 'missing'
                        CHECK (status IN ('missing', 'uploaded', 'sent', 'signed', 'n_a')),
  required              boolean NOT NULL DEFAULT true,
  file_path             text,
  docusign_envelope_id  text,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  agent_id        uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action_type     text NOT NULL,
  risk_level      text NOT NULL DEFAULT 'medium'
                  CHECK (risk_level IN ('low', 'medium', 'high')),
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'executed',
                                    'auto_executed', 'expired', 'skipped')),
  draft_content   jsonb NOT NULL DEFAULT '{}',
  context_summary text,
  executed_at     timestamptz,
  approved_by     uuid REFERENCES agents(id),
  approved_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id   uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  requirement_type text NOT NULL,
  triggered_by     text,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'in_progress', 'complete', 'n_a', 'waived')),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_threads (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id           uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  party_id                 uuid REFERENCES parties(id) ON DELETE SET NULL,
  subject                  text,
  outlook_conversation_id  text,
  messages                 jsonb NOT NULL DEFAULT '[]',
  last_message_at          timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_agents_brokerage_id        ON agents(brokerage_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent_id      ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_brokerage_id  ON transactions(brokerage_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stage         ON transactions(stage);
CREATE INDEX IF NOT EXISTS idx_deadlines_transaction_id   ON deadlines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date         ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status           ON deadlines(status);
CREATE INDEX IF NOT EXISTS idx_tasks_transaction_id       ON tasks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status               ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_transaction_id   ON documents(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_transaction_id  ON ai_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_agent_id        ON ai_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_status          ON ai_actions(status);
CREATE INDEX IF NOT EXISTS idx_email_threads_transaction_id ON email_threads(transaction_id);
CREATE INDEX IF NOT EXISTS idx_compliance_transaction_id  ON compliance_requirements(transaction_id);
CREATE INDEX idx_agents_auth_user_id ON agents(auth_user_id);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ai_actions_updated_at
  BEFORE UPDATE ON ai_actions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE brokerages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads       ENABLE ROW LEVEL SECURITY;

-- Helper: get the agent row for the current auth user
CREATE OR REPLACE FUNCTION current_agent_id()
RETURNS uuid AS $$
  SELECT id FROM agents WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION current_brokerage_id()
RETURNS uuid AS $$
  SELECT brokerage_id FROM agents WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- brokerages: agents see only their brokerage
CREATE POLICY "agents_read_own_brokerage" ON brokerages
  FOR SELECT USING (id = current_brokerage_id());

-- agents: agents see only agents in their brokerage
CREATE POLICY "agents_read_own_brokerage_agents" ON agents
  FOR SELECT USING (brokerage_id = current_brokerage_id());

CREATE POLICY "agents_update_own_profile" ON agents
  FOR UPDATE USING (auth_user_id = auth.uid());

-- transactions: agents see only their own transactions
CREATE POLICY "agents_read_own_transactions" ON transactions
  FOR SELECT USING (agent_id = current_agent_id());

CREATE POLICY "agents_insert_own_transactions" ON transactions
  FOR INSERT WITH CHECK (agent_id = current_agent_id() AND brokerage_id = current_brokerage_id());

CREATE POLICY "agents_update_own_transactions" ON transactions
  FOR UPDATE USING (agent_id = current_agent_id());

CREATE POLICY "agents_delete_own_transactions" ON transactions
  FOR DELETE USING (agent_id = current_agent_id());

-- parties: scoped through transactions
CREATE POLICY "agents_manage_parties" ON parties
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- deadlines: scoped through transactions
CREATE POLICY "agents_manage_deadlines" ON deadlines
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- tasks: scoped through transactions
CREATE POLICY "agents_manage_tasks" ON tasks
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- documents: scoped through transactions
CREATE POLICY "agents_manage_documents" ON documents
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- ai_actions: agents see their own actions
CREATE POLICY "agents_manage_ai_actions" ON ai_actions
  FOR ALL USING (
    agent_id = current_agent_id()
    AND transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- compliance_requirements: scoped through transactions
CREATE POLICY "agents_manage_compliance" ON compliance_requirements
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );

-- email_threads: scoped through transactions
CREATE POLICY "agents_manage_email_threads" ON email_threads
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE agent_id = current_agent_id())
  );
