'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error('[App Error]', error) }, [error])

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-[#2c2420] mb-2">Something went wrong</h1>
        <p className="text-sm text-[#7a6e63] mb-6">
          An unexpected error occurred. If this keeps happening, contact support.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[#84c9d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#6fb8c0] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/feed"
            className="rounded-lg border border-[#e8e2d9] px-4 py-2 text-sm font-medium text-[#7a6e63] hover:bg-[#f5f0ea] transition-colors"
          >
            Go to Feed
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-[#b0a698]">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
