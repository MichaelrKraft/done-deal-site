'use client'

import { useState, useCallback } from 'react'
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
    }
  }, [transactions])

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
