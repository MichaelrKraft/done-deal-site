import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// Telegram Webhook — Scaffold
// ============================================================

interface TelegramUpdate {
  update_id: number
  message?: {
    chat: { id: number }
    text?: string
  }
  callback_query?: {
    id: string
    data?: string
    message?: {
      chat: { id: number }
    }
  }
}

export async function POST(request: NextRequest) {
  // Validate bot token from query param (Telegram webhook secret)
  const secretToken = request.headers.get('x-telegram-bot-api-secret-token')
  const expectedToken = process.env.TELEGRAM_BOT_TOKEN

  if (!expectedToken) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 503 })
  }

  // Optional: validate webhook secret if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (webhookSecret && secretToken !== webhookSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })
  }

  let update: TelegramUpdate
  try {
    update = await request.json() as TelegramUpdate
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle callback queries (inline keyboard button presses)
  if (update.callback_query?.data) {
    const callbackData = update.callback_query.data
    const chatId = update.callback_query.message?.chat.id

    if (callbackData.startsWith('approve:')) {
      const actionId = callbackData.replace('approve:', '')
      console.log(`[Telegram Webhook] STUB: Approve action ${actionId} from chat ${chatId}`)
      // TODO: Call internal approve API
    } else if (callbackData.startsWith('skip:')) {
      const actionId = callbackData.replace('skip:', '')
      console.log(`[Telegram Webhook] STUB: Skip action ${actionId} from chat ${chatId}`)
      // TODO: Call internal skip API
    }

    return NextResponse.json({ ok: true })
  }

  // Handle text messages
  if (update.message?.text) {
    const text = update.message.text.trim().toLowerCase()
    const chatId = update.message.chat.id

    if (text === 'status') {
      console.log(`[Telegram Webhook] STUB: Status request from chat ${chatId}`)
      // TODO: Query pending actions count and reply
    } else if (text.startsWith('approve ')) {
      const actionId = text.replace('approve ', '').trim()
      console.log(`[Telegram Webhook] STUB: Approve action ${actionId} from chat ${chatId}`)
      // TODO: Call internal approve API
    } else if (text.startsWith('skip ')) {
      const actionId = text.replace('skip ', '').trim()
      console.log(`[Telegram Webhook] STUB: Skip action ${actionId} from chat ${chatId}`)
      // TODO: Call internal skip API
    }
  }

  return NextResponse.json({ ok: true })
}
