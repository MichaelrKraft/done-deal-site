'use client'

import { useState } from 'react'

interface SoulSectionProps {
  initial: string
}

export default function SoulSection({ initial }: SoulSectionProps) {
  const [soulDocument, setSoulDocument] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/soul', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soul_document: draft }),
      })
      if (res.ok) {
        setSoulDocument(draft)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(soulDocument)
    setEditing(false)
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h2 className="text-sm font-semibold text-[#2c2420]">Soul Document</h2>
      </div>

      <div className="rounded-2xl border border-[#e8e2d9] bg-white overflow-hidden">
        {!soulDocument && !editing ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-[#b0a698]">
              No soul document yet. It will be generated when you complete onboarding preferences.
            </p>
          </div>
        ) : editing ? (
          <div className="p-4 space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={16}
              className="w-full rounded-lg border border-[#e8e2d9] bg-[#faf8f5] p-3 text-sm text-[#2c2420] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/30 focus:border-[#c75c2e] resize-y"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-[#e8e2d9] px-3 py-1.5 text-xs font-medium text-[#7a6e63] hover:bg-[#faf8f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#c75c2e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs text-[#b0a698]">
                Your AI TC&apos;s personality and working style
              </p>
              <button
                type="button"
                onClick={() => { setDraft(soulDocument); setEditing(true) }}
                className="text-xs text-[#c75c2e] hover:text-[#b5512a] font-medium transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="rounded-lg bg-[#faf8f5] border border-[#f0ebe4] p-4">
              <pre className="text-sm text-[#2c2420] whitespace-pre-wrap font-sans leading-relaxed">
                {soulDocument}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
