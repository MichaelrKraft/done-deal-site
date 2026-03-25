'use client'

import { useState, useRef, useEffect } from 'react'
import type { Party } from '@/types/database'

interface ContactsDropdownProps {
  parties: Party[]
}

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  buyer_agent: 'Buyer Agent',
  seller_agent: 'Seller Agent',
  lender: 'Lender',
  title: 'Title Company',
  inspector: 'Inspector',
  appraiser: 'Appraiser',
  hoa: 'HOA',
  other: 'Other',
}

const ROLE_COLORS: Record<string, string> = {
  buyer: 'bg-blue-100 text-blue-700',
  seller: 'bg-purple-100 text-purple-700',
  buyer_agent: 'bg-blue-50 text-blue-600',
  seller_agent: 'bg-purple-50 text-purple-600',
  lender: 'bg-amber-100 text-amber-700',
  title: 'bg-teal-100 text-teal-700',
  inspector: 'bg-green-100 text-green-700',
  appraiser: 'bg-orange-100 text-orange-700',
  hoa: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function ContactsDropdown({ parties }: ContactsDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[#e8e2d9] bg-white px-3 py-2 text-sm font-medium text-[#2c2420] transition-colors hover:border-[#84c9d1] hover:bg-[#faf8f5]"
      >
        <svg className="h-4 w-4 text-[#84c9d1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        Contacts
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5f0ea] text-[10px] font-semibold text-[#7a6e63]">
          {parties.length}
        </span>
        <svg className={`h-3 w-3 text-[#b0a698] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[#e8e2d9] bg-white shadow-lg">
          <div className="border-b border-[#f0ebe4] px-4 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b0a698]">Deal Contacts</h3>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {parties.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-[#b0a698]">No contacts added yet</p>
            ) : (
              <div className="space-y-1">
                {parties.map((party) => (
                  <div key={party.id} className="rounded-lg px-3 py-2.5 hover:bg-[#faf8f5] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2c2420]">{party.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[party.role] ?? ROLE_COLORS.other}`}>
                        {ROLE_LABELS[party.role] ?? party.role}
                      </span>
                    </div>
                    {party.company && (
                      <p className="mt-0.5 text-xs text-[#7a6e63]">{party.company}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                      {party.email && (
                        <a href={`mailto:${party.email}`} className="text-xs text-[#84c9d1] hover:underline">
                          {party.email}
                        </a>
                      )}
                      {party.phone && (
                        <a href={`tel:${party.phone}`} className="text-xs text-[#84c9d1] hover:underline">
                          {party.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
