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
        <h2 className="text-xl font-serif text-[#2c2420]">Connect Telegram</h2>
        <p className="mt-1 text-sm text-[#7a6e63]">
          Get real-time alerts and approve AI actions from your phone via Telegram.
        </p>
      </div>

      <div className="rounded-lg border border-[#e8e2d9] bg-[#faf8f5] p-4 space-y-3">
        <p className="text-sm font-medium text-[#2c2420]">Setup instructions</p>
        <ol className="text-sm text-[#7a6e63] space-y-2 list-decimal list-inside">
          <li>
            Open Telegram and search for your brokerage&apos;s Done Deal bot (ask your admin for the bot name)
          </li>
          <li>Send the bot a message: <span className="font-mono text-[#2c2420]">/start</span></li>
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
          <p className="text-xs text-[#b0a698]">Optional — you can add this later in settings</p>
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
