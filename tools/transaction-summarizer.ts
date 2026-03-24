import { defineTool } from './types'
import type { TCToolDefinition, TCToolResult } from './types'

// ============================================================
// INPUT TYPE
// ============================================================

interface TransactionSummary {
  address: string
  stage: string
  urgent_items: string[]
  recent_actions: string[]
}

interface DailyDigestInput {
  agent_name: string
  transaction_summaries: TransactionSummary[]
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const transactionSummarizerDef: TCToolDefinition = defineTool(
  'generate_daily_digest',
  'Generate a daily digest email summarizing all active transactions for an agent. Includes urgent items and recent actions per transaction.',
  {
    properties: {
      agent_name: { type: 'string', description: 'Name of the real estate agent' },
      transaction_summaries: {
        type: 'array',
        description: 'Summary of each active transaction',
        items: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            stage: { type: 'string' },
            urgent_items: { type: 'array', items: { type: 'string' } },
            recent_actions: { type: 'array', items: { type: 'string' } },
          },
          required: ['address', 'stage', 'urgent_items', 'recent_actions'],
        },
      },
    },
    required: ['agent_name', 'transaction_summaries'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

export function executeTransactionSummarizer(input: DailyDigestInput): TCToolResult {
  const { agent_name, transaction_summaries } = input
  const totalUrgent = transaction_summaries.reduce((sum, t) => sum + t.urgent_items.length, 0)

  const subject = `Daily Digest: ${transaction_summaries.length} active transaction${transaction_summaries.length === 1 ? '' : 's'}${totalUrgent > 0 ? ` (${totalUrgent} urgent)` : ''}`

  const sections = transaction_summaries.map((t) => {
    const lines = [`## ${t.address} — ${t.stage}`]
    if (t.urgent_items.length > 0) {
      lines.push('**Urgent:**')
      t.urgent_items.forEach((item) => lines.push(`- ${item}`))
    }
    if (t.recent_actions.length > 0) {
      lines.push('**Recent:**')
      t.recent_actions.forEach((action) => lines.push(`- ${action}`))
    }
    return lines.join('\n')
  })

  const body = [`Hi ${agent_name},`, '', `Here is your daily transaction summary:`, '', ...sections].join('\n')

  return {
    success: true,
    summary: `Daily digest for ${agent_name}: ${transaction_summaries.length} transactions, ${totalUrgent} urgent items.`,
    actionType: 'daily_digest',
    draftContent: { subject, body },
  }
}
