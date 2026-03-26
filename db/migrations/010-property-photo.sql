-- Add property photo URL to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS photo_url text;
