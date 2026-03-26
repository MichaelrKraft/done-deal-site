import Anthropic from '@anthropic-ai/sdk'
import { defineTool } from './types'
import type { TCToolDefinition } from './types'
import { createAdminClient } from '@/lib/supabase/server-admin'
import type { ScanFinding } from '@/types/database'

// ============================================================
// TYPES
// ============================================================

interface DocumentScannerInput {
  document_id: string
  transaction_id: string
}

export type { ScanFinding }

export interface DocumentScanResult {
  findings: ScanFinding[]
  documentId: string
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const documentScannerDef: TCToolDefinition = defineTool(
  'scan_document_completeness',
  'Scan a real estate document for missing signatures, blank required fields, and date mismatches using AI vision.',
  {
    properties: {
      document_id: { type: 'string', description: 'UUID of the document to scan' },
      transaction_id: { type: 'string', description: 'UUID of the transaction this document belongs to' },
    },
    required: ['document_id', 'transaction_id'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

export async function executeDocumentScanner(input: DocumentScannerInput): Promise<DocumentScanResult> {
  const { document_id, transaction_id } = input
  const admin = createAdminClient()

  // 1. Mark as scanning
  await admin
    .from('documents')
    .update({ scan_status: 'scanning' })
    .eq('id', document_id)
    .eq('transaction_id', transaction_id)

  // 2. Fetch document row
  const { data: doc, error: fetchError } = await admin
    .from('documents')
    .select('id, file_path, display_name, content_type')
    .eq('id', document_id)
    .single()

  if (fetchError || !doc || !doc.file_path) {
    await admin
      .from('documents')
      .update({ scan_status: 'failed' })
      .eq('id', document_id)
    throw new Error(`Document not found or has no file: ${fetchError?.message ?? 'no file_path'}`)
  }

  // 3. Get signed URL from Supabase Storage
  const { data: signedData, error: signedError } = await admin.storage
    .from('transaction-documents')
    .createSignedUrl(doc.file_path, 60)

  if (signedError || !signedData?.signedUrl) {
    await admin
      .from('documents')
      .update({ scan_status: 'failed' })
      .eq('id', document_id)
    throw new Error(`Failed to get signed URL: ${signedError?.message ?? 'no URL'}`)
  }

  // 4. Fetch file and convert to base64
  const fileResponse = await fetch(signedData.signedUrl)
  if (!fileResponse.ok) {
    await admin
      .from('documents')
      .update({ scan_status: 'failed' })
      .eq('id', document_id)
    throw new Error(`Failed to fetch document file: ${fileResponse.status}`)
  }

  const arrayBuffer = await fileResponse.arrayBuffer()
  const base64Data = Buffer.from(arrayBuffer).toString('base64')

  const contentType = doc.content_type ?? 'application/pdf'
  const isPdf = contentType === 'application/pdf'

  // 5. Call Claude Vision — PDFs use document source, images use image source
  const anthropic = new Anthropic()

  type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  type ContentBlock =
    | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
    | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }
    | { type: 'text'; text: string }

  const docBlock: ContentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
    : { type: 'image', source: { type: 'base64', media_type: contentType as ImageMediaType, data: base64Data } }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          docBlock,
          {
            type: 'text',
            text: 'Review this real estate document. List any: (1) blank required fields needing signature/date/initials, (2) missing signatures or initials, (3) date inconsistencies. Be concise. If complete, say "Document appears complete."',
          },
        ],
      },
    ],
  })

  // 6. Parse response into findings
  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  const findings = parseFindings(responseText)

  // 7. Write findings back to DB
  await admin
    .from('documents')
    .update({ scan_findings: findings, scan_status: 'complete' })
    .eq('id', document_id)

  return { findings, documentId: document_id }
}

// ============================================================
// HELPERS
// ============================================================

function parseFindings(responseText: string): ScanFinding[] {
  const lower = responseText.toLowerCase()

  // If Claude says the doc is complete, return empty findings
  if (lower.includes('appears complete') || lower.includes('document appears complete')) {
    return []
  }

  // Split on newlines and numbered/bulleted list items
  const lines = responseText
    .split(/\n/)
    .map((l) => l.replace(/^[\d]+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
    .filter((l) => l.length > 10)

  return lines.map((line): ScanFinding => {
    const lineLower = line.toLowerCase()
    let severity: ScanFinding['severity'] = 'warning'
    if (
      lineLower.includes('missing signature') ||
      lineLower.includes('blank') ||
      lineLower.includes('required') ||
      lineLower.includes('unsigned')
    ) {
      severity = 'error'
    } else if (lineLower.includes('inconsisten') || lineLower.includes('mismatch')) {
      severity = 'warning'
    } else {
      severity = 'info'
    }
    return { text: line, severity }
  })
}
