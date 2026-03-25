'use client'

import { useState } from 'react'
import type { TeamRole } from '@/types/database'

const ROLE_BADGE_COLORS: Record<TeamRole, string> = {
  assistant: 'bg-blue-50 text-blue-700',
  team_lead: 'bg-purple-50 text-purple-700',
  tc: 'bg-amber-50 text-amber-700',
  broker: 'bg-emerald-50 text-emerald-700',
}

const ROLE_LABELS: Record<TeamRole, string> = {
  assistant: 'Assistant',
  team_lead: 'Team Lead',
  tc: 'TC',
  broker: 'Broker',
}

const VALID_ROLES: TeamRole[] = ['assistant', 'team_lead', 'tc', 'broker']

interface TeamMember {
  id: string
  member_id: string
  role: TeamRole
  name: string
  email: string
  created_at: string
}

interface TeamMemberCardProps {
  member: TeamMember
  onRemove: (id: string) => void
  onRoleChange: (id: string, role: TeamRole) => void
}

export default function TeamMemberCard({ member, onRemove, onRoleChange }: TeamMemberCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar circle */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(132,201,209,0.15)] text-sm font-medium text-[#84c9d1]">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#2c2420] truncate">{member.name}</p>
          <p className="text-xs text-[#b0a698] truncate">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <select
            value={member.role}
            onChange={(e) => {
              onRoleChange(member.id, e.target.value as TeamRole)
              setIsEditing(false)
            }}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="rounded-lg border border-[#e8e2d9] bg-white px-2 py-1 text-xs text-[#2c2420] focus:border-[#84c9d1] focus:outline-none focus:ring-1 focus:ring-[#84c9d1]"
          >
            {VALID_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${ROLE_BADGE_COLORS[member.role]}`}
            title="Click to change role"
          >
            {ROLE_LABELS[member.role]}
          </button>
        )}

        {confirmRemove ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRemove(member.id)}
              className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="rounded-lg border border-[#e8e2d9] px-2 py-1 text-xs text-[#7a6e63] hover:bg-[#f5f0ea] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmRemove(true)}
            className="rounded-lg p-1.5 text-[#b0a698] hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Remove team member"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
