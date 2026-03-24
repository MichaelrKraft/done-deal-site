'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function StepDone() {
  const router = useRouter()

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 border border-blue-600">
          <svg
            className="h-8 w-8 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white">Your AI TC is ready to work</h2>
        <p className="mt-2 text-sm text-gray-400">
          Done Deal will monitor your transactions, track deadlines, and surface actions
          for your approval — all in one place.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 space-y-3 text-left">
        <p className="text-sm font-medium text-gray-200">What happens next</p>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400">•</span>
            Your AI TC scans your transactions and builds a timeline of deadlines
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400">•</span>
            Drafts emails and reminders — you approve before anything sends
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400">•</span>
            Telegram alerts keep you updated on the go
          </li>
        </ul>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={() => router.push('/feed')}
      >
        Go to my dashboard
      </Button>
    </div>
  )
}
