'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface AuthResult {
  error: string | null
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create agent record linked to the auth user
    // Default brokerage_id for Your Castle agents — looked up at onboarding step 1
    // We defer full agent creation to onboarding Step 1 where brokerage is confirmed
    // Store name in user metadata for onboarding prefill
  }

  return { error: null }
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
