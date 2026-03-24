import { defineTool } from './types'
import type { TCToolDefinition, TCToolResult } from './types'

// ============================================================
// INPUT TYPE
// ============================================================

interface DeadlineReminderInput {
  transaction_id: string
  deadline_name: string
  days_until_due: number
  recipient_party_role: string
  urgency: 'routine' | 'urgent' | 'critical'
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const deadlineReminderDef: TCToolDefinition = defineTool(
  'send_deadline_reminder',
  'Generate a deadline reminder action for a transaction party. Formats the reminder message based on urgency level.',
  {
    properties: {
      transaction_id: { type: 'string', description: 'UUID of the transaction' },
      deadline_name: { type: 'string', description: 'Name of the deadline (e.g. "Inspection Objection")' },
      days_until_due: { type: 'number', description: 'Days remaining until the deadline' },
      recipient_party_role: { type: 'string', description: 'Role of the recipient party' },
      urgency: { type: 'string', enum: ['routine', 'urgent', 'critical'], description: 'Urgency level of the reminder' },
    },
    required: ['transaction_id', 'deadline_name', 'days_until_due', 'recipient_party_role', 'urgency'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

const URGENCY_PREFIX: Record<DeadlineReminderInput['urgency'], string> = {
  routine: 'Reminder',
  urgent: 'URGENT Reminder',
  critical: 'CRITICAL — Immediate Action Required',
}

export function executeDeadlineReminder(input: DeadlineReminderInput): TCToolResult {
  const { deadline_name, days_until_due, recipient_party_role, urgency } = input

  const prefix = URGENCY_PREFIX[urgency]
  const dueLabel = days_until_due === 0
    ? 'today'
    : days_until_due === 1
      ? 'tomorrow'
      : `in ${days_until_due} days`

  const message = `${prefix}: "${deadline_name}" is due ${dueLabel}. Please ensure all required actions are completed before this deadline expires.`

  return {
    success: true,
    summary: `${urgency} reminder for "${deadline_name}" (due ${dueLabel}) sent to ${recipient_party_role}.`,
    actionType: 'deadline_reminder',
    draftContent: {
      deadline_name,
      due_date: dueLabel,
      recipient: recipient_party_role,
      message,
    },
  }
}
