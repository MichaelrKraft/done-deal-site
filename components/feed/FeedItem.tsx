'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AIActionWithTransaction, RiskLevel } from '@/types/database'

interface Props {
  action: AIActionWithTransaction
  onAction: (actionId: string, type: 'approve' | 'skip') => void
}

const RISK_STYLES: Record<RiskLevel, { badge: string; label: string }> = {
  high: { badge: 'bg-red-50 text-[#d94f4f] border-red-200', label: 'HIGH' },
  medium: { badge: 'bg-amber-50 text-[#c27b00] border-amber-200', label: 'MED' },
  low: { badge: 'bg-green-50 text-[#0F7B0F] border-green-200', label: 'LOW' },
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  email_draft: 'Email Draft',
  task_reminder: 'Task Reminder',
  deadline_alert: 'Deadline Alert',
  document_request: 'Document Request',
  status_update: 'Status Update',
  compliance_check: 'Compliance Check',
}

function formatActionType(actionType: string): string {
  return ACTION_TYPE_LABELS[actionType] ?? actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatStage(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getDraftPreview(draft: Record<string, unknown>): string {
  if (typeof draft.body === 'string') return draft.body
  if (typeof draft.message === 'string') return draft.message
  if (typeof draft.content === 'string') return draft.content
  if (typeof draft.text === 'string') return draft.text
  if (typeof draft.subject === 'string') return `Subject: ${draft.subject}`
  return JSON.stringify(draft, null, 2)
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function FeedItem({ action, onAction }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<'approve' | 'skip' | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const risk = RISK_STYLES[action.risk_level]
  const address = action.transaction?.property_address ?? 'Unknown Property'
  const stage = action.transaction?.stage ? formatStage(action.transaction.stage) : ''
  const preview = getDraftPreview(action.draft_content)

  async function handleAction(type: 'approve' | 'skip') {
    setLoading(type)
    try {
      const res = await fetch(`/api/feed/${action.id}/${type}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Request failed')
      setDismissed(true)
      // Wait for fade-out animation then notify parent
      setTimeout(() => onAction(action.id, type), 300)
    } catch {
      setLoading(null)
    }
  }

  return (
    <Card
      className={`transition-all duration-300 ${
        dismissed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header: risk badge + address + stage */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${risk.badge}`}
              >
                {risk.label}
              </span>
              <h3 className="text-sm font-semibold text-[#2c2420] truncate">{address}</h3>
            </div>
            {stage && (
              <p className="mt-0.5 text-xs text-[#b0a698]">{stage}</p>
            )}
          </div>
          <span className="text-xs text-[#b0a698] whitespace-nowrap">{getTimeAgo(action.created_at)}</span>
        </div>

        {/* Action type */}
        <p className="text-sm font-medium text-[#2c2420]">{formatActionType(action.action_type)}</p>

        {/* Draft preview */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse draft preview' : 'Expand draft preview'}
        >
          <div
            className={`rounded-md bg-[#faf8f5] border border-[#e8e2d9] p-3 text-sm text-[#7a6e63] whitespace-pre-wrap ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            {preview}
          </div>
        </button>

        {/* Context summary */}
        {action.context_summary && (
          <p className="text-xs text-[#b0a698] italic leading-relaxed">
            {action.context_summary}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => handleAction('approve')}
            disabled={loading !== null}
            aria-label={`Approve and send action for ${address}`}
            className="bg-[#84c9d1] text-white hover:bg-[#6fb8c0] rounded-lg flex-1 sm:flex-none"
          >
            {loading === 'approve' ? 'Sending...' : 'Approve & Send'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('skip')}
            disabled={loading !== null}
            aria-label={`Skip action for ${address}`}
            className="border border-[#e8e2d9] text-[#7a6e63] hover:bg-[#f5f0ea] rounded-lg flex-1 sm:flex-none"
          >
            {loading === 'skip' ? 'Skipping...' : 'Skip'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
