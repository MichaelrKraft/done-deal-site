-- Migration 016: Add AI document scan columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS scan_findings JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'complete', 'failed'));
