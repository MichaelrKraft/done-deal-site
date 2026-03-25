import { NextRequest, NextResponse } from 'next/server'
import { processInboundEmail, type SendGridInboundPayload } from '@/lib/inbound-processor'

/**
 * POST /api/inbound/webhook
 *
 * SendGrid Inbound Parse webhook endpoint.
 * Receives multipart/form-data with email fields and attachments.
 * Always returns 200 — SendGrid retries on non-200 responses.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()

    // Build the payload from form fields
    const payload: SendGridInboundPayload = {
      from: formData.get('from') as string || '',
      to: formData.get('to') as string || '',
      subject: formData.get('subject') as string || '',
      text: formData.get('text') as string || '',
      html: formData.get('html') as string || undefined,
      headers: formData.get('headers') as string || undefined,
      attachment_info: formData.get('attachment-info') as string || undefined,
      attachments: formData.get('attachments') as string || undefined,
    }

    // Parse attachments
    const attachmentCount = parseInt(payload.attachments || '0', 10)
    const parsedAttachments: {
      filename: string
      contentType: string
      sizeBytes: number
      buffer: Buffer
    }[] = []

    for (let i = 1; i <= attachmentCount; i++) {
      const file = formData.get(`attachment${i}`)
      if (file && file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer()
        parsedAttachments.push({
          filename: (file as File).name || `attachment${i}`,
          contentType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          buffer: Buffer.from(arrayBuffer),
        })
      }
    }

    // Process in the background — always return 200 quickly
    processInboundEmail(payload, parsedAttachments).catch((err) => {
      console.error('[inbound/webhook] Background processing error:', err)
    })

    return NextResponse.json({ status: 'accepted' }, { status: 200 })
  } catch (err) {
    console.error('[inbound/webhook] Failed to parse request:', err)
    // Still return 200 to prevent SendGrid retries on parse failures
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}
