'use client'

import { useState, useCallback } from 'react'

interface AIConfigSectionProps {
  initialAutonomy: string
  initialModel: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const MODEL_OPTIONS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — Fastest' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — Balanced' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 — Most capable' },
] as const

export default function AIConfigSection({ initialAutonomy, initialModel }: AIConfigSectionProps) {
  const [autonomy, setAutonomy] = useState(initialAutonomy)
  const [model, setModel] = useState(initialModel)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const resetFeedback = useCallback(() => {
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }, [])

  const patchAgent = async (body: Record<string, string>) => {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/agents/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }

      setStatus('success')
      setMessage('Saved')
      resetFeedback()
      return true
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to save')
      resetFeedback()
      return false
    }
  }

  const handleAutonomyChange = async (value: string) => {
    if (value === autonomy) return
    const ok = await patchAgent({ autonomy_default: value })
    if (ok) setAutonomy(value)
  }

  const handleModelChange = async (value: string) => {
    if (value === model) return
    const ok = await patchAgent({ preferred_model: value })
    if (ok) setModel(value)
  }

  const isLoading = status === 'loading'

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <h2 className="text-sm font-semibold text-[#2c2420]">AI Configuration</h2>
      </div>
      <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
        {/* Autonomy Mode */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[#2c2420] font-medium">Default Autonomy Mode</span>
              <p className="text-xs text-[#b0a698] mt-0.5">Controls how your AI TC handles new transactions</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAutonomyChange('supervised')}
              className={`flex-1 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                autonomy === 'supervised'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-[#e8e2d9] bg-white hover:bg-[#faf8f5]'
              }`}
            >
              <span className={`text-xs font-medium ${autonomy === 'supervised' ? 'text-blue-700' : 'text-[#2c2420]'}`}>
                Supervised — recommended
              </span>
              <p className="text-[11px] text-[#b0a698] mt-0.5">You approve every AI action before it executes</p>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAutonomyChange('autonomous')}
              className={`flex-1 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                autonomy === 'autonomous'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-[#e8e2d9] bg-white hover:bg-[#faf8f5]'
              }`}
            >
              <span className={`text-xs font-medium ${autonomy === 'autonomous' ? 'text-emerald-700' : 'text-[#2c2420]'}`}>
                Autonomous
              </span>
              <p className="text-[11px] text-[#b0a698] mt-0.5">AI executes LOW risk actions without review</p>
            </button>
          </div>
          {autonomy === 'autonomous' && (
            <div className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 mt-2">
              <p className="text-sm font-semibold text-amber-800">
                Autonomous mode is active
              </p>
              <p className="text-xs text-amber-700 mt-1">
                The AI will send emails and update deal stages without your review.
                Only use this if you fully trust the AI for all actions on all active deals.
              </p>
              <p className="text-xs font-semibold text-amber-800 mt-1">
                Recommended for production: keep Supervised mode enabled.
              </p>
            </div>
          )}
        </div>

        {/* AI Model */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[#2c2420] font-medium">AI Model</span>
              <p className="text-xs text-[#b0a698] mt-0.5">Powers your transaction coordinator</p>
            </div>
            <select
              value={model}
              disabled={isLoading}
              onChange={(e) => handleModelChange(e.target.value)}
              className="rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-xs text-[#2c2420] focus:outline-none focus:ring-2 focus:ring-[#84c9d1]/20 focus:border-[#84c9d1] disabled:opacity-50"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[#2c2420] font-medium">Schedule</span>
              <p className="text-xs text-[#b0a698] mt-0.5">When your AI TC runs daily checks</p>
            </div>
            <span className="text-xs text-[#7a6e63]">7am, 12pm, 5pm, 9pm</span>
          </div>
        </div>
      </div>

      {message && (
        <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </section>
  )
}
