'use client'

import { Button } from '@/components/ui/button'

interface StepConnectOutlookProps {
  onNext: () => void
  onSkip: () => void
}

export function StepConnectOutlook({ onNext, onSkip }: StepConnectOutlookProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif text-[#2c2420]">Connect Outlook</h2>
        <p className="mt-1 text-sm text-[#7a6e63]">
          Your AI TC reads your Outlook inbox to track emails and draft responses for you.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
        <p className="text-sm font-medium text-blue-700">Coming in setup</p>
        <p className="text-sm text-[#7a6e63]">
          Outlook integration will be connected during your full onboarding call. Your TC
          can still work with Telegram notifications in the meantime.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full opacity-50 cursor-not-allowed"
          disabled
        >
          Connect Outlook (coming soon)
        </Button>

        <Button type="button" variant="ghost" className="w-full" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  )
}
