'use client'

import { useState, useRef } from 'react'
import type { EmailTemplateRow, EmailTemplateCategory } from '@/types/database'

const CATEGORIES: { value: EmailTemplateCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'pre_closing', label: 'Pre-Closing' },
  { value: 'post_close', label: 'Post Close' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'compliance', label: 'Compliance' },
]

const AVAILABLE_VARIABLES = [
  'buyer_name',
  'seller_name',
  'property_address',
  'closing_date',
  'mec_date',
  'agent_name',
  'title_company',
  'lender_name',
  'earnest_money',
  'sale_price',
] as const

interface TemplateEditorProps {
  template?: EmailTemplateRow
  onSave: (template: EmailTemplateRow) => void
  onCancel: () => void
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [category, setCategory] = useState<EmailTemplateCategory>(template?.category ?? 'general')
  const [subject, setSubject] = useState(template?.subject ?? '')
  const [body, setBody] = useState(template?.body ?? '')
  const [isShared, setIsShared] = useState(template?.is_shared ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  function insertVariable(variable: string) {
    const textarea = bodyRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const tag = `{{${variable}}}`
    const newBody = body.slice(0, start) + tag + body.slice(end)
    setBody(newBody)
    // Restore cursor position after the inserted tag
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    })
  }

  // Extract variables used in body + subject
  function getUsedVariables(): string[] {
    const combined = subject + ' ' + body
    const matches = combined.match(/\{\{(\w+)\}\}/g)
    if (!matches) return []
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
  }

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError('Name, subject, and body are required.')
      return
    }
    setSaving(true)
    setError(null)

    const usedVars = getUsedVariables()
    const payload = { name: name.trim(), category, subject: subject.trim(), body: body.trim(), variables: usedVars, is_shared: isShared }

    try {
      const url = template ? `/api/templates/${template.id}` : '/api/templates'
      const method = template ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to save template')
        return
      }
      const data = await res.json() as { template: EmailTemplateRow }
      onSave(data.template)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  // Highlight variables in preview text
  function highlightVariables(text: string): React.ReactNode[] {
    const parts = text.split(/(\{\{\w+\}\})/)
    return parts.map((part, i) => {
      if (/^\{\{\w+\}\}$/.test(part)) {
        return (
          <span key={i} className="inline-block bg-[#c75c2e]/10 text-[#c75c2e] rounded px-1 font-medium">
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="rounded-2xl border border-[#e8e2d9] bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[#2c2420]">
        {template ? 'Edit Template' : 'New Template'}
      </h3>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-[#7a6e63] mb-1">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Inspection Follow-Up"
          className="w-full rounded-lg border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]/40"
        />
      </div>

      {/* Category + Shared */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#7a6e63] mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EmailTemplateCategory)}
            className="w-full rounded-lg border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2 text-sm text-[#2c2420] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded border-[#e8e2d9] text-[#c75c2e] focus:ring-[#c75c2e]/20"
            />
            <span className="text-xs text-[#7a6e63]">Share with brokerage</span>
          </label>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-[#7a6e63] mb-1">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Inspection Update - {{property_address}}"
          className="w-full rounded-lg border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]/40"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-[#7a6e63] mb-1">Email Body</label>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder="Write your template here. Use {{variable_name}} for dynamic content."
          className="w-full rounded-lg border border-[#e8e2d9] bg-[#faf8f5] px-3 py-2 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:outline-none focus:ring-2 focus:ring-[#c75c2e]/20 focus:border-[#c75c2e]/40 resize-y font-mono"
        />
      </div>

      {/* Variable chips */}
      <div>
        <label className="block text-xs font-medium text-[#7a6e63] mb-2">Insert Variable</label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="inline-flex items-center rounded-full bg-[#f5f0ea] px-2.5 py-1 text-[11px] font-medium text-[#7a6e63] hover:bg-[#e8e2d9] hover:text-[#2c2420] transition-colors"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(subject.includes('{{') || body.includes('{{')) && (
        <div>
          <label className="block text-xs font-medium text-[#7a6e63] mb-2">Preview</label>
          <div className="rounded-lg border border-[#e8e2d9] bg-[#faf8f5] p-3 space-y-2">
            <div className="text-xs text-[#b0a698]">Subject:</div>
            <div className="text-sm text-[#2c2420] font-medium">{highlightVariables(subject)}</div>
            <div className="text-xs text-[#b0a698] pt-2 border-t border-[#f0ebe4]">Body:</div>
            <div className="text-sm text-[#2c2420] leading-relaxed whitespace-pre-wrap">
              {highlightVariables(body)}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#e8e2d9] bg-white px-4 py-2 text-xs font-medium text-[#7a6e63] hover:bg-[#faf8f5] transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim() || !subject.trim() || !body.trim()}
          className="rounded-lg bg-[#c75c2e] px-4 py-2 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </div>
  )
}
