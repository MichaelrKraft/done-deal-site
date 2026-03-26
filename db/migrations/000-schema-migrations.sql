-- Run this once before using the migration runner.
-- Creates a table to track which migrations have been executed.
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
