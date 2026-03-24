'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import type { Transaction, TransactionStage } from '@/types/database'

const COLUMNS: { stage: TransactionStage; label: string }[] = [
  { stage: 'pre_listing', label: 'Pre-Listing' },
  { stage: 'active_listing', label: 'Active Listing' },
  { stage: 'under_contract', label: 'Under Contract' },
  { stage: 'pre_closing', label: 'Pre-Closing' },
  { stage: 'closed', label: 'Closed' },
]

const ALLOWED_STAGES = new Set<TransactionStage>([
  'pre_listing',
  'active_listing',
  'under_contract',
  'pre_closing',
  'closed',
])

interface Props {
  initialTransactions: Transaction[]
}

export function KanbanBoard({ initialTransactions }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const transactionId = active.id as string
    const newStage = over.id as TransactionStage

    if (!ALLOWED_STAGES.has(newStage)) return

    const previous = transactions.find((t) => t.id === transactionId)
    if (!previous || previous.stage === newStage) return

    // Optimistic update
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, stage: newStage } : t))
    )

    try {
      const res = await fetch(`/api/transactions/${transactionId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error('Failed to update stage')
    } catch {
      // Revert on error
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, stage: previous.stage } : t
        )
      )
      setError('Failed to update stage. Please try again.')
    }
  }, [transactions])

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ stage, label }) => {
          const columnTxs = transactions.filter((t) => t.stage === stage)
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              label={label}
              transactions={columnTxs}
              count={columnTxs.length}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
