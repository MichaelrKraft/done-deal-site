import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailTemplateCategory } from '@/types/database'

interface SeedTemplate {
  name: string
  category: EmailTemplateCategory
  subject: string
  body: string
  variables: string[]
}

const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: 'Under Contract Introduction',
    category: 'under_contract',
    subject: 'Under Contract — {{property_address}}',
    body: `Hi everyone,

I'm reaching out to introduce myself as the transaction coordinator for {{property_address}}. Congratulations on going under contract!

Here are the key dates for this transaction:
- MEC Date: {{mec_date}}
- Closing Date: {{closing_date}}
- Inspection Deadline: {{inspection_deadline}}

Please send any executed documents to me at your earliest convenience. Per Your Castle policy, all executed contracts must be submitted within 5 business days of execution.

I'll be sending reminders as deadlines approach. Please don't hesitate to reach out if you have any questions.

Best regards,
{{agent_name}}`,
    variables: ['property_address', 'mec_date', 'closing_date', 'inspection_deadline', 'agent_name'],
  },
  {
    name: 'Earnest Money Reminder',
    category: 'under_contract',
    subject: 'Earnest Money Due — {{property_address}}',
    body: `Hi {{buyer_name}},

This is a friendly reminder that earnest money for {{property_address}} is due soon.

Amount: {{earnest_money}}
Title Company: {{title_company}}

Please ensure the earnest money is delivered to the title company by the deadline. Once deposited, please send me a copy of the CREC Receipt for Earnest Money.

Thank you,
{{agent_name}}`,
    variables: ['buyer_name', 'property_address', 'earnest_money', 'title_company', 'agent_name'],
  },
  {
    name: 'Inspection Deadline Approaching',
    category: 'pre_closing',
    subject: 'Inspection Deadline Approaching — {{property_address}}',
    body: `Hi {{buyer_name}},

The inspection deadline for {{property_address}} is approaching on {{inspection_deadline}}.

Please ensure the following are completed before the deadline:
- Home inspection report reviewed
- Inspection objection submitted (if applicable)
- Radon test results received (if applicable)

If no objection is filed by the deadline, the buyer accepts the property in its current condition per the contract terms.

Please let me know if you have any questions.

Best regards,
{{agent_name}}`,
    variables: ['buyer_name', 'property_address', 'inspection_deadline', 'agent_name'],
  },
  {
    name: 'Closing Preparation',
    category: 'pre_closing',
    subject: 'Closing Preparation — {{property_address}}',
    body: `Hi everyone,

We are approaching closing for {{property_address}} on {{closing_date}}. Here's what we need to finalize:

IMPORTANT — Wire Fraud Warning:
Please verify all wiring instructions by calling the title company directly using a known phone number. Never wire funds based solely on email instructions.

Pre-closing checklist:
- Final walkthrough scheduled
- All contract documents submitted to Your Castle (documents@yourcastle.org)
- Settlement statements reviewed and approved
- Government-issued ID ready for closing

Title Company: {{title_company}}
Closing Date: {{closing_date}}

Please reach out with any questions or concerns.

Best regards,
{{agent_name}}`,
    variables: ['property_address', 'closing_date', 'title_company', 'agent_name'],
  },
  {
    name: 'Post-Close Follow Up',
    category: 'post_close',
    subject: 'Congratulations on Closing — {{property_address}}',
    body: `Hi {{buyer_name}},

Congratulations on the successful closing of {{property_address}}! It was a pleasure working with everyone on this transaction.

A few final items:
- All closing documents have been submitted to Your Castle
- Commission disbursement has been authorized
- MLS status has been updated to Closed

If you need any documents from the transaction file in the future, please don't hesitate to reach out.

Thank you for your business, and I hope to work with you again soon!

Best regards,
{{agent_name}}`,
    variables: ['buyer_name', 'property_address', 'agent_name'],
  },
]

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Check if agent already has templates (prevent double-seeding)
  const { count } = await supabase
    .from('email_templates')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)

  if (count && count > 0) {
    return NextResponse.json({ error: 'Templates already exist' }, { status: 409 })
  }

  const toInsert = SEED_TEMPLATES.map((t) => ({
    agent_id: agent.id,
    brokerage_id: agent.brokerage_id,
    name: t.name,
    category: t.category,
    subject: t.subject,
    body: t.body,
    variables: t.variables,
    is_shared: false,
  }))

  const { data: created, error } = await supabase
    .from('email_templates')
    .insert(toInsert)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ templates: created }, { status: 201 })
}
