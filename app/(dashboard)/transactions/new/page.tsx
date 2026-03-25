'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ExtractedContractData } from '@/lib/pdf-extractor'

export default function NewTransactionPage() {
  const router = useRouter()
  const [side, setSide] = useState<'buyer' | 'seller'>('buyer')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedContractData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    property_address: '',
    mec_date: '',
    closing_date: '',
    sale_price: '',
    earnest_money: '',
  })
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExtracting(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('side', side)
    const res = await fetch('/api/transactions/extract', { method: 'POST', body: fd })
    if (!res.ok) {
      const body = await res.json() as { error?: string }
      setError(body.error ?? 'PDF extraction failed')
      setExtracting(false)
      return
    }
    const { extracted: data } = await res.json() as { extracted: ExtractedContractData }
    if (data) {
      setExtracted(data)
      setForm({
        property_address: data.property_address ?? '',
        mec_date: data.mec_date ?? '',
        closing_date: data.closing_date ?? '',
        sale_price: data.sale_price?.toString() ?? '',
        earnest_money: data.earnest_money?.toString() ?? '',
      })
    }
    setExtracting(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const parties = []
    if (extracted?.buyer_name) parties.push({ role: 'buyer', name: extracted.buyer_name, email: extracted.buyer_email })
    if (extracted?.seller_name) parties.push({ role: 'seller', name: extracted.seller_name })
    if (extracted?.buyer_agent_name) parties.push({ role: 'buyer_agent', name: extracted.buyer_agent_name, email: extracted.buyer_agent_email })
    if (extracted?.seller_agent_name) parties.push({ role: 'seller_agent', name: extracted.seller_agent_name, email: extracted.seller_agent_email })
    if (extracted?.lender_name) parties.push({ role: 'lender', name: extracted.lender_name, email: extracted.lender_email })
    if (extracted?.title_company) parties.push({ role: 'title', name: extracted.title_company, email: extracted.title_email })

    const property_details = {
      year_built: extracted?.year_built,
      has_hoa: extracted?.has_hoa,
      has_solar: extracted?.has_solar,
      solar_type: extracted?.solar_type,
      has_septic: extracted?.has_septic,
      has_well: extracted?.has_well,
    }

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_address: form.property_address,
        side,
        mec_date: form.mec_date || undefined,
        closing_date: form.closing_date || undefined,
        sale_price: form.sale_price ? parseInt(form.sale_price) : undefined,
        earnest_money: form.earnest_money ? parseInt(form.earnest_money) : undefined,
        property_details,
        parties: parties.filter(p => p.name),
      }),
    })
    if (!res.ok) {
      const body = await res.json() as { error?: string }
      setError(body.error ?? 'Failed to create transaction')
      setLoading(false)
      return
    }
    const { transactionId } = await res.json() as { transactionId: string }
    if (transactionId) router.push(`/transactions/${transactionId}`)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-[#2c2420] mb-6">New Transaction</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Upload CBS Contract PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const file = e.dataTransfer.files[0]
              if (file && file.type === 'application/pdf') {
                const dt = new DataTransfer()
                dt.items.add(file)
                if (fileRef.current) {
                  fileRef.current.files = dt.files
                  fileRef.current.dispatchEvent(new Event('change', { bubbles: true }))
                }
              }
            }}
            className="border-2 border-dashed border-[#e8e2d9] rounded-lg p-8 text-center cursor-pointer hover:border-[#c75c2e] transition-colors"
          >
            {extracting ? (
              <p className="text-[#7a6e63]">Extracting contract data...</p>
            ) : extracted ? (
              <p className="text-[#0F7B0F]">Contract extracted — form pre-filled below</p>
            ) : (
              <>
                <p className="text-[#2c2420] font-medium">Drop CBS PDF here</p>
                <p className="text-[#b0a698] text-sm mt-1">Auto-fills all fields from your contract</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePDFUpload} />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Transaction Side</Label>
          <div className="flex gap-2 mt-1">
            {(['buyer', 'seller'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  side === s ? 'bg-[#c75c2e] text-white' : 'bg-[#f5f0ea] text-[#7a6e63] hover:bg-[#ece6dd]'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            value={form.property_address}
            onChange={e => setForm({ ...form, property_address: e.target.value })}
            placeholder="123 Main St, Denver, CO 80203"
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mec">MEC Date</Label>
            <Input id="mec" type="date" value={form.mec_date} onChange={e => setForm({ ...form, mec_date: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="close">Closing Date</Label>
            <Input id="close" type="date" value={form.closing_date} onChange={e => setForm({ ...form, closing_date: e.target.value })} className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Sale Price ($)</Label>
            <Input id="price" type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} placeholder="450000" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="earnest">Earnest Money ($)</Label>
            <Input id="earnest" type="number" value={form.earnest_money} onChange={e => setForm({ ...form, earnest_money: e.target.value })} placeholder="5000" className="mt-1" />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading || !form.property_address} className="flex-1">
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
