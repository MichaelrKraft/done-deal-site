import { defineTool } from './types'
import type { TCToolResult } from './types'

export const calendarEventDefinition = defineTool(
  'create_calendar_event',
  'Add a deadline or important date to the agent\'s Outlook calendar. Use for closing dates, inspection deadlines, earnest money due dates, and other key contract dates.',
  {
    type: 'object',
    properties: {
      transaction_id: {
        type: 'string',
        description: 'The UUID of the related transaction',
      },
      subject: {
        type: 'string',
        description: 'Calendar event title (e.g., "Inspection Deadline - 123 Main St")',
      },
      date: {
        type: 'string',
        description: 'Event date in YYYY-MM-DD format',
      },
      description: {
        type: 'string',
        description: 'Event description with relevant details',
      },
    },
    required: ['transaction_id', 'subject', 'date'],
  }
)

interface CalendarEventInput {
  transaction_id: string
  subject: string
  date: string
  description?: string
}

export function executeCalendarEvent(input: unknown): TCToolResult {
  const { transaction_id, subject, date, description } = input as CalendarEventInput

  return {
    success: true,
    summary: `Calendar event created: "${subject}" on ${date}`,
    actionType: 'calendar_event',
    draftContent: {
      transaction_id,
      subject,
      date,
      description: description ?? '',
    },
  }
}
