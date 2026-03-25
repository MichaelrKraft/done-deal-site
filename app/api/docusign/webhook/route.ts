import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import type { EsignStatus } from '@/types/database'

/**
 * DocuSign Connect webhook handler.
 * This is a public endpoint — DocuSign sends POST requests here when
 * envelope events occur (signed, declined, voided, delivered, etc.).
 *
 * DocuSign Connect payloads are JSON (configured in DocuSign admin).
 */

interface DocuSignConnectPayload {
  event: string
  apiVersion: string
  uri: string
  retryCount: number
  configurationId: number
  generatedDateTime: string
  data: {
    accountId: string
    userId: string
    envelopeId: string
    envelopeSummary: {
      status: string
      documentsUri: string
      recipientsUri: string
      envelopeUri: string
      emailSubject: string
      envelopeId: string
      sentDateTime?: string
      deliveredDateTime?: string
      completedDateTime?: string
      declinedDateTime?: string
      voidedDateTime?: string
      recipients?: {
        signers?: Array<{
          name: string
          email: string
          status: string
          signedDateTime?: string
          declinedDateTime?: string
        }>
      }
    }
  }
}

/** Map DocuSign envelope status strings to our EsignStatus. */
function mapEnvelopeStatus(dsStatus: string): EsignStatus | null {
  const mapping: Record<string, EsignStatus> = {
    created: 'created',
    sent: 'sent',
    delivered: 'delivered',
    completed: 'signed',
    declined: 'declined',
    voided: 'voided',
  }
  return mapping[dsStatus.toLowerCase()] ?? null
}

export async function POST(request: NextRequest) {
  let payload: DocuSignConnectPayload
  try {
    payload = (await request.json()) as DocuSignConnectPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const envelopeId = payload.data?.envelopeId
  const eventType = payload.event
  const envelopeStatus = payload.data?.envelopeSummary?.status

  if (!envelopeId || !eventType) {
    return NextResponse.json({ error: 'Missing envelope data' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Look up the document by envelope_id
  const { data: document } = await admin
    .from('documents')
    .select('id, transaction_id')
    .eq('docusign_envelope_id', envelopeId)
    .single()

  // If no matching document, we still log the event but need a transaction_id.
  // Without a document match, we cannot determine the transaction — return 200 to
  // prevent DocuSign from retrying endlessly.
  if (!document) {
    console.warn(`[docusign/webhook] No document found for envelope ${envelopeId}`)
    return NextResponse.json({ received: true, matched: false })
  }

  const mappedStatus = mapEnvelopeStatus(envelopeStatus ?? '')

  // Update the document's esign_status
  if (mappedStatus) {
    const documentUpdate: Record<string, unknown> = {
      esign_status: mappedStatus,
      esign_metadata: {
        last_event: eventType,
        last_event_at: payload.generatedDateTime,
        signers: payload.data.envelopeSummary.recipients?.signers?.map((s) => ({
          name: s.name,
          email: s.email,
          status: s.status,
          signed_at: s.signedDateTime ?? null,
          declined_at: s.declinedDateTime ?? null,
        })) ?? [],
      },
    }

    // If completed, also update the document status to 'signed'
    if (mappedStatus === 'signed') {
      documentUpdate.status = 'signed'
    }

    await admin
      .from('documents')
      .update(documentUpdate)
      .eq('id', document.id)
  }

  // Create esign_events record
  await admin.from('esign_events').insert({
    document_id: document.id,
    transaction_id: document.transaction_id,
    provider: 'docusign',
    event_type: eventType,
    envelope_id: envelopeId,
    payload: payload.data as unknown as Record<string, unknown>,
    processed: true,
  })

  // Create ai_action alerts for important events
  if (mappedStatus === 'declined' || mappedStatus === 'voided') {
    // Get agent_id from the transaction
    const { data: transaction } = await admin
      .from('transactions')
      .select('agent_id')
      .eq('id', document.transaction_id)
      .single()

    if (transaction) {
      const actionType = mappedStatus === 'declined'
        ? 'esign_declined_alert'
        : 'esign_voided_alert'

      const declinedSigner = payload.data.envelopeSummary.recipients?.signers?.find(
        (s) => s.status === 'declined'
      )

      await admin.from('ai_actions').insert({
        transaction_id: document.transaction_id,
        agent_id: transaction.agent_id,
        action_type: actionType,
        risk_level: 'high',
        status: 'pending',
        draft_content: {
          envelope_id: envelopeId,
          event: eventType,
          signer: declinedSigner
            ? { name: declinedSigner.name, email: declinedSigner.email }
            : null,
        },
        context_summary: mappedStatus === 'declined'
          ? `Document signing was declined${declinedSigner ? ` by ${declinedSigner.name}` : ''}`
          : 'Document envelope was voided',
      })
    }
  }

  if (mappedStatus === 'signed') {
    const { data: transaction } = await admin
      .from('transactions')
      .select('agent_id')
      .eq('id', document.transaction_id)
      .single()

    if (transaction) {
      await admin.from('ai_actions').insert({
        transaction_id: document.transaction_id,
        agent_id: transaction.agent_id,
        action_type: 'esign_completed',
        risk_level: 'low',
        status: 'pending',
        draft_content: {
          envelope_id: envelopeId,
          event: eventType,
        },
        context_summary: 'All parties have signed the document via DocuSign',
      })
    }
  }

  return NextResponse.json({ received: true, matched: true })
}
