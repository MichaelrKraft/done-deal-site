import type { TCEventJobData } from '../job-types'

export async function processTCEventJob(data: TCEventJobData): Promise<void> {
  const { event_type, transaction_id, agent_id, payload } = data

  console.log(`[TC Event] ${event_type} for transaction ${transaction_id}`)

  switch (event_type) {
    case 'mec_entered':
      // TODO Phase 2: trigger DeadlineCalculator
      console.log(`[MEC Entered] Transaction ${transaction_id} — Phase 2 will calculate deadlines`)
      break
    case 'document_uploaded':
      // TODO Phase 2: trigger ComplianceChecker
      console.log(`[Doc Uploaded] Transaction ${transaction_id} — Phase 2 stub`)
      break
    case 'stage_changed':
      console.log(`[Stage Changed] Transaction ${transaction_id} — Phase 3 stub`)
      break
    case 'email_received':
      console.log(`[Email Received] Transaction ${transaction_id} — Phase 4 stub`)
      break
    case 'action_approved':
      // TODO Phase 3: execute the approved action
      console.log(`[Action Approved] Transaction ${transaction_id} — Phase 3 stub`)
      break
  }

  // Suppress unused variable warning until Phase 3 uses payload
  void agent_id
  void payload
}
