'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StepConnectTelegramProps {
  onNext: (telegramUsername: string | null) => void
  onSkip: () => void
}

export function StepConnectTelegram({ onNext, onSkip }: StepConnectTelegramProps) {
  const [username, setUsername] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext(username.trim() || null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Connect Telegram</h2>
        <p className="mt-1 text-sm text-gray-400">
          Get real-time alerts and approve AI actions from your phone via Telegram.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-200">Setup instructions</p>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>
            Open Telegram and search for{' '}
            <span className="font-mono text-blue-400">@DoneDealBot</span>
          </li>
          <li>Send the bot a message: <span className="font-mono text-gray-200">/start</span></li>
          <li>Enter your Telegram username below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="telegramUsername">Your Telegram username</Label>
          <Input
            id="telegramUsername"
            type="text"
            placeholder="@yourusername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-gray-500">Optional — you can add this later in settings</p>
        </div>

        <Button type="submit" className="w-full">
          {username.trim() ? 'Save and continue' : 'Skip for now'}
        </Button>
      </form>

      <Button type="button" variant="ghost" className="w-full" onClick={onSkip}>
        I&apos;ll do this later
      </Button>
    </div>
  )
}
