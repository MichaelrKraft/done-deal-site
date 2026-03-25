'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarDeadline } from '@/app/(dashboard)/calendar/page'

interface CalendarViewProps {
  deadlines: CalendarDeadline[]
}

/** Get YYYY-MM-DD string from a Date (local time, no TZ shift) */
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Build array of day cells for a given month (with leading/trailing nulls for alignment) */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Monday-based: Mon=0 … Sun=6
  const startDow = (firstDay.getDay() + 6) % 7

  const cells: (number | null)[] = []

  // Leading empty cells
  for (let i = 0; i < startDow; i++) cells.push(null)

  // Day numbers
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Trailing empty cells to fill last row
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

type PillColor = 'overdue' | 'soon' | 'upcoming' | 'future' | 'complete'

function getPillColor(deadline: CalendarDeadline, todayKey: string): PillColor {
  if (deadline.status === 'completed' || deadline.status === 'waived') return 'complete'
  if (deadline.due_date < todayKey) return 'overdue'

  const dueMs = new Date(deadline.due_date + 'T00:00:00').getTime()
  const todayMs = new Date(todayKey + 'T00:00:00').getTime()
  const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24))

  if (diffDays <= 3) return 'soon'
  if (diffDays <= 7) return 'upcoming'
  return 'future'
}

const PILL_STYLES: Record<PillColor, string> = {
  overdue: 'bg-red-50 text-red-700 border border-red-200',
  soon: 'bg-amber-50 text-amber-700 border border-amber-200',
  upcoming: 'bg-blue-50 text-blue-700 border border-blue-200',
  future: 'bg-[#f5f0ea] text-[#7a6e63]',
  complete: 'bg-emerald-50 text-emerald-700 line-through',
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Truncate address: "123 Main St" → "123 Main" */
function shortAddress(address: string): string {
  const parts = address.split(' ')
  return parts.length > 2 ? parts.slice(0, 2).join(' ') : address
}

export function CalendarView({ deadlines }: CalendarViewProps) {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const todayKey = toDateKey(now)

  // Group deadlines by date
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, CalendarDeadline[]>()
    for (const dl of deadlines) {
      const existing = map.get(dl.due_date)
      if (existing) {
        existing.push(dl)
      } else {
        map.set(dl.due_date, [dl])
      }
    }
    return map
  }, [deadlines])

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function goToday() {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  function goPrev() {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
  }

  function goNext() {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
  }

  // Mobile list view: deadlines for the current month sorted by date
  const monthDeadlines = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return deadlines
      .filter((dl) => dl.due_date.startsWith(prefix))
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
  }, [deadlines, year, month])

  return (
    <div>
      {/* Header: Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-[#2c2420]">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-lg p-1.5 text-[#7a6e63] transition-colors hover:text-[#2c2420] hover:bg-[#f5f0ea]"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="rounded-lg p-1.5 text-[#7a6e63] transition-colors hover:text-[#2c2420] hover:bg-[#f5f0ea]"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-[#e8e2d9] px-3 py-1 text-xs font-medium text-[#7a6e63] transition-colors hover:text-[#2c2420] hover:bg-[#f5f0ea]"
          >
            Today
          </button>
        </div>
      </div>

      {/* Desktop: Calendar grid */}
      <div className="hidden md:block rounded-2xl border border-[#e8e2d9] bg-white overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#e8e2d9]">
          {DAY_HEADERS.map((day, i) => (
            <div
              key={day}
              className={`px-2 py-2 text-center text-xs font-medium uppercase text-[#b0a698] ${
                i >= 5 ? 'bg-[#faf8f5]/50' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((dayNum, idx) => {
            if (dayNum === null) {
              const isWeekend = idx % 7 >= 5
              return (
                <div
                  key={`empty-${idx}`}
                  className={`min-h-[100px] border-b border-r border-[#e8e2d9] last:border-r-0 ${
                    isWeekend ? 'bg-[#faf8f5]/50' : ''
                  }`}
                />
              )
            }

            const dateKey = toDateKey(new Date(year, month, dayNum))
            const isToday = dateKey === todayKey
            const isWeekend = idx % 7 >= 5
            const dayDeadlines = deadlinesByDate.get(dateKey) ?? []

            return (
              <div
                key={dateKey}
                className={`min-h-[100px] border-b border-r border-[#e8e2d9] p-1.5 last:border-r-0 ${
                  isWeekend ? 'bg-[#faf8f5]/50' : ''
                } ${isToday ? 'ring-2 ring-[#c75c2e] ring-inset rounded-lg' : ''}`}
              >
                <span className={`text-sm ${isToday ? 'font-bold text-[#c75c2e]' : 'text-[#2c2420]'}`}>
                  {dayNum}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayDeadlines.slice(0, 3).map((dl) => (
                    <button
                      key={dl.id}
                      onClick={() => router.push(`/transactions/${dl.transaction_id}`)}
                      className={`w-full truncate rounded-full px-2 py-0.5 text-left text-[10px] leading-tight transition-opacity hover:opacity-80 ${
                        PILL_STYLES[getPillColor(dl, todayKey)]
                      }`}
                      title={`${dl.name} - ${dl.property_address}`}
                    >
                      {dl.name} &middot; {shortAddress(dl.property_address)}
                    </button>
                  ))}
                  {dayDeadlines.length > 3 && (
                    <span className="px-2 text-[10px] text-[#b0a698]">
                      +{dayDeadlines.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: List view */}
      <div className="md:hidden space-y-2">
        {monthDeadlines.length === 0 && (
          <p className="py-8 text-center text-sm text-[#b0a698]">
            No deadlines this month
          </p>
        )}
        {monthDeadlines.map((dl) => {
          const pillColor = getPillColor(dl, todayKey)
          const dateLabel = new Date(dl.due_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
          return (
            <button
              key={dl.id}
              onClick={() => router.push(`/transactions/${dl.transaction_id}`)}
              className="flex w-full items-start gap-3 rounded-xl border border-[#e8e2d9] bg-white p-3 text-left transition-colors hover:bg-[#faf8f5]"
            >
              <div className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs ${PILL_STYLES[pillColor]}`}>
                {dateLabel}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium text-[#2c2420] ${pillColor === 'complete' ? 'line-through' : ''}`}>
                  {dl.name}
                </p>
                <p className="truncate text-xs text-[#7a6e63]">{dl.property_address}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
