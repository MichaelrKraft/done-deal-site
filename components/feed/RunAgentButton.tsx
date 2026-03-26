'use client'

import { useState } from 'react'

export function RunAgentButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleClick() {
    setStatus('loading')
    try {
      await fetch('/api/agent/trigger', { method: 'POST' })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('idle')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      className="text-sm text-[#7a6e63] hover:text-[#2c2420] underline disabled:opacity-50 transition-colors"
    >
      {status === 'loading' && 'Running agent...'}
      {status === 'done' && 'Agent queued — check back in ~30s'}
      {status === 'idle' && 'Run agent now'}
    </button>
  )
}
