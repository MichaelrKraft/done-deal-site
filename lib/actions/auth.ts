'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

interface AuthResult {
  error: string | null
  needsConfirmation?: boolean
}

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function signUp(formData: FormData): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const { name, email, password } = parsed.data

  const supabase = await createClient()

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

  // Email confirmation enabled in Supabase → session is null until confirmed
  if (!data.session) {
    return { error: null, needsConfirmation: true }
  }

  return { error: null }
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const { email, password } = parsed.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function requestPasswordReset(
  formData: FormData
): Promise<{ error: string | null; sent: boolean }> {
  const emailParse = z.string().email().safeParse(formData.get('email'))
  if (!emailParse.success) return { error: 'Enter a valid email address', sent: false }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    await supabase.auth.resetPasswordForEmail(emailParse.data, {
      redirectTo: `${origin}/reset-password`,
    })
  } catch {
    return { error: 'Something went wrong. Please try again.', sent: false }
  }

  // Supabase always returns success regardless of whether email exists (security best practice)
  return { error: null, sent: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
