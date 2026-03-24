import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { label: 'Feed', href: '/feed' },
  { label: 'Board', href: '/board' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Settings', href: '/settings' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/feed" className="text-sm font-semibold text-white">
              Done Deal
            </Link>
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
