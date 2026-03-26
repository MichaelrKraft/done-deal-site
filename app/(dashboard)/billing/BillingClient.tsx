'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49/mo',
    features: ['10 active transactions', '1 agent', 'AI TC assistant', 'Email + calendar integration'],
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99/mo',
    features: ['Unlimited transactions', '1 agent', 'Everything in Starter', 'DocuSign integration', 'Client portal'],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$199/mo',
    features: ['Unlimited transactions', '5 agents', 'Everything in Professional', 'Team collaboration', 'Analytics'],
    highlighted: false,
  },
]

interface AgentBilling {
  plan: string
  subscription_status: string
  trial_ends_at: string | null
  stripe_customer_id: string | null
}

export default function BillingClient({ agent }: { agent: AgentBilling | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const isTrialing = agent?.subscription_status === 'trialing'
  const isActive = agent?.subscription_status === 'active'
  const isPastDue = agent?.subscription_status === 'past_due'
  const isCanceled = agent?.subscription_status === 'canceled'

  const trialEnds = agent?.trial_ends_at
    ? new Date(agent.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  async function handleChoosePlan(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) router.push(data.url)
    } finally {
      setLoading(null)
    }
  }

  async function handleManageBilling() {
    setLoading('portal')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json() as { url?: string }
      if (data.url) router.push(data.url)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {isPastDue && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">Payment failed</p>
          <p className="text-xs text-red-700 mt-1">Update your payment method to restore access.</p>
          <button
            onClick={handleManageBilling}
            disabled={loading === 'portal'}
            className="mt-2 text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading === 'portal' ? 'Loading...' : 'Update payment method'}
          </button>
        </div>
      )}

      {isActive && (
        <div className="flex items-center justify-between rounded-xl border border-[#e8e2d9] bg-white px-4 py-3">
          <div>
            <span className="text-sm font-semibold text-[#2c2420] capitalize">{agent?.plan} plan</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={loading === 'portal'}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#e8e2d9] text-[#7a6e63] hover:bg-[#f5f0ea] disabled:opacity-50"
          >
            {loading === 'portal' ? 'Loading...' : 'Manage subscription'}
          </button>
        </div>
      )}

      {isTrialing && trialEnds && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm text-blue-800">
            Free trial active — ends <strong>{trialEnds}</strong>. Choose a plan to continue after your trial.
          </p>
        </div>
      )}

      {(isTrialing || isCanceled || !isActive) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 space-y-4 ${
                plan.highlighted
                  ? 'border-[#84c9d1] bg-[#84c9d1]/5'
                  : 'border-[#e8e2d9] bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#2c2420]">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#84c9d1] text-white">Popular</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-[#2c2420] mt-1">{plan.price}</p>
              </div>
              <ul className="space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-[#7a6e63] flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={!!loading}
                className={`w-full py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  plan.highlighted
                    ? 'bg-[#84c9d1] text-white hover:bg-[#6fb8c0]'
                    : 'border border-[#e8e2d9] text-[#2c2420] hover:bg-[#f5f0ea]'
                }`}
              >
                {loading === plan.id ? 'Loading...' : 'Choose plan'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
