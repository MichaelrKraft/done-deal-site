'use client'

import { useState } from 'react'
import type { AutonomyMode } from '@/types/database'

interface Props {
  transactionId: string
  currentMode: AutonomyMode
}

export function AutonomyToggle({ transactionId, currentMode }: Props) {
  const [mode, setMode] = useState<AutonomyMode>(currentMode)
  const [isLoading, setIsLoading] = useState(false)

  const isAutonomous = mode === 'autonomous'

  async function handleToggle() {
    const newMode: AutonomyMode = isAutonomous ? 'supervised' : 'autonomous'
    setIsLoading(true)

    try {
      const res = await fetch(`/api/transactions/${transactionId}/autonomy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autonomy_mode: newMode }),
      })

      if (!res.ok) {
        console.error('Failed to update autonomy mode')
        return
      }

      setMode(newMode)
    } catch {
      console.error('Network error updating autonomy mode')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isAutonomous}
        disabled={isLoading}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#faf8f5]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isAutonomous
            ? 'bg-[#0F7B0F] focus-visible:ring-[#0F7B0F]'
            : 'bg-[#84c9d1] focus-visible:ring-[#84c9d1]'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white
            shadow-lg ring-0 transition-transform duration-200
            ${isAutonomous ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>

      <div className="min-w-0">
        <span className={`text-sm font-medium ${isAutonomous ? 'text-[#0F7B0F]' : 'text-[#84c9d1]'}`}>
          {isAutonomous ? 'Autonomous' : 'Supervised'}
        </span>
        <p className="text-xs text-[#b0a698] mt-0.5">
          {isAutonomous
            ? 'Low-risk actions (reminders, check-ins) execute automatically.'
            : 'All actions require your approval before sending.'}
        </p>
      </div>
    </div>
  )
}
