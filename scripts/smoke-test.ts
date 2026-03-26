/**
 * Production Smoke Test
 * Validates deployment readiness: DB tables, env vars, integrations.
 * Run: npm run smoke-test
 */

import { createClient } from '@supabase/supabase-js'

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
]

const OPTIONAL_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SENTRY_DSN',
  'TELEGRAM_BOT_TOKEN',
  'DOCUSIGN_WEBHOOK_HMAC_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
]

const REQUIRED_TABLES = [
  'agents',
  'transactions',
  'deadlines',
  'tasks',
  'parties',
  'ai_actions',
  'documents',
  'compliance_requirements',
  'preferred_vendors',
  'email_templates',
  'schema_migrations',
]

interface CheckResult {
  name: string
  passed: boolean
  detail: string
}

const results: CheckResult[] = []

function check(name: string, passed: boolean, detail: string) {
  results.push({ name, passed, detail })
}

async function main() {
  console.log('\n=== Done Deal Production Smoke Test ===\n')

  // 1. Required env vars
  for (const envVar of REQUIRED_ENV_VARS) {
    const val = process.env[envVar]
    check(`env:${envVar}`, !!val, val ? 'Set' : 'MISSING — required for operation')
  }

  // 2. Optional env vars (warning, not failure)
  for (const envVar of OPTIONAL_ENV_VARS) {
    const val = process.env[envVar]
    check(`env:${envVar} (optional)`, true, val ? 'Set' : 'Not set — feature disabled')
  }

  // 3. Supabase connection
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    check('supabase:connection', false, 'Cannot test — missing URL or service role key')
  } else {
    const supabase = createClient(url, key)

    // Test basic query
    const { error: connError } = await supabase.from('agents').select('id').limit(1)
    check('supabase:connection', !connError, connError ? `Failed: ${connError.message}` : 'Connected')

    // 4. Required tables
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('*').limit(0)
      check(`table:${table}`, !error, error ? `Missing or error: ${error.message}` : 'Exists')
    }
  }

  // 5. Print results
  console.log('')
  let passed = 0
  let failed = 0

  for (const r of results) {
    const icon = r.passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
    console.log(`  [${icon}] ${r.name} — ${r.detail}`)
    if (r.passed) passed++
    else failed++
  }

  console.log(`\n  ${passed} passed, ${failed} failed out of ${results.length} checks\n`)

  if (failed > 0) {
    console.log('  Some checks failed. Fix the issues above before deploying.\n')
    process.exit(1)
  } else {
    console.log('  All checks passed. Ready for deployment.\n')
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err)
  process.exit(1)
})
