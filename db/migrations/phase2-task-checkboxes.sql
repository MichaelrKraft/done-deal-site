-- Phase 2: Task Checkboxes — manual completion tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES agents(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_method text CHECK (completion_method IN ('manual', 'ai_auto', 'ai_approved'));
