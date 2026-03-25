import { createAdminClient } from '@/lib/supabase/server-admin'
import { extractContractData, type ExtractedContractData } from '@/lib/pdf-extractor'
import { fuzzyMatchAddress } from '@/lib/address-matcher'

/**
 * Payload shape from the SendGrid Inbound Parse webhook.
 * SendGrid sends multipart/form-data with these fields.
 */
export interface SendGridInboundPayload {
  from: string        // "Jane Smith <jane@example.com>" or "jane@example.com"
  to: string          // recipient address(es), comma-separated
  subject: string
  text: string        // plain-text body
  html?: string       // HTML body (unused for now)
  headers?: string    // raw headers
  /** SendGrid sends attachments info as a JSON string */
  attachment_info?: string
  /** Number of attachments */
  attachments?: string
  /** Individual attachment fields: attachment1, attachment2, etc. */
  [key: string]: unknown
}

interface ParsedAttachment {
  filename: string
  contentType: string
  sizeBytes: number
  buffer: Buffer
}

/**
 * Parse "Name <email>" or bare "email" into { name, email }.
 */
function parseFromField(from: string): { name: string | null; email: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim().toLowerCase() }
  }
  return { name: null, email: from.trim().toLowerCase() }
}

/**
 * Extract the first recipient address from the "to" field.
 */
function parseToAddress(to: string): string {
  const match = to.match(/<([^>]+)>/)
  if (match) return match[1].trim().toLowerCase()
  // Comma-separated bare addresses
  return to.split(',')[0].trim().toLowerCase()
}

/**
 * Main entry point: process an inbound email from the SendGrid webhook.
 * This runs with the admin Supabase client (no user session).
 */
export async function processInboundEmail(
  payload: SendGridInboundPayload,
  attachments: ParsedAttachment[]
): Promise<void> {
  const supabase = createAdminClient()
  const { name: fromName, email: fromEmail } = parseFromField(payload.from)
  const toAddress = parseToAddress(payload.to)

  // 1. Find the agent by inbox_address
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, brokerage_id, name')
    .eq('inbox_address', toAddress)
    .single()

  if (agentError || !agent) {
    console.error('[inbound] No agent found for address:', toAddress)
    return
  }

  // 2. Check for duplicate message_id
  const messageId = extractHeader(payload.headers, 'Message-ID')
  if (messageId) {
    const { data: existing } = await supabase
      .from('inbound_emails')
      .select('id')
      .eq('message_id', messageId)
      .maybeSingle()

    if (existing) {
      console.log('[inbound] Duplicate message_id, skipping:', messageId)
      return
    }
  }

  // 3. Insert inbound_email record
  const inReplyTo = extractHeader(payload.headers, 'In-Reply-To')
  const { data: emailRecord, error: emailError } = await supabase
    .from('inbound_emails')
    .insert({
      agent_id: agent.id,
      from_email: fromEmail,
      from_name: fromName,
      subject: payload.subject || null,
      body_text: payload.text || null,
      message_id: messageId || null,
      in_reply_to: inReplyTo || null,
      attachment_count: attachments.length,
      processing_status: 'processing' as const,
    })
    .select('id')
    .single()

  if (emailError || !emailRecord) {
    console.error('[inbound] Failed to insert email record:', emailError)
    return
  }

  try {
    // 4. Process PDF attachments
    const pdfAttachments = attachments.filter(
      (a) => a.contentType === 'application/pdf' || a.filename.toLowerCase().endsWith('.pdf')
    )

    // Store all attachment records (PDF and non-PDF)
    for (const att of attachments) {
      const isPdf = att.contentType === 'application/pdf' || att.filename.toLowerCase().endsWith('.pdf')
      await supabase.from('inbound_attachments').insert({
        inbound_email_id: emailRecord.id,
        filename: att.filename,
        content_type: att.contentType,
        size_bytes: att.sizeBytes,
        is_pdf: isPdf,
        extraction_status: isPdf ? 'pending' as const : 'skipped' as const,
      })
    }

    if (pdfAttachments.length === 0) {
      // Non-PDF email: store for context, mark completed
      await supabase
        .from('inbound_emails')
        .update({ processing_status: 'completed' as const })
        .eq('id', emailRecord.id)
      return
    }

    // 5. For each PDF, extract data and match/create transaction
    // Fetch existing transaction addresses for this agent
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, property_address')
      .eq('agent_id', agent.id)

    const existingAddresses = (transactions ?? []).map((t) => t.property_address)
    const addressToTxId = new Map(
      (transactions ?? []).map((t) => [t.property_address, t.id])
    )

    for (const pdf of pdfAttachments) {
      let extractedData: ExtractedContractData = {}
      try {
        extractedData = await extractContractData(pdf.buffer)
      } catch (err) {
        console.error('[inbound] PDF extraction failed for', pdf.filename, err)
        await supabase
          .from('inbound_attachments')
          .update({
            extraction_status: 'failed' as const,
            extracted_data: { error: String(err) },
          })
          .eq('inbound_email_id', emailRecord.id)
          .eq('filename', pdf.filename)
        continue
      }

      // Update attachment with extracted data
      await supabase
        .from('inbound_attachments')
        .update({
          extraction_status: 'success' as const,
          extracted_data: extractedData as Record<string, unknown>,
        })
        .eq('inbound_email_id', emailRecord.id)
        .eq('filename', pdf.filename)

      // 6. Match address or create new transaction
      let transactionId: string | null = null

      if (extractedData.property_address) {
        const matchResult = fuzzyMatchAddress(extractedData.property_address, existingAddresses)
        if (matchResult.match) {
          transactionId = addressToTxId.get(matchResult.match) ?? null
        }
      }

      if (transactionId) {
        // Existing transaction: create document record
        await supabase.from('documents').insert({
          transaction_id: transactionId,
          doc_type: 'contract',
          display_name: pdf.filename,
          status: 'uploaded' as const,
          uploaded_via: 'inbound_email' as const,
          content_type: pdf.contentType,
          file_size_bytes: pdf.sizeBytes,
        })
      } else {
        // New transaction: create transaction + ai_action for agent review
        const { data: newTx } = await supabase
          .from('transactions')
          .insert({
            agent_id: agent.id,
            brokerage_id: agent.brokerage_id,
            property_address: extractedData.property_address || `Unknown (from ${pdf.filename})`,
            side: 'buyer' as const,
            stage: 'under_contract' as const,
            mec_date: extractedData.mec_date || null,
            closing_date: extractedData.closing_date || null,
            sale_price: extractedData.sale_price || null,
            earnest_money: extractedData.earnest_money || null,
          })
          .select('id')
          .single()

        if (newTx) {
          transactionId = newTx.id

          // Create document record
          await supabase.from('documents').insert({
            transaction_id: newTx.id,
            doc_type: 'contract',
            display_name: pdf.filename,
            status: 'uploaded' as const,
            uploaded_via: 'inbound_email' as const,
            content_type: pdf.contentType,
            file_size_bytes: pdf.sizeBytes,
          })

          // Create ai_action for agent to review the new transaction
          await supabase.from('ai_actions').insert({
            transaction_id: newTx.id,
            agent_id: agent.id,
            action_type: 'review_inbound_transaction',
            risk_level: 'medium' as const,
            status: 'pending' as const,
            draft_content: {
              source: 'inbound_email',
              from_email: fromEmail,
              from_name: fromName,
              filename: pdf.filename,
              extracted: extractedData,
            },
            context_summary: `New transaction created from inbound email (${pdf.filename}) from ${fromName || fromEmail}. Please review the extracted data.`,
          })
        }
      }

      // Link the email to the transaction
      if (transactionId) {
        await supabase
          .from('inbound_emails')
          .update({ transaction_id: transactionId })
          .eq('id', emailRecord.id)
      }
    }

    // Mark email as completed
    await supabase
      .from('inbound_emails')
      .update({ processing_status: 'completed' as const })
      .eq('id', emailRecord.id)
  } catch (err) {
    console.error('[inbound] Processing failed:', err)
    await supabase
      .from('inbound_emails')
      .update({
        processing_status: 'failed' as const,
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq('id', emailRecord.id)
  }
}

/**
 * Extract a specific header value from the raw headers string.
 */
function extractHeader(headers: string | undefined, name: string): string | null {
  if (!headers) return null
  const regex = new RegExp(`^${name}:\\s*(.+)$`, 'im')
  const match = headers.match(regex)
  return match ? match[1].trim().replace(/^<|>$/g, '') : null
}
