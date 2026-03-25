'use client'

import { useState, useEffect } from 'react'
import type { EmailTemplateRow, EmailTemplateCategory } from '@/types/database'
import TemplateEditor from '@/components/templates/TemplateEditor'

const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  general: 'General',
  under_contract: 'Under Contract',
  pre_closing: 'Pre-Closing',
  post_close: 'Post Close',
  follow_up: 'Follow Up',
  compliance: 'Compliance',
}

const CATEGORY_COLORS: Record<EmailTemplateCategory, string> = {
  general: 'bg-[#f5f0ea] text-[#7a6e63]',
  under_contract: 'bg-blue-50 text-blue-700',
  pre_closing: 'bg-amber-50 text-amber-700',
  post_close: 'bg-emerald-50 text-emerald-700',
  follow_up: 'bg-purple-50 text-purple-700',
  compliance: 'bg-rose-50 text-rose-700',
}

export default function TemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateRow | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json() as { templates: EmailTemplateRow[] }
        setTemplates(data.templates)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    setEditingTemplate(undefined)
    setShowEditor(true)
  }

  function handleEdit(template: EmailTemplateRow) {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  function handleSave(saved: EmailTemplateRow) {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setShowEditor(false)
    setEditingTemplate(undefined)
  }

  function handleCancel() {
    setShowEditor(false)
    setEditingTemplate(undefined)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">Email Templates</h2>
          <span className="text-xs text-[#b0a698] ml-1">({templates.length})</span>
        </div>
        {!showEditor && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#84c9d1] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6fb8c0] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Template
          </button>
        )}
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="mb-4">
          <TemplateEditor
            template={editingTemplate}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-6 text-center">
          <p className="text-sm text-[#b0a698]">Loading templates...</p>
        </div>
      ) : templates.length === 0 && !showEditor ? (
        <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-6 text-center">
          <p className="text-sm text-[#b0a698]">
            No email templates yet. Create one to speed up your AI email drafting.
          </p>
        </div>
      ) : templates.length > 0 ? (
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          {templates.map((t) => (
            <div key={t.id} className="px-4 py-3 group">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => handleEdit(t)}
                  title="Click to edit"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#2c2420] font-medium truncate">
                      {t.name}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[t.category]}`}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                    {t.is_shared && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7a6e63] truncate">{t.subject}</p>
                  {t.usage_count > 0 && (
                    <p className="text-[10px] text-[#b0a698] mt-1">
                      Used {t.usage_count} time{t.usage_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Delete template "${t.name}"?`)) {
                      handleDelete(t.id)
                    }
                  }}
                  disabled={deletingId === t.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b0a698] hover:text-red-500 mt-1 shrink-0 disabled:opacity-50"
                  title="Delete template"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
