import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import crypto from 'crypto'

// Maps DocuSign envelope status to our esign_status column value
// esign_status: 'created'|'sent'|'delivered'|'signed'|'declined'|'voided'
const ESIGN_STATUS_MAP: Record<string, string> = {
  completed: 'signed',
  declined: 'declined',
  voided: 'voided',
}

function verifyDocuSignHMAC(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload, 'utf8')
  const computed = hmac.digest('base64')
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.DOCUSIGN_WEBHOOK_HMAC_SECRET
  if (!secret) {
    console.error('[DocuSign webhook] DOCUSIGN_WEBHOOK_HMAC_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Read raw body BEFORE parsing (signature is over raw bytes)
  const rawBody = await req.text()

  const signature = req.headers.get('x-docusign-signature-1')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  if (!verifyDocuSignHMAC(rawBody, signature, secret)) {
    console.warn('[DocuSign webhook] HMAC verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const envelopeStatus = (payload.status as string | undefined)?.toLowerCase()
  const envelopeId = payload.envelopeId as string | undefined

  if (!envelopeStatus || !envelopeId) {
    return NextResponse.json({ error: 'Missing envelope data' }, { status: 400 })
  }

  const newEsignStatus = ESIGN_STATUS_MAP[envelopeStatus]
  if (!newEsignStatus) {
    // Ignore statuses we don't track (e.g. 'sent', 'delivered', 'created')
    return NextResponse.json({ ok: true, ignored: true })
  }

  const admin = createAdminClient()

  // Update esign_status always; also flip status → 'signed' when DocuSign confirms completed
  const updatePayload: Record<string, string> = { esign_status: newEsignStatus }
  if (envelopeStatus === 'completed') {
    updatePayload.status = 'signed'
  }

  const { data: doc, error } = await admin
    .from('documents')
    .update(updatePayload)
    .eq('docusign_envelope_id', envelopeId)
    .select('id, transaction_id')
    .single()

  if (error || !doc) {
    // Could be from a different integration or a test event
    console.warn('[DocuSign webhook] No document found for envelopeId:', envelopeId)
    return NextResponse.json({ ok: true, found: false })
  }

  console.log(`[DocuSign webhook] Document ${doc.id} -> esign_status: ${newEsignStatus} (envelope: ${envelopeId})`)

  return NextResponse.json({ ok: true, documentId: doc.id, esignStatus: newEsignStatus })
}
