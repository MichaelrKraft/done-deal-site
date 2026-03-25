'use client'

import { useState } from 'react'

interface Memory {
  id: string
  memory_type: string
  content: string
  source: string
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  rule: 'Rule',
  preference: 'Preference',
  context: 'Context',
  correction: 'Correction',
}

const TYPE_COLORS: Record<string, string> = {
  rule: 'bg-amber-50 text-amber-700',
  preference: 'bg-blue-50 text-blue-700',
  context: 'bg-emerald-50 text-emerald-700',
  correction: 'bg-rose-50 text-rose-700',
}

export default function MemoriesSection({ initial }: { initial: Memory[] }) {
  const [memories, setMemories] = useState<Memory[]>(initial)
  const [newRule, setNewRule] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  async function handleAdd() {
    if (!newRule.trim() || adding) return
    setAdding(true)
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newRule.trim(), memory_type: 'rule' }),
      })
      if (res.ok) {
        const { memory } = await res.json() as { memory: Memory }
        setMemories((prev) => [memory, ...prev])
        setNewRule('')
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMemories((prev) => prev.filter((m) => m.id !== id))
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return
    const res = await fetch('/api/memories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content: editText.trim() }),
    })
    if (res.ok) {
      const { memory } = await res.json() as { memory: Memory }
      setMemories((prev) => prev.map((m) => (m.id === id ? memory : m)))
      setEditingId(null)
      setEditText('')
    }
  }

  function startEdit(m: Memory) {
    setEditingId(m.id)
    setEditText(m.content)
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <h2 className="text-sm font-semibold text-[#2c2420]">Memories</h2>
        <span className="text-xs text-[#b0a698] ml-1">({memories.length})</span>
      </div>

      {/* Add new rule */}
      <div className="rounded-2xl border border-[#e8e2d9] bg-white p-4 mb-3">
        <p className="text-xs text-[#7a6e63] mb-2">
          Add a rule or preference your AI TC should always follow.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            placeholder="e.g. Always CC the listing agent on lender emails"
            className="flex-1 rounded-lg border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]/40"
          />
          <button
            onClick={handleAdd}
            disabled={!newRule.trim() || adding}
            className="rounded-lg bg-[#c75c2e] px-4 py-2 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {adding ? 'Adding...' : 'Add Rule'}
          </button>
        </div>
      </div>

      {/* Memory list */}
      {memories.length === 0 ? (
        <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-6 text-center">
          <p className="text-sm text-[#b0a698]">
            No memories yet. Tell your AI TC something in chat like
            &quot;Don&apos;t ever ask for dates on addendums&quot; and it will remember.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          {memories.map((m) => (
            <div key={m.id} className="px-4 py-3 group">
              {editingId === m.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(m.id)
                      if (e.key === 'Escape') { setEditingId(null); setEditText('') }
                    }}
                    autoFocus
                    className="flex-1 rounded-lg border border-[#c75c2e]/30 bg-[#faf8f5] px-3 py-1.5 text-sm text-[#2c2420] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20"
                  />
                  <button
                    onClick={() => handleSaveEdit(m.id)}
                    className="text-xs text-[#c75c2e] font-medium hover:text-[#b5512a]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditText('') }}
                    className="text-xs text-[#b0a698] hover:text-[#7a6e63]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => startEdit(m)}
                    title="Click to edit"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[m.memory_type] ?? 'bg-gray-50 text-gray-600'}`}>
                        {TYPE_LABELS[m.memory_type] ?? m.memory_type}
                      </span>
                      <span className="text-[10px] text-[#b0a698]">
                        via {m.source}
                      </span>
                    </div>
                    <p className="text-sm text-[#2c2420] leading-relaxed">{m.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b0a698] hover:text-red-500 mt-1 shrink-0"
                    title="Remove memory"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
