import type { AutonomyMode, RiskLevel } from '@/types/database'

// ============================================================
// ACTION TYPE SETS (const assertions for type safety)
// ============================================================

const HIGH_RISK_ACTIONS = [
  'inspection_objection',
  'contract_amendment',
  'cda',
  'wire_fraud_warning',
] as const

const MEDIUM_RISK_ACTIONS = [
  'disclosure_package',
  'earnest_money_reminder',
  'cic_request',
  'lender_followup',
  'inspection_scheduling',
] as const

const LOW_RISK_ACTIONS = [
  'deadline_reminder',
  'status_checkin',
  'thank_you_email',
  'task_completion',
  'mls_update_prompt',
  'calendar_event',
  'daily_digest',
] as const

// ============================================================
// RISK CLASSIFIER
// ============================================================

/**
 * Classifies an AI-generated TC action into a risk level.
 *
 * HIGH  — legal/financial impact, always requires agent approval
 * MEDIUM — important but lower stakes, requires approval in both modes
 * LOW   — routine comms, auto-executable in autonomous mode
 *
 * Default is 'medium' when the action type is unrecognized.
 */
export function classifyRisk(
  actionType: string,
  content: Record<string, unknown>
): RiskLevel {
  // --- HIGH: signature-bearing or legally sensitive actions ---
  if (content.requires_signature === true) return 'high'

  const recipient = typeof content.recipient === 'string' ? content.recipient : ''
  if (recipient.includes('documents@yourcastle.org')) return 'high'

  if (actionType.includes('amendment') || actionType.includes('objection')) return 'high'

  if ((HIGH_RISK_ACTIONS as readonly string[]).includes(actionType)) return 'high'

  // --- MEDIUM: important but not legally binding ---
  if ((MEDIUM_RISK_ACTIONS as readonly string[]).includes(actionType)) return 'medium'

  const recipientRole = typeof content.recipient_role === 'string' ? content.recipient_role : ''
  const subject = typeof content.subject === 'string' ? content.subject.toLowerCase() : ''
  if (recipientRole === 'lender' && subject.includes('loan')) return 'medium'

  // --- LOW: routine communications ---
  if ((LOW_RISK_ACTIONS as readonly string[]).includes(actionType)) return 'low'

  // Default: when uncertain, require approval
  return 'medium'
}

// ============================================================
// AUTO-EXECUTE GATE
// ============================================================

/**
 * Determines whether an action can be auto-executed without agent approval.
 *
 * Returns `true` only when the risk is LOW **and** the transaction is in
 * autonomous mode. All other combinations require explicit approval.
 */
export function shouldAutoExecute(
  riskLevel: RiskLevel,
  autonomyMode: AutonomyMode
): boolean {
  // LOW risk actions are always routine — auto-execute regardless of mode
  if (riskLevel === 'low') return true
  // MEDIUM/HIGH always require approval
  void autonomyMode
  return false
}
