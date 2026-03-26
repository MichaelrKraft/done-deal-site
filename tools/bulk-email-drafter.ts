import { defineTool } from './types'
import type { TCToolDefinition, TCToolResult } from './types'

// ============================================================
// INPUT TYPE
// ============================================================

interface BulkEmailDrafterInput {
  transaction_id: string
  recipient_roles: string[]
  subject: string
  message_context: string
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const bulkEmailDrafterDef: TCToolDefinition = defineTool(
  'draft_bulk_emails',
  'Draft emails to multiple transaction parties simultaneously. Use when the same event needs to be communicated to several parties (e.g., inspection reminder to buyer, lender, and title company at once).',
  {
    properties: {
      recipient_roles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Party roles to email. Valid: buyer, seller, buyer_agent, seller_agent, lender, title, inspector',
      },
      subject: { type: 'string', description: 'Email subject line' },
      message_context: { type: 'string', description: 'What to communicate. Will be personalized per recipient.' },
      transaction_id: { type: 'string', description: 'The transaction ID' },
    },
    required: ['recipient_roles', 'subject', 'message_context', 'transaction_id'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

export function executeBulkEmailDrafter(input: BulkEmailDrafterInput): TCToolResult {
  const { recipient_roles, subject, message_context } = input

  if (recipient_roles.length === 0) {
    return {
      success: false,
      summary: 'No recipient_roles provided. Bulk email draft skipped.',
      actionType: 'bulk_email_draft',
      draftContent: { drafted: 0, recipients: [], skipped: [] },
    }
  }

  const body = `${message_context}\n\nPlease don't hesitate to reach out with any questions.`

  const drafts = recipient_roles.map((role) => ({
    to: role,
    subject,
    body,
  }))

  const recipientLabels = recipient_roles.map((role) => role)

  return {
    success: true,
    summary: `Drafted bulk emails to ${recipient_roles.length} recipient(s): ${recipientLabels.join(', ')}. Subject: "${subject}".`,
    actionType: 'bulk_email_draft',
    draftContent: {
      drafted: recipient_roles.length,
      recipients: recipientLabels,
      skipped: [],
      drafts,
    },
  }
}
