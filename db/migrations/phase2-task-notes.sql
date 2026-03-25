CREATE TABLE IF NOT EXISTS task_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_type text NOT NULL CHECK (author_type IN ('agent', 'ai', 'system')),
  author_id   uuid REFERENCES agents(id),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);
