import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const defaultName = (user.user_metadata?.name as string | undefined) ?? ''

  return (
    <div className="min-h-screen bg-sd-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Image src="/done-deal-logo.png" alt="Done Deal" width={160} height={160} className="mx-auto" priority />
        <p className="mt-1 text-sm text-sd-text-secondary">Set up your AI transaction coordinator</p>
      </div>
      <OnboardingWizard defaultName={defaultName} />
    </div>
  )
}
