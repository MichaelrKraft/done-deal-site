#!/usr/bin/env tsx
/**
 * Migration status reporter.
 *
 * Lists pending migrations. Actual SQL execution must be done via:
 *   npx supabase db push           (Supabase CLI — recommended for CI/CD)
 *   Supabase Studio SQL editor     (manual)
 *
 * This script records which migrations have been executed in schema_migrations.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function status() {
  const migrationsDir = path.join(process.cwd(), 'db', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const { data: executed, error } = await supabase
    .from('schema_migrations')
    .select('filename')

  if (error) {
    console.error('Could not read schema_migrations table:', error.message)
    console.error('Run 000-schema-migrations.sql in Supabase Studio first.')
    process.exit(1)
  }

  const executedSet = new Set(executed?.map((r: { filename: string }) => r.filename) ?? [])
  const pending = files.filter(f => !executedSet.has(f))
  const done = files.filter(f => executedSet.has(f))

  console.log(`\nMigration status (${files.length} total):\n`)
  done.forEach(f => console.log(`  [x] ${f}`))
  pending.forEach(f => console.log(`  [ ] ${f}  <- PENDING`))

  if (pending.length === 0) {
    console.log('\nAll migrations are up to date\n')
  } else {
    console.log(`\n${pending.length} pending migration(s) need to be run in Supabase Studio.\n`)
    process.exit(1)
  }
}

status().catch(err => {
  console.error('Error:', (err as Error).message)
  process.exit(1)
})
