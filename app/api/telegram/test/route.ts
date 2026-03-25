import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/integrations/telegram'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, name, telegram_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  if (!agent.telegram_id) {
    return NextResponse.json({ error: 'No Telegram ID configured' }, { status: 400 })
  }

  const success = await sendTelegramMessage(
    agent.telegram_id,
    `Hey ${agent.name}, your Done Deal notifications are working!`
  )

  if (!success) {
    return NextResponse.json(
      { error: 'Failed to send test message. Check your Telegram ID and bot configuration.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
