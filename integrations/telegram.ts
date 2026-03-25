// ============================================================
// Telegram Bot Integration
// ============================================================

const TELEGRAM_API = 'https://api.telegram.org'

function getBotToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN not set — skipping notification')
    return null
  }
  return token
}

interface TelegramResponse {
  ok: boolean
  description?: string
}

// ============================================================
// SEND MESSAGE
// ============================================================

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<boolean> {
  const token = getBotToken()
  if (!token) return false

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    const data = await res.json() as TelegramResponse
    if (!data.ok) {
      console.error('[Telegram] sendMessage failed:', data.description)
      return false
    }
    return true
  } catch (err) {
    console.error('[Telegram] Network error:', err)
    return false
  }
}

// ============================================================
// SEND APPROVAL REQUEST (with inline keyboard)
// ============================================================

interface ApprovalAction {
  id: string
  type: string
  summary: string
  property: string
}

export async function sendTelegramApprovalRequest(
  chatId: string,
  action: ApprovalAction
): Promise<boolean> {
  const token = getBotToken()
  if (!token) return false

  const label = action.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const text = [
    `*Action Required*`,
    `Property: ${action.property}`,
    `Type: ${label}`,
    ``,
    action.summary,
  ].join('\n')

  const inlineKeyboard = {
    inline_keyboard: [[
      { text: 'Approve', callback_data: `approve:${action.id}` },
      { text: 'Skip', callback_data: `skip:${action.id}` },
    ]],
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
    })

    const data = await res.json() as TelegramResponse
    if (!data.ok) {
      console.error('[Telegram] sendApprovalRequest failed:', data.description)
      return false
    }
    return true
  } catch (err) {
    console.error('[Telegram] Network error:', err)
    return false
  }
}

// ============================================================
// FORMAT DAILY DIGEST
// ============================================================

export function formatDailyDigest(
  agentName: string,
  pendingCount: number,
  completedCount: number,
  urgentItems: string[]
): string {
  const lines: string[] = [
    `*Daily Digest for ${agentName}*`,
    '',
    `Pending actions: ${pendingCount}`,
    `Completed today: ${completedCount}`,
  ]

  if (urgentItems.length > 0) {
    lines.push('')
    lines.push('*Urgent:*')
    for (const item of urgentItems) {
      lines.push(`  - ${item}`)
    }
  }

  if (pendingCount === 0 && urgentItems.length === 0) {
    lines.push('')
    lines.push('All clear — no items need attention.')
  }

  return lines.join('\n')
}
