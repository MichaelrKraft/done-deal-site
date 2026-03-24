import { defineTool } from './types'
import type { TCToolDefinition, TCToolResult } from './types'

// ============================================================
// INPUT TYPE
// ============================================================

interface EmailDrafterInput {
  transaction_id: string
  recipient_party_role: string
  purpose: string
  key_points: string[]
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const emailDrafterDef: TCToolDefinition = defineTool(
  'draft_email',
  'Draft a professional real estate email to a transaction party. Returns a structured email draft for review before sending.',
  {
    properties: {
      transaction_id: { type: 'string', description: 'UUID of the transaction' },
      recipient_party_role: { type: 'string', description: 'Role of the recipient (e.g. buyer, seller, lender, title)' },
      purpose: { type: 'string', description: 'Brief purpose of the email (e.g. "request inspection report")' },
      key_points: { type: 'array', items: { type: 'string' }, description: 'Key points to include in the email body' },
    },
    required: ['transaction_id', 'recipient_party_role', 'purpose', 'key_points'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

export function executeEmailDrafter(input: EmailDrafterInput): TCToolResult {
  const { recipient_party_role, purpose, key_points } = input

  const subject = `Action Required: ${purpose}`
  const body = [
    `Dear ${recipient_party_role},`,
    '',
    `I am writing regarding the following matter: ${purpose}.`,
    '',
    ...key_points.map((point) => `- ${point}`),
    '',
    'Please let me know if you have any questions or need additional information.',
    '',
    'Best regards',
  ].join('\n')

  return {
    success: true,
    summary: `Drafted email to ${recipient_party_role} re: ${purpose} (${key_points.length} key points).`,
    actionType: 'email_draft',
    draftContent: {
      to: recipient_party_role,
      subject,
      body,
    },
  }
}
