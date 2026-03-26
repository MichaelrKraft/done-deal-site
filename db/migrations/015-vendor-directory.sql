CREATE TABLE IF NOT EXISTS preferred_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('title', 'lender', 'inspector', 'attorney', 'hoa')),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  is_brokerage_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preferred_vendors_agent_id ON preferred_vendors(agent_id);
CREATE INDEX IF NOT EXISTS idx_preferred_vendors_category ON preferred_vendors(category);
