'use client'

import { useState } from 'react'
import type { TaskStatus, TaskAssignedTo, AIActionStatus } from '@/types/database'

interface TaskCardAction {
  id: string
  action_type: string
  context_summary: string | null
  status: AIActionStatus
  created_at: string
  draft_content: Record<string, unknown>
}

interface TaskCardProps {
  task: {
    id: string
    title: string
    status: TaskStatus
    assigned_to: TaskAssignedTo
    description: string | null
    due_date: string | null
  }
  aiActions: TaskCardAction[]
}

const STATUS_PILL: Record<string, { bg: string; label: string }> = {
  pending: { bg: 'bg-red-50 text-red-600', label: 'Not Started' },
  in_progress: { bg: 'bg-amber-50 text-amber-600', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50 text-emerald-700', label: 'Complete' },
  skipped: { bg: 'bg-[#f5f0ea] text-[#b0a698]', label: 'Skipped' },
  n_a: { bg: 'bg-[#f5f0ea] text-[#b0a698]', label: 'N/A' },
}

const ASSIGNED_LABELS: Record<string, { label: string; color: string }> = {
  ai: { label: 'AI', color: 'bg-[#c75c2e]/10 text-[#c75c2e]' },
  agent: { label: 'You', color: 'bg-blue-50 text-blue-700' },
  lender: { label: 'Lender', color: 'bg-purple-50 text-purple-700' },
  title: { label: 'Title Co', color: 'bg-emerald-50 text-emerald-700' },
  inspector: { label: 'Inspector', color: 'bg-amber-50 text-amber-700' },
  buyer: { label: 'Buyer', color: 'bg-sky-50 text-sky-700' },
  seller: { label: 'Seller', color: 'bg-orange-50 text-orange-700' },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function StatusCircle({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-amber-400 bg-amber-50 animate-pulse" />
    )
  }
  if (status === 'skipped' || status === 'n_a') {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-dashed border-[#e8e2d9] bg-[#faf8f5]" />
    )
  }
  // pending (not started)
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-red-300 bg-white" />
  )
}

export default function TaskCard({ task, aiActions }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  const pill = STATUS_PILL[task.status] ?? STATUS_PILL.pending
  const assigned = ASSIGNED_LABELS[task.assigned_to] ?? ASSIGNED_LABELS.agent

  return (
    <div className="bg-white border border-[#e8e2d9] rounded-xl shadow-sm">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        <StatusCircle status={task.status} />
        <span className={`flex-1 text-sm font-medium ${
          task.status === 'completed' ? 'text-[#b0a698] line-through' : 'text-[#2c2420]'
        }`}>
          {task.title}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${assigned.color}`}>
          {assigned.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pill.bg}`}>
          {pill.label}
        </span>
        <svg
          className={`w-4 h-4 text-[#b0a698] transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          expanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-1">
          {task.description && (
            <p className="text-xs text-[#7a6e63] mb-3">{task.description}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-[#b0a698] mb-3">Due: {task.due_date}</p>
          )}

          <div className="border-t border-[#e8e2d9] pt-3">
            <h4 className="text-xs font-semibold text-[#b0a698] uppercase tracking-wider mb-2">
              AI Activity Log
            </h4>

            {aiActions.length === 0 ? (
              <p className="text-xs text-[#b0a698] italic">No AI activity yet for this task</p>
            ) : (
              <div className="relative ml-2 border-l-2 border-[#e8e2d9] pl-4 space-y-3">
                {aiActions.map(action => (
                  <div key={action.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#c75c2e]" />
                    <p className="text-xs text-[#2c2420]">
                      {action.context_summary ?? action.action_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-[#b0a698] mt-0.5">
                      {relativeTime(action.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
