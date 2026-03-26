import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server-admin'
import type Stripe from 'stripe'

type PlanValue = 'trial' | 'starter' | 'professional' | 'team' | 'canceled'
type StatusValue = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

function resolveStatus(sub: Stripe.Subscription): { plan: PlanValue; subscription_status: StatusValue } {
  const VALID_STATUSES: StatusValue[] = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
  const rawStatus = sub.status as string
  const status: StatusValue = VALID_STATUSES.includes(rawStatus as StatusValue) ? (rawStatus as StatusValue) : 'unpaid'
  const rawPlan = sub.metadata?.plan ?? 'starter'
  const plan: PlanValue = status === 'canceled' ? 'canceled' : (rawPlan as PlanValue)
  return { plan, subscription_status: status }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret)
  } catch (err) {
    console.error('[Stripe webhook] Signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const agentId = sub.metadata?.agentId
      if (!agentId) break
      const { plan, subscription_status } = resolveStatus(sub)
      await admin
        .from('agents')
        .update({ plan, subscription_status, stripe_subscription_id: sub.id })
        .eq('id', agentId)
      console.log(`[Stripe webhook] Agent ${agentId}: plan=${plan} status=${subscription_status}`)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (customerId) {
        await admin.from('agents').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
