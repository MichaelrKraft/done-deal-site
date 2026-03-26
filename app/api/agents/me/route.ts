import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function validateTelegramId(raw: unknown): { valid: boolean; value: string | null; error?: string } {
  if (raw === null || raw === '') {
    return { valid: true, value: null }
  }

  if (typeof raw !== 'string') {
    return { valid: false, value: null, error: 'telegram_id must be a string or null' }
  }

  // Strip leading @ if present
  const cleaned = raw.startsWith('@') ? raw.slice(1) : raw

  if (cleaned.length < 5 || cleaned.length > 32) {
    return { valid: false, value: null, error: 'Telegram username must be 5-32 characters' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return { valid: false, value: null, error: 'Telegram username can only contain letters, numbers, and underscores' }
  }

  return { valid: true, value: cleaned }
}

const VALID_AUTONOMY_MODES = ['supervised', 'autonomous']
const VALID_MODELS = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6']

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body = await request.json() as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  // telegram_id
  if ('telegram_id' in body) {
    const validation = validateTelegramId(body.telegram_id)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    updateData.telegram_id = validation.value
  }

  // autonomy_default
  if ('autonomy_default' in body) {
    if (!VALID_AUTONOMY_MODES.includes(body.autonomy_default as string)) {
      return NextResponse.json({ error: 'autonomy_default must be supervised or autonomous' }, { status: 400 })
    }
    updateData.autonomy_default = body.autonomy_default
  }

  // preferred_model
  if ('preferred_model' in body) {
    if (!VALID_MODELS.includes(body.preferred_model as string)) {
      return NextResponse.json({ error: 'Invalid model selection' }, { status: 400 })
    }
    updateData.preferred_model = body.preferred_model
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('id', agent.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
