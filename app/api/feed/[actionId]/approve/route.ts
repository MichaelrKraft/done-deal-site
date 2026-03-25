import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, type OutlookTokens } from '@/integrations/microsoft-graph'
import { sendGmailEmail, createGoogleCalendarEvent, type GoogleTokens } from '@/integrations/google-workspace'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ actionId: string }> }
) {
  const { actionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, outlook_token, google_token, email_provider, calendar_provider')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify action belongs to this agent
  const { data: action } = await supabase
    .from('ai_actions')
    .select('id, agent_id, status, action_type, draft_content')
    .eq('id', actionId)
    .single()

  if (!action) return NextResponse.json({ error: 'Action not found' }, { status: 404 })
  if (action.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (action.status !== 'pending') {
    return NextResponse.json({ error: 'Action is not pending' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('ai_actions')
    .update({
      status: 'executed',
      approved_by: agent.id,
      approved_at: new Date().toISOString(),
      executed_at: new Date().toISOString(),
    })
    .eq('id', actionId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Execute stage updates immediately
  if (action.action_type === 'stage_update') {
    const draft = action.draft_content as { transaction_id?: string; new_stage?: string }
    if (draft.transaction_id && draft.new_stage) {
      await supabase
        .from('transactions')
        .update({ stage: draft.new_stage as 'pre_listing' | 'active_listing' | 'under_contract' | 'pre_closing' | 'closed' | 'archived' })
        .eq('id', draft.transaction_id)
        .eq('agent_id', agent.id)
    }
  }

  // Create calendar events via the agent's configured provider
  if (action.action_type === 'calendar_event') {
    const draft = action.draft_content as { subject?: string; date?: string; description?: string }

    if (draft.subject && draft.date) {
      if (agent.calendar_provider === 'google') {
        const gTokens = agent.google_token as unknown as GoogleTokens | null
        if (gTokens) {
          const result = await createGoogleCalendarEvent(gTokens, {
            subject: draft.subject,
            date: draft.date,
            description: draft.description,
          })
          if (result.refreshedTokens) {
            const admin = createAdminClient()
            await admin
              .from('agents')
              .update({ google_token: result.refreshedTokens as unknown as Record<string, unknown> })
              .eq('id', agent.id)
          }
          if (!result.success) {
            console.warn(`[feed/approve] Google calendar event failed for action ${actionId}: ${result.error}`)
          }
        } else {
          console.warn(`[feed/approve] No Google tokens for agent ${agent.id}, skipping calendar event`)
        }
      } else if (agent.calendar_provider === 'outlook') {
        const oTokens = agent.outlook_token as unknown as OutlookTokens | null
        if (oTokens) {
          const { createCalendarEvent } = await import('@/integrations/microsoft-graph')
          const result = await createCalendarEvent(oTokens, {
            subject: draft.subject,
            date: draft.date,
            description: draft.description,
          })
          if (result.refreshedTokens) {
            const admin = createAdminClient()
            await admin
              .from('agents')
              .update({ outlook_token: result.refreshedTokens as unknown as Record<string, unknown> })
              .eq('id', agent.id)
          }
          if (!result.success) {
            console.warn(`[feed/approve] Outlook calendar event failed for action ${actionId}: ${result.error}`)
          }
        } else {
          console.warn(`[feed/approve] No Outlook tokens for agent ${agent.id}, skipping calendar event`)
        }
      } else {
        console.warn(`[feed/approve] No calendar provider configured for agent ${agent.id}`)
      }
    }
  }

  // Send email via the agent's configured provider
  if (action.action_type === 'email_draft') {
    const draft = action.draft_content as { to?: string; subject?: string; body?: string }

    if (draft.to && draft.subject && draft.body) {
      if (agent.email_provider === 'google') {
        const gTokens = agent.google_token as unknown as GoogleTokens | null
        if (gTokens) {
          const result = await sendGmailEmail(gTokens, {
            to: draft.to,
            subject: draft.subject,
            body: draft.body,
          })
          if (result.refreshedTokens) {
            const admin = createAdminClient()
            await admin
              .from('agents')
              .update({ google_token: result.refreshedTokens as unknown as Record<string, unknown> })
              .eq('id', agent.id)
          }
          if (!result.success) {
            console.warn(`[feed/approve] Gmail send failed for action ${actionId}: ${result.error}`)
          }
        } else {
          console.warn(`[feed/approve] No Google tokens for agent ${agent.id}, skipping email send`)
        }
      } else if (agent.email_provider === 'outlook') {
        const oTokens = agent.outlook_token as unknown as OutlookTokens | null
        if (oTokens) {
          const result = await sendEmail(oTokens, {
            to: draft.to,
            subject: draft.subject,
            body: draft.body,
          })
          if (result.refreshedTokens) {
            const admin = createAdminClient()
            await admin
              .from('agents')
              .update({ outlook_token: result.refreshedTokens as unknown as Record<string, unknown> })
              .eq('id', agent.id)
          }
          if (!result.success) {
            console.warn(`[feed/approve] Outlook email send failed for action ${actionId}: ${result.error}`)
          }
        } else {
          console.warn(`[feed/approve] No Outlook tokens for agent ${agent.id}, skipping email send`)
        }
      } else {
        console.warn(`[feed/approve] No email provider configured for agent ${agent.id}`)
      }
    }
  }

  return NextResponse.json(updated)
}
