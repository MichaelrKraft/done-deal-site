import type { TCEventJobData } from '../job-types'
import type { AIAction } from '@/types/database'
import { executeDocumentScanner } from '@/tools/document-scanner'
import { createAdminClient } from '@/lib/supabase/server-admin'

export async function processTCEventJob(data: TCEventJobData): Promise<void> {
  const { event_type, transaction_id, agent_id, payload } = data

  console.log(`[TC Event] ${event_type} for transaction ${transaction_id}`)

  switch (event_type) {
    case 'mec_entered':
      // TODO Phase 2: trigger DeadlineCalculator
      console.log(`[MEC Entered] Transaction ${transaction_id} — Phase 2 will calculate deadlines`)
      break
    case 'document_uploaded': {
      const documentId = typeof payload?.document_id === 'string' ? payload.document_id : null
      if (documentId) {
        try {
          await executeDocumentScanner({ document_id: documentId, transaction_id })
          console.log(`[Doc Scan] Completed scan for document ${documentId}`)
        } catch (err) {
          console.error(`[Doc Scan] Failed for document ${documentId}:`, err)
          // Mark as failed without crashing the event handler
          try {
            const admin = createAdminClient()
            await admin
              .from('documents')
              .update({ scan_status: 'failed' })
              .eq('id', documentId)
          } catch {
            // ignore secondary failure
          }
        }
      } else {
        console.log(`[Doc Uploaded] Transaction ${transaction_id} — no document_id in payload`)
      }
      break
    }
    case 'stage_changed':
      console.log(`[Stage Changed] Transaction ${transaction_id} — Phase 3 stub`)
      break
    case 'email_received':
      console.log(`[Email Received] Transaction ${transaction_id} — Phase 4 stub`)
      break
    case 'action_approved': {
      const actionId = typeof payload?.action_id === 'string' ? payload.action_id : null
      if (!actionId) {
        console.log('[Action Approved] No action_id in payload')
        break
      }

      const adminClient = createAdminClient()

      // Load the action
      const { data: rawAction, error: actionErr } = await adminClient
        .from('ai_actions')
        .select('*')
        .eq('id', actionId)
        .single()

      if (actionErr || !rawAction) {
        console.error('[Action Approved] Action not found:', actionErr?.message)
        break
      }
      const action = rawAction as unknown as AIAction

      // Load agent tokens for email/calendar execution
      const { data: agentData } = await adminClient
        .from('agents')
        .select('google_token, outlook_token')
        .eq('id', agent_id)
        .single()

      const tokenData = agentData as { google_token?: Record<string, unknown> | null; outlook_token?: Record<string, unknown> | null } | null
      const draft = (action.draft_content ?? {}) as Record<string, unknown>

      // Execute based on action type
      try {
        if (action.action_type === 'draft_email' || action.action_type === 'deadline_reminder') {
          const to = typeof draft.to === 'string' ? draft.to : ''
          const subject = typeof draft.subject === 'string' ? draft.subject : ''
          const body = typeof draft.body === 'string' ? draft.body : ''

          if (to && subject) {
            if (tokenData?.google_token) {
              const { sendGmailEmail } = await import('@/integrations/google-workspace')
              const tokens = tokenData.google_token as unknown as import('@/integrations/google-workspace').GoogleTokens
              const sendResult = await sendGmailEmail(tokens, { to, subject, body })
              if (sendResult.refreshedTokens) {
                await adminClient.from('agents').update({ google_token: sendResult.refreshedTokens as unknown as Record<string, unknown> }).eq('id', agent_id)
              }
            } else if (tokenData?.outlook_token) {
              const { sendEmail } = await import('@/integrations/microsoft-graph')
              const tokens = tokenData.outlook_token as unknown as import('@/integrations/microsoft-graph').OutlookTokens
              const sendResult = await sendEmail(tokens, { to, subject, body })
              if (sendResult.refreshedTokens) {
                await adminClient.from('agents').update({ outlook_token: sendResult.refreshedTokens as unknown as Record<string, unknown> }).eq('id', agent_id)
              }
            }
          }
        } else if (action.action_type === 'calendar_event') {
          const eventSubject = typeof draft.subject === 'string' ? draft.subject : ''
          const eventDate = typeof draft.date === 'string' ? draft.date : ''
          if (eventSubject && eventDate) {
            if (tokenData?.google_token) {
              const { createGoogleCalendarEvent } = await import('@/integrations/google-workspace')
              const tokens = tokenData.google_token as unknown as import('@/integrations/google-workspace').GoogleTokens
              await createGoogleCalendarEvent(tokens, { subject: eventSubject, date: eventDate })
            } else if (tokenData?.outlook_token) {
              const { createCalendarEvent: createOutlookEvent } = await import('@/integrations/microsoft-graph')
              const tokens = tokenData.outlook_token as unknown as import('@/integrations/microsoft-graph').OutlookTokens
              await createOutlookEvent(tokens, { subject: eventSubject, date: eventDate })
            }
          }
        }
      } catch (execErr) {
        console.error(`[Action Approved] Execution failed for ${actionId}:`, execErr)
      }

      // Mark action as executed
      await adminClient
        .from('ai_actions')
        .update({ status: 'executed', executed_at: new Date().toISOString() })
        .eq('id', actionId)

      console.log(`[Action Approved] Executed action ${actionId} (${action.action_type})`)
      break
    }
  }
}
