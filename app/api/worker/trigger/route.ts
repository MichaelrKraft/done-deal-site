import { NextRequest, NextResponse } from 'next/server'
import { eventQueue } from '@/worker/queues'
import type { TCEventJobData, TCEventType } from '@/worker/job-types'

interface TriggerRequestBody {
  event_type: TCEventType
  transaction_id: string
  agent_id: string
  payload?: Record<string, unknown>
}

const VALID_EVENT_TYPES: TCEventType[] = [
  'mec_entered',
  'document_uploaded',
  'stage_changed',
  'email_received',
  'action_approved',
]

// POST /api/worker/trigger
// Used internally when: MEC date set, document uploaded, stage changed, action approved
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_WORKER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: TriggerRequestBody

  try {
    body = (await request.json()) as TriggerRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { event_type, transaction_id, agent_id, payload } = body

  if (!event_type || !transaction_id || !agent_id) {
    return NextResponse.json(
      { error: 'Missing required fields: event_type, transaction_id, agent_id' },
      { status: 400 }
    )
  }

  if (!VALID_EVENT_TYPES.includes(event_type)) {
    return NextResponse.json({ error: `Unknown event_type: ${event_type}` }, { status: 400 })
  }

  const jobData: TCEventJobData = {
    agent_id,
    transaction_id,
    event_type,
    payload,
  }

  // BullMQ Queue.add() name is the job display name — use event_type as the name
  const job = await eventQueue.add(event_type, jobData)

  return NextResponse.json({ job_id: job.id, status: 'queued' }, { status: 202 })
}
