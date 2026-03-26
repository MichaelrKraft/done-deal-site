'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupFormValues) {
    setServerError(null)
    setSubmittedEmail(values.email)
    try {
      const formData = new FormData()
      formData.set('name', values.name)
      formData.set('email', values.email)
      formData.set('password', values.password)

      const result = await signUp(formData)
      if (result.error) {
        setServerError(result.error)
        return
      }
      if (result.needsConfirmation) {
        setAwaitingConfirmation(true)
        return
      }
      router.push('/onboarding')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setServerError(`Connection error: ${message}. Check that the server is running.`)
    }
  }

  if (awaitingConfirmation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Image src="/done-deal-skinny-text.png" alt="Done Deal" width={180} height={180} className="mx-auto" priority />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{submittedEmail}</strong>.
            Click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-sd-text-secondary text-center">
            Didn&apos;t receive it? Check your spam folder, or{' '}
            <button
              onClick={() => setAwaitingConfirmation(false)}
              className="text-[#84c9d1] hover:text-[#6fb8c0] font-medium"
            >
              try a different email
            </button>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <Image src="/done-deal-skinny-text.png" alt="Done Deal" width={180} height={180} className="mx-auto" priority />
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Get your AI transaction coordinator set up in 5 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@yourcastle.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-sd-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-[#84c9d1] hover:text-[#6fb8c0] font-medium">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
