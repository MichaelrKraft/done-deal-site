'use client'

import { useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types/database'

interface Props {
  transaction: Transaction
}

function getDaysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt)
  const now = new Date()
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgencyColor(days: number): string {
  if (days > 7) return 'bg-red-500'
  if (days >= 3) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function TransactionCard({ transaction }: Props) {
  const router = useRouter()
  const wasDragged = useRef(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: transaction.id })

  useEffect(() => {
    if (isDragging) {
      wasDragged.current = true
    }
  }, [isDragging])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const days = getDaysInStage(transaction.updated_at)
  const urgencyColor = getUrgencyColor(days)

  function handleClick() {
    if (wasDragged.current) {
      wasDragged.current = false
      return
    }
    router.push(`/transactions/${transaction.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="rounded-xl bg-white border border-[#e8e2d9] p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all shadow-sm"
    >
      <p className="text-sm font-medium text-[#2c2420] leading-tight mb-2">
        {transaction.property_address}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
            transaction.side === 'buyer'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {transaction.side === 'buyer' ? 'Buyer' : 'Seller'}
        </span>

        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-[#f5f0ea] text-[#7a6e63]">
          AI Active
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${urgencyColor}`} />
        <span className="text-xs text-[#7a6e63]">
          {days === 0 ? 'Today' : `${days}d in stage`}
        </span>
      </div>
    </div>
  )
}
