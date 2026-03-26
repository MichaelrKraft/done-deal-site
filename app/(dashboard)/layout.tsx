'use client'

import { useState, useEffect } from 'react'
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
  BarChart3,
  Users,
  Settings,
  CreditCard,
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
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/billing', icon: CreditCard },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <div className="min-h-screen bg-sd-bg">
      {/* Fixed left sidebar — 56px wide */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-56 lg:w-14 flex-col items-center border-r border-sd-border bg-sd-bg-warm py-4 transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <Link href="/feed" className="group relative mb-6 flex h-9 w-9 items-center justify-center">
          <Image src="/done-deal-flower.png" alt="Done Deal" width={36} height={36} />
          <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-[#2c2420] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Done Deal
          </span>
        </Link>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:w-10 ${
                  isActive
                    ? 'bg-[rgba(132,201,209,0.1)] text-[#84c9d1]'
                    : 'text-sd-text-secondary hover:bg-sd-border-subtle hover:text-sd-text'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#84c9d1]" />
                )}
                <Icon size={18} />
                <span className="lg:hidden ml-3 text-sm font-medium">{item.label}</span>
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-[#2c2420] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out at bottom */}
        <form action={signOut}>
          <button
            type="submit"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-sd-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-[#2c2420] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Sign out
            </span>
          </button>
        </form>
      </aside>

      {/* Main content — offset for sidebar */}
      <main className="lg:pl-14">
        <div className="flex items-center gap-3 px-4 py-3 lg:hidden border-b border-sd-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-sd-border text-sd-text-secondary hover:bg-sd-border-subtle"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <Image src="/done-deal-skinny-text.png" alt="Done Deal" width={100} height={28} className="h-7 w-auto" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
