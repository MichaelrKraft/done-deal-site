-- Done Deal: Seed data for development
-- Run after schema.sql

-- ============================================================
-- YOUR CASTLE REAL ESTATE BROKERAGE
-- ============================================================

INSERT INTO brokerages (id, name, email_domain, config, branding, checklist_template)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Your Castle Real Estate',
  'yourcastle.com',
  '{
    "compliance_email": "documents@yourcastle.org",
    "late_fee_per_day": 10,
    "late_fee_base": 50,
    "default_autonomy_mode": "supervised",
    "pending_action_expiry_hours": 24
  }',
  '{
    "primary_color": "#1a3c5e",
    "logo_url": null,
    "tagline": "Colorado Real Estate Experts"
  }',
  '{
    "stages": ["pre_listing", "active_listing", "under_contract", "pre_closing", "closed"],
    "required_docs": ["cbs", "spd", "lead_paint", "cda", "wire_fraud_warning"]
  }'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DEMO AGENT (linked to seed brokerage, no auth user yet)
-- ============================================================

INSERT INTO agents (id, brokerage_id, auth_user_id, name, email, autonomy_default)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'Demo Agent',
  'demo@yourcastle.com',
  'supervised'
)
ON CONFLICT (email) DO NOTHING;
