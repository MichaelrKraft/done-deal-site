-- Phase 5: Team Collaboration
-- Allows agents to share access with assistants, team leads, TCs, and brokers.

CREATE TABLE IF NOT EXISTS team_memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('assistant', 'team_lead', 'tc', 'broker')),
  permissions jsonb NOT NULL DEFAULT '{"can_view_transactions":true,"can_approve_actions":false,"can_edit_transactions":true,"can_manage_documents":true,"can_view_analytics":false}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_team_memberships_agent ON team_memberships(agent_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_member ON team_memberships(member_id);
