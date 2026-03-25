'use client'

import { useState, useCallback, useEffect } from 'react'

interface InboxAddressSectionProps {
  initialAddress: string | null
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function InboxAddressSection({ initialAddress }: InboxAddressSectionProps) {
  const [address, setAddress] = useState<string | null>(initialAddress)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const resetFeedback = useCallback(() => {
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }, [])

  // Generate address on first load if none exists
  useEffect(() => {
    if (!address) {
      generateAddress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateAddress = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/agents/inbox-address', { method: 'POST' })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to generate address')
      }

      const data = await res.json() as { inbox_address: string }
      setAddress(data.inbox_address)
      setStatus('success')
      setMessage('Address generated')
      resetFeedback()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to generate')
      resetFeedback()
    }
  }

  const handleCopy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = address
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-[#2c2420] font-medium">Inbound Email</span>
          <p className="text-xs text-[#b0a698] mt-0.5">CC this address when sending contracts</p>
        </div>
        <span className="text-xs text-[#b0a698]">Inbox</span>
      </div>

      {address ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-[#faf8f5] border border-[#f0ebe4] px-3 py-2">
            <span className="text-sm text-[#2c2420] font-mono break-all">{address}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-[#f5f0ea] px-3 py-2 text-xs font-medium text-[#7a6e63] hover:bg-[#ebe5db] transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : status === 'loading' ? (
        <div className="mt-2">
          <span className="text-xs text-[#b0a698]">Generating address...</span>
        </div>
      ) : (
        <div className="mt-2">
          <button
            type="button"
            onClick={generateAddress}
            className="rounded-lg bg-[#84c9d1] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#6fb8c0] transition-colors"
          >
            Generate Address
          </button>
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
