'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import TeamMemberCard from '@/components/team/TeamMemberCard'
import type { TeamRole } from '@/types/database'

interface TeamMember {
  id: string
  member_id: string
  role: TeamRole
  name: string
  email: string
  created_at: string
}

const VALID_ROLES: TeamRole[] = ['assistant', 'team_lead', 'tc', 'broker']

const ROLE_LABELS: Record<TeamRole, string> = {
  assistant: 'Assistant',
  team_lead: 'Team Lead',
  tc: 'TC',
  broker: 'Broker',
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('assistant')
  const [inviting, setInviting] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)

  const fetchMembers = useCallback(async () => {
    const res = await fetch('/api/team')
    if (!res.ok) {
      setError('Failed to load team members')
      setLoading(false)
      return
    }
    const data = await res.json() as { members: TeamMember[] }
    setMembers(data.members)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInviting(true)

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })

    if (!res.ok) {
      const data = await res.json() as { error: string }
      setError(data.error)
      setInviting(false)
      return
    }

    setInviteEmail('')
    setShowInviteForm(false)
    setInviting(false)
    await fetchMembers()
  }

  async function handleRemove(membershipId: string) {
    const res = await fetch(`/api/team/${membershipId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json() as { error: string }
      setError(data.error)
      return
    }
    setMembers((prev) => prev.filter((m) => m.id !== membershipId))
  }

  async function handleRoleChange(membershipId: string, role: TeamRole) {
    const res = await fetch(`/api/team/${membershipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const data = await res.json() as { error: string }
      setError(data.error)
      return
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, role } : m))
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(132,201,209,0.12)]">
            <Users size={20} className="text-[#84c9d1]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#2c2420]">Team</h1>
            <p className="text-sm text-[#7a6e63] mt-0.5">
              Manage who can access your transactions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#84c9d1] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#6fb8c0] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Invite form */}
      {showInviteForm && (
        <form onSubmit={handleInvite} className="rounded-2xl border border-[#e8e2d9] bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#2c2420]">Invite Team Member</h3>
          <p className="text-xs text-[#b0a698]">
            The person must already have a Done Deal account.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="team@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1 rounded-lg border border-[#e8e2d9] bg-white px-3 py-2 text-sm text-[#2c2420] placeholder:text-[#b0a698] focus:border-[#84c9d1] focus:outline-none focus:ring-1 focus:ring-[#84c9d1]"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              className="rounded-lg border border-[#e8e2d9] bg-white px-3 py-2 text-sm text-[#2c2420] focus:border-[#84c9d1] focus:outline-none focus:ring-1 focus:ring-[#84c9d1]"
            >
              {VALID_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="rounded-lg border border-[#e8e2d9] px-3 py-1.5 text-sm text-[#7a6e63] hover:bg-[#f5f0ea] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className="rounded-lg bg-[#84c9d1] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#6fb8c0] transition-colors disabled:opacity-50"
            >
              {inviting ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </form>
      )}

      {/* Team members list */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-[#2c2420]">
            Members {!loading && `(${members.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-8 text-center text-sm text-[#b0a698]">
            Loading team...
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-8 text-center">
            <p className="text-sm text-[#7a6e63]">No team members yet</p>
            <p className="text-xs text-[#b0a698] mt-1">
              Invite assistants, team leads, or TCs to collaborate on your transactions.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onRemove={handleRemove}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
