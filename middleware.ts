import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must not be removed
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — skip auth entirely
  if (pathname.startsWith('/portal')) {
    return supabaseResponse
  }

  const isDashboardRoute =
    pathname.startsWith('/feed') ||
    pathname.startsWith('/board') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings')

  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const isProtectedRoute = isDashboardRoute || isOnboardingRoute
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // If authenticated user hasn't completed onboarding (no agent row yet),
  // redirect dashboard routes to /onboarding. Uses user metadata — no DB query.
  if (user && isDashboardRoute) {
    const agentCreated = (user.user_metadata as Record<string, unknown>)?.agent_created === true
    if (!agentCreated) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Subscription gating — block expired trials and canceled subscriptions from dashboard routes
  const isBillingRoute = pathname.startsWith('/billing')
  const isSettingsRoute = pathname.startsWith('/settings')
  const isGatedRoute = isDashboardRoute && !isBillingRoute && !isSettingsRoute

  if (user && isGatedRoute) {
    const { data: agentBilling } = await supabase
      .from('agents')
      .select('subscription_status, trial_ends_at')
      .eq('auth_user_id', user.id)
      .single()

    if (agentBilling) {
      const trialExpired =
        agentBilling.subscription_status === 'trialing' &&
        agentBilling.trial_ends_at != null &&
        new Date(agentBilling.trial_ends_at) < new Date()

      const blocked =
        agentBilling.subscription_status === 'canceled' ||
        agentBilling.subscription_status === 'unpaid' ||
        trialExpired

      if (blocked) {
        return NextResponse.redirect(new URL('/billing', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
