'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PreferredVendor, VendorCategory } from '@/types/database'

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  title: 'Title',
  lender: 'Lender',
  inspector: 'Inspector',
  attorney: 'Attorney',
  hoa: 'HOA',
}

const CATEGORIES: VendorCategory[] = ['title', 'lender', 'inspector', 'attorney', 'hoa']

interface AddForm {
  name: string
  company: string
  email: string
  phone: string
  category: VendorCategory
}

const EMPTY_FORM: AddForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  category: 'title',
}

export default function VendorsSection() {
  const [vendors, setVendors] = useState<PreferredVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vendors')
      if (!res.ok) throw new Error('Failed to load vendors')
      const data = await res.json() as { vendors: PreferredVendor[] }
      setVendors(data.vendors)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchVendors()
  }, [fetchVendors])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          name: form.name.trim(),
          company: form.company.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? 'Failed to save vendor')
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
      await fetchVendors()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete vendor')
      setVendors((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.75 0zM19.5 10.5h.008v.008H19.5V10.5zm-3.75 1.5h.008v.008h-.008V12z" />
        </svg>
        <h2 className="text-sm font-semibold text-[#2c2420]">Preferred Vendors</h2>
      </div>

      <div className="rounded-2xl border border-[#e8e2d9] bg-white overflow-hidden">
        {error && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>
        )}

        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-[#b0a698]">Loading…</div>
        ) : vendors.length === 0 && !showForm ? (
          <div className="px-4 py-6 text-center text-sm text-[#b0a698]">No vendors added yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0ebe4]">
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#b0a698]">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#b0a698]">Company</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#b0a698]">Category</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#b0a698]">Email</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe4]">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-[#faf8f5]">
                  <td className="px-4 py-2.5 text-[#2c2420] font-medium">{v.name}</td>
                  <td className="px-4 py-2.5 text-[#7a6e63]">{v.company ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-full bg-[#f5f0ea] px-2 py-0.5 text-[10px] font-medium text-[#7a6e63]">
                      {CATEGORY_LABELS[v.category]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#7a6e63]">{v.email ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDelete(v.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showForm && (
          <form onSubmit={(e) => void handleAdd(e)} className="border-t border-[#f0ebe4] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#7a6e63] mb-1">Name <span className="text-red-400">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs text-[#7a6e63] mb-1">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none"
                  placeholder="Acme Title Co."
                />
              </div>
              <div>
                <label className="block text-xs text-[#7a6e63] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-[#7a6e63] mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none"
                  placeholder="720-555-0100"
                />
              </div>
              <div>
                <label className="block text-xs text-[#7a6e63] mb-1">Category <span className="text-red-400">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as VendorCategory }))}
                  className="w-full rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="rounded-lg border border-[#e8e2d9] bg-white px-3 py-1.5 text-xs font-medium text-[#7a6e63] hover:bg-[#faf8f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#84c9d1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6fb8c0] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Vendor'}
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-[#f0ebe4] px-4 py-3">
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#84c9d1] hover:text-[#6fb8c0] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Vendor
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
