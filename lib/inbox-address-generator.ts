import { randomBytes } from 'crypto'

const INBOX_DOMAIN = 'inbox.donedeal.ai'

/**
 * Generate a unique inbox address for an agent.
 * Format: tc-{slugified-first-name}-{4-char-random}@inbox.donedeal.ai
 * Example: tc-jane-7x3k@inbox.donedeal.ai
 */
export function generateInboxAddress(agentName: string): string {
  const firstName = agentName
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  const slug = firstName || 'agent'
  const random = randomBytes(2).toString('hex') // 4 hex chars
  return `tc-${slug}-${random}@${INBOX_DOMAIN}`
}
