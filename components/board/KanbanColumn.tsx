'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TransactionCard } from './TransactionCard'
import type { Transaction, TransactionStage } from '@/types/database'

interface Props {
  stage: TransactionStage
  label: string
  transactions: Transaction[]
  count: number
}

export function KanbanColumn({ stage, label, transactions, count }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col min-w-[220px] w-60 flex-shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-200">{label}</span>
        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-400">
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border p-2 transition-colors min-h-[120px] ${
          isOver
            ? 'border-indigo-500 bg-gray-800/80'
            : 'border-gray-700 bg-gray-800'
        }`}
      >
        <SortableContext
          items={transactions.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
            {transactions.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-600">No transactions</p>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
