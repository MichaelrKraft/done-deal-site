-- Enforce supervised mode as DB-level default on both tables
-- Protects against application bugs that forget to pass the default

ALTER TABLE transactions
  ALTER COLUMN autonomy_mode SET DEFAULT 'supervised';

UPDATE transactions
  SET autonomy_mode = 'supervised'
  WHERE autonomy_mode IS NULL;

ALTER TABLE agents
  ALTER COLUMN autonomy_default SET DEFAULT 'supervised';

UPDATE agents
  SET autonomy_default = 'supervised'
  WHERE autonomy_default IS NULL;
