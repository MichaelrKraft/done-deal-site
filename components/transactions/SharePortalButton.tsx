'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PortalLinkRow } from '@/types/database'

interface SharePortalButtonProps {
  transactionId: string
}

export default function SharePortalButton({ transactionId }: SharePortalButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [links, setLinks] = useState<PortalLinkRow[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/portal-links`)
      if (res.ok) {
        const data = await res.json() as { links: PortalLinkRow[] }
        setLinks(data.links)
      }
    } finally {
      setLoading(false)
    }
  }, [transactionId])

  useEffect(() => {
    if (isOpen) {
      void fetchLinks()
    }
  }, [isOpen, fetchLinks])

  const createLink = async (partyRole: 'buyer' | 'seller') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/portal-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party_role: partyRole }),
      })
      if (res.ok) {
        await fetchLinks()
      }
    } finally {
      setLoading(false)
    }
  }

  const revokeLink = async (linkId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/portal-links/${linkId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchLinks()
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (token: string, linkId: string) => {
    const url = `${window.location.origin}/portal/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(linkId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeLinks = links.filter((l) => l.is_active)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-[#84c9d1] text-white hover:bg-[#b04e26] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share with Client
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#e8e2d9] shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e8e2d9]">
              <h3 className="text-sm font-semibold text-[#2c2420]">Client Portal Links</h3>
              <p className="text-xs text-[#b0a698] mt-0.5">
                Share a read-only transaction view with your client
              </p>
            </div>

            {/* Existing links */}
            <div className="max-h-48 overflow-y-auto">
              {activeLinks.length === 0 && !loading && (
                <p className="px-4 py-3 text-xs text-[#b0a698]">No active links yet.</p>
              )}
              {activeLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e8e2d9]/50 last:border-0"
                >
                  <span className="text-xs font-medium capitalize bg-[#f5f0ea] text-[#7a6e63] px-2 py-0.5 rounded-full">
                    {link.party_role}
                  </span>
                  <span className="text-xs text-[#b0a698] flex-1 truncate">
                    {link.access_count} view{link.access_count !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => void copyToClipboard(link.token, link.id)}
                    className="text-xs px-2 py-1 rounded-lg bg-[#f5f0ea] text-[#2c2420] hover:bg-[#e8e2d9] transition-colors"
                  >
                    {copiedId === link.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => void revokeLink(link.id)}
                    className="text-xs px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>

            {/* Create new links */}
            <div className="px-4 py-3 border-t border-[#e8e2d9] bg-[#faf8f5]">
              <p className="text-xs text-[#b0a698] mb-2">Generate a new link:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => void createLink('buyer')}
                  disabled={loading}
                  className="flex-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e8e2d9] text-[#2c2420] hover:bg-white transition-colors disabled:opacity-50"
                >
                  Buyer Link
                </button>
                <button
                  onClick={() => void createLink('seller')}
                  disabled={loading}
                  className="flex-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e8e2d9] text-[#2c2420] hover:bg-white transition-colors disabled:opacity-50"
                >
                  Seller Link
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
