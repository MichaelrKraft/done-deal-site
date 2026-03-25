'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Inbox,
  LayoutDashboard,
  Calendar,
  FileText,
  Plus,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { label: 'Feed', href: '/feed', icon: Inbox },
  { label: 'Board', href: '/board', icon: LayoutDashboard },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Transactions', href: '/transactions', icon: FileText },
  { label: 'New', href: '/transactions/new', icon: Plus },
  { label: 'Resources', href: '/resources', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-sd-bg">
      {/* Fixed left sidebar — 56px wide */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-sd-border bg-sd-bg-warm py-4">
        {/* Logo */}
        <Link href="/feed" className="mb-6 flex h-9 w-9 items-center justify-center">
          <Image src="/done-deal-flower.png" alt="Done Deal" width={36} height={36} />
        </Link>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[rgba(199,92,46,0.08)] text-[#c75c2e]'
                    : 'text-sd-text-secondary hover:bg-sd-border-subtle hover:text-sd-text'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c75c2e]" />
                )}
                <Icon size={18} />
              </Link>
            )
          })}
        </nav>

        {/* Sign out at bottom */}
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sd-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
          </button>
        </form>
      </aside>

      {/* Main content — offset for sidebar */}
      <main className="pl-14">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
