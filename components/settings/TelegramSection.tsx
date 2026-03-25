'use client'

import { useState, useCallback } from 'react'

interface TelegramSectionProps {
  initialTelegramId: string | null
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function TelegramSection({ initialTelegramId }: TelegramSectionProps) {
  const [telegramId, setTelegramId] = useState<string | null>(initialTelegramId)
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const resetFeedback = useCallback(() => {
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }, [])

  const handleConnect = async () => {
    const cleaned = inputValue.startsWith('@') ? inputValue.slice(1) : inputValue

    if (cleaned.length < 5 || cleaned.length > 32) {
      setStatus('error')
      setMessage('Username must be 5-32 characters')
      resetFeedback()
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
      setStatus('error')
      setMessage('Only letters, numbers, and underscores allowed')
      resetFeedback()
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/agents/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: cleaned }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }

      setTelegramId(cleaned)
      setInputValue('')
      setStatus('success')
      setMessage('Connected')
      resetFeedback()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to save')
      resetFeedback()
    }
  }

  const handleDisconnect = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/agents/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: null }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to disconnect')
      }

      setTelegramId(null)
      setStatus('success')
      setMessage('Disconnected')
      resetFeedback()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to disconnect')
      resetFeedback()
    }
  }

  const handleTest = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Test failed')
      }

      setStatus('success')
      setMessage('Test message sent! Check Telegram.')
      resetFeedback()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Test failed')
      resetFeedback()
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-[#2c2420] font-medium">Telegram</span>
          <p className="text-xs text-[#b0a698] mt-0.5">Push notifications &amp; approve by reply</p>
        </div>
        {telegramId ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        ) : (
          <span className="text-xs text-[#b0a698]">Not connected</span>
        )}
      </div>

      {telegramId ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-[#faf8f5] border border-[#f0ebe4] px-3 py-2">
            <span className="text-sm text-[#2c2420] font-mono">@{telegramId}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={status === 'loading'}
                className="rounded-lg bg-[#f5f0ea] px-3 py-1.5 text-xs font-medium text-[#7a6e63] hover:bg-[#ebe5db] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Test'}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={status === 'loading'}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <div className="rounded-lg bg-[#faf8f5] border border-[#f0ebe4] p-3 text-xs text-[#7a6e63] space-y-1">
            <p>1. Search for your Done Deal bot on Telegram</p>
            <p>2. Send <span className="font-mono bg-[#f0ebe4] px-1 rounded">/start</span></p>
            <p>3. Enter the username the bot gives you below</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="@username"
              className="flex-1 rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConnect()
              }}
            />
            <button
              type="button"
              onClick={handleConnect}
              disabled={status === 'loading' || inputValue.replace(/^@/, '').length < 5}
              className="rounded-lg bg-[#c75c2e] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Connect'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
