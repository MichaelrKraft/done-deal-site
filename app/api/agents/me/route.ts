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

  if (!('telegram_id' in body)) {
    return NextResponse.json({ error: 'Missing telegram_id field' }, { status: 400 })
  }

  const validation = validateTelegramId(body.telegram_id)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('agents')
    .update({ telegram_id: validation.value })
    .eq('id', agent.id)
    .select('id, name, email, telegram_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
