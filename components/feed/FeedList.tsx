'use client'

import { useState, useEffect, useCallback } from 'react'
import { FeedItem } from './FeedItem'
import type { AIActionWithTransaction } from '@/types/database'

interface Props {
  agentId: string
}

interface FeedResponse {
  actions: AIActionWithTransaction[]
  total: number
}

const POLL_INTERVAL_MS = 30_000

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-800 bg-gray-900 p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-12 rounded bg-gray-800" />
            <div className="h-5 w-48 rounded bg-gray-800" />
          </div>
          <div className="h-4 w-32 rounded bg-gray-800 mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-800" />
            <div className="h-3 w-3/4 rounded bg-gray-800" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 w-28 rounded bg-gray-800" />
            <div className="h-8 w-16 rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
        <svg
          className="h-6 w-6 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-300">All caught up!</p>
      <p className="mt-1 text-xs text-gray-500">
        Your AI TC is monitoring your transactions. New actions will appear here.
      </p>
    </div>
  )
}

export function FeedList({ agentId }: Props) {
  const [pending, setPending] = useState<AIActionWithTransaction[]>([])
  const [completed, setCompleted] = useState<AIActionWithTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    setError(null)

    try {
      const [pendingRes, completedRes] = await Promise.all([
        fetch('/api/feed?status=pending'),
        fetch('/api/feed?status=executed&today=true'),
      ])

      if (!pendingRes.ok || !completedRes.ok) {
        throw new Error('Failed to load feed')
      }

      const pendingData: FeedResponse = await pendingRes.json()
      const completedData: FeedResponse = await completedRes.json()

      setPending(pendingData.actions)
      setCompleted(completedData.actions)
    } catch {
      setError('Unable to load your feed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFeed(true)
  }, [fetchFeed])

  // Polling
  useEffect(() => {
    const interval = setInterval(() => fetchFeed(false), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchFeed])

  function handleAction(actionId: string, _type: 'approve' | 'skip') {
    // Optimistic: move item from pending immediately
    setPending((prev) => prev.filter((a) => a.id !== actionId))
    // Refresh completed section after a short delay
    setTimeout(() => fetchFeed(false), 1000)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Awaiting Your Approval" count={0} loading />
        <FeedSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => fetchFeed(true)}
          className="mt-3 text-xs font-medium text-red-300 underline hover:text-red-200"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pending section */}
      <section aria-label="Pending actions">
        <SectionHeader title="Awaiting Your Approval" count={pending.length} />
        {pending.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {pending.map((action) => (
              <FeedItem key={action.id} action={action} onAction={handleAction} />
            ))}
          </div>
        )}
      </section>

      {/* Completed today section */}
      {completed.length > 0 && (
        <section aria-label="Completed today">
          <SectionHeader title="Completed Today" count={completed.length} />
          <div className="space-y-3 opacity-60">
            {completed.map((action) => (
              <CompletedItem key={action.id} action={action} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  count,
  loading = false,
}: {
  title: string
  count: number
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {!loading && (
        <span className="inline-flex items-center justify-center rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
          {count}
        </span>
      )}
    </div>
  )
}

function CompletedItem({ action }: { action: AIActionWithTransaction }) {
  const address = action.transaction?.property_address ?? 'Unknown Property'
  const type = action.action_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm text-gray-300 truncate">{address}</p>
        <p className="text-xs text-gray-500">{type}</p>
      </div>
      <span className="flex-shrink-0 text-xs font-medium text-emerald-400">Sent</span>
    </div>
  )
}
