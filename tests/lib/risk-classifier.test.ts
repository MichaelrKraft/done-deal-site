import { describe, it, expect } from 'vitest'
import { classifyRisk, shouldAutoExecute } from '@/lib/risk-classifier'

describe('classifyRisk', () => {
  it('returns high for content with requires_signature: true', () => {
    expect(classifyRisk('some_action', { requires_signature: true })).toBe('high')
  })

  it('returns high for content with recipient documents@yourcastle.org', () => {
    expect(
      classifyRisk('some_action', { recipient: 'documents@yourcastle.org' })
    ).toBe('high')
  })

  it('returns high for action type containing "amendment"', () => {
    expect(classifyRisk('contract_amendment', {})).toBe('high')
  })

  it('returns high for action type containing "objection"', () => {
    expect(classifyRisk('inspection_objection', {})).toBe('high')
  })

  it('returns high for cda action type', () => {
    expect(classifyRisk('cda', {})).toBe('high')
  })

  it('returns high for wire_fraud_warning action type', () => {
    expect(classifyRisk('wire_fraud_warning', {})).toBe('high')
  })

  it('returns medium for earnest_money_reminder', () => {
    expect(classifyRisk('earnest_money_reminder', {})).toBe('medium')
  })

  it('returns medium for lender email about loans', () => {
    expect(
      classifyRisk('general_email', {
        recipient_role: 'lender',
        subject: 'Loan status update',
      })
    ).toBe('medium')
  })

  it('returns low for deadline_reminder', () => {
    expect(classifyRisk('deadline_reminder', {})).toBe('low')
  })

  it('returns low for calendar_event', () => {
    expect(classifyRisk('calendar_event', {})).toBe('low')
  })

  it('returns medium for unrecognized action types (safe default)', () => {
    expect(classifyRisk('unknown_weird_action', {})).toBe('medium')
  })
})

describe('shouldAutoExecute', () => {
  it('returns true for low risk + autonomous mode', () => {
    expect(shouldAutoExecute('low', 'autonomous')).toBe(true)
  })

  it('returns false for medium risk + autonomous mode', () => {
    expect(shouldAutoExecute('medium', 'autonomous')).toBe(false)
  })

  it('returns false for high risk + autonomous mode', () => {
    expect(shouldAutoExecute('high', 'autonomous')).toBe(false)
  })

  it('returns false for low risk + supervised mode', () => {
    expect(shouldAutoExecute('low', 'supervised')).toBe(false)
  })

  it('returns false for medium risk + supervised mode', () => {
    expect(shouldAutoExecute('medium', 'supervised')).toBe(false)
  })
})
