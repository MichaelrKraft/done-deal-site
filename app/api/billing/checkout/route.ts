import { createClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  plan: z.enum(['starter', 'professional', 'team']),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, email, name, stripe_customer_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Create Stripe customer if not yet created
  let customerId = agent.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: agent.email ?? user.email,
      name: agent.name,
      metadata: { agentId: agent.id },
    })
    customerId = customer.id
    await supabase.from('agents').update({ stripe_customer_id: customerId }).eq('id', agent.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PLAN_PRICES[parsed.data.plan], quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing`,
    subscription_data: {
      metadata: { agentId: agent.id, plan: parsed.data.plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
