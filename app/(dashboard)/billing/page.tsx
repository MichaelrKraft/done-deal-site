import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('plan, subscription_status, trial_ends_at, stripe_customer_id')
    .eq('auth_user_id', user.id)
    .single()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-[#2c2420]">Billing</h1>
        <p className="text-sm text-[#7a6e63] mt-1">Manage your Done Deal subscription</p>
      </div>
      <BillingClient agent={agent} />
    </div>
  )
}
