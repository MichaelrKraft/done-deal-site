import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mock @/lib/supabase/server before importing routes ──────────────────────
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { GET, POST } from '@/app/api/vendors/route'
import { DELETE } from '@/app/api/vendors/[id]/route'
import { createClient } from '@/lib/supabase/server'

// ── Test data ───────────────────────────────────────────────────────────────
const MOCK_USER = { id: 'auth-user-1' }
const MOCK_AGENT = { id: 'agent-1' }
const MOCK_VENDORS = [
  { id: 'v1', agent_id: 'agent-1', category: 'title', name: 'Alpha Title', company: 'Alpha Co', email: null, phone: null, notes: null, is_brokerage_shared: false },
  { id: 'v2', agent_id: 'agent-1', category: 'lender', name: 'Beta Lending', company: null, email: null, phone: null, notes: null, is_brokerage_shared: false },
  { id: 'v3', agent_id: 'agent-1', category: 'title', name: 'Gamma Title', company: 'Gamma LLC', email: null, phone: null, notes: null, is_brokerage_shared: false },
]

// ── Helper to build a chainable Supabase mock ───────────────────────────────

type MockResolvedValue = { data: unknown; error: unknown }

/**
 * Builds a mock Supabase client where `.from(table)` returns a chainable
 * object. Each table gets its own chain configuration.
 *
 * The chains support: select, insert, delete, eq, order, single
 */
function buildMockSupabase(
  tableConfigs: Record<string, { resolved: MockResolvedValue; secondResolved?: MockResolvedValue }>
) {
  // Track call counts per table to support multiple queries to the same table
  const callCounts: Record<string, number> = {}

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (!callCounts[table]) callCounts[table] = 0
    callCounts[table]++

    const config = tableConfigs[table]
    if (!config) throw new Error(`No mock config for table: ${table}`)

    // Use secondResolved for the 2nd call to the same table (e.g., DELETE route
    // queries preferred_vendors twice: first for IDOR check, then for delete)
    const useSecond = callCounts[table] > 1 && config.secondResolved
    const resolved = useSecond ? config.secondResolved! : config.resolved

    // Build a fully chainable object that returns itself for any method,
    // and resolves the configured value when awaited (via .then or single/order)
    const chain: Record<string, unknown> = {}
    const self = () => chain

    chain.select = vi.fn().mockReturnValue(chain)
    chain.insert = vi.fn().mockReturnValue(chain)
    chain.delete = vi.fn().mockReturnValue(chain)
    chain.eq = vi.fn().mockReturnValue(chain)
    chain.order = vi.fn().mockReturnValue(chain)
    chain.single = vi.fn().mockResolvedValue(resolved)
    // Make the chain itself thenable so `await query` works (e.g., after .order().eq())
    chain.then = (resolve: (v: unknown) => void) => Promise.resolve(resolved).then(resolve)

    return chain
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: MOCK_USER } }),
    },
    from: mockFrom,
  }
}

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/vendors', () => {
  it('returns vendors list', async () => {
    const supabase = buildMockSupabase({
      agents: { resolved: { data: MOCK_AGENT, error: null } },
      preferred_vendors: { resolved: { data: MOCK_VENDORS, error: null } },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const req = new NextRequest('http://localhost/api/vendors')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.vendors).toHaveLength(3)
    expect(json.vendors[0].name).toBe('Alpha Title')
  })

  it('returns vendors filtered by category', async () => {
    // Only return title vendors when category filter is applied
    const titleVendors = MOCK_VENDORS.filter((v) => v.category === 'title')
    const supabase = buildMockSupabase({
      agents: { resolved: { data: MOCK_AGENT, error: null } },
      preferred_vendors: { resolved: { data: titleVendors, error: null } },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const req = new NextRequest('http://localhost/api/vendors?category=title')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.vendors).toHaveLength(2)
    expect(json.vendors.every((v: { category: string }) => v.category === 'title')).toBe(true)

    // Verify the eq('category', 'title') was called on the chain
    const fromCall = supabase.from.mock.results.find(
      (_: unknown, i: number) => supabase.from.mock.calls[i][0] === 'preferred_vendors'
    )
    if (fromCall) {
      const chain = fromCall.value
      expect(chain.eq).toHaveBeenCalledWith('category', 'title')
    }
  })
})

describe('POST /api/vendors', () => {
  it('creates vendor with agent ID and returns 201', async () => {
    const newVendor = {
      id: 'v-new',
      agent_id: 'agent-1',
      category: 'inspector',
      name: 'Delta Inspections',
      company: 'Delta LLC',
      email: null,
      phone: null,
      notes: null,
      is_brokerage_shared: false,
    }
    const supabase = buildMockSupabase({
      agents: { resolved: { data: MOCK_AGENT, error: null } },
      preferred_vendors: { resolved: { data: newVendor, error: null } },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const req = new NextRequest('http://localhost/api/vendors', {
      method: 'POST',
      body: JSON.stringify({ category: 'inspector', name: 'Delta Inspections', company: 'Delta LLC' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.vendor.name).toBe('Delta Inspections')
    expect(json.vendor.agent_id).toBe('agent-1')

    // Verify insert was called with agent_id from the authenticated agent
    const vendorFromCall = supabase.from.mock.results.find(
      (_: unknown, i: number) => supabase.from.mock.calls[i][0] === 'preferred_vendors'
    )
    if (vendorFromCall) {
      const chain = vendorFromCall.value
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ agent_id: 'agent-1', category: 'inspector', name: 'Delta Inspections' })
      )
    }
  })
})

describe('DELETE /api/vendors/[id]', () => {
  it('succeeds for own vendor', async () => {
    const supabase = buildMockSupabase({
      agents: { resolved: { data: MOCK_AGENT, error: null } },
      preferred_vendors: {
        // First call: IDOR check — vendor found (belongs to agent)
        resolved: { data: { id: 'v1' }, error: null },
        // Second call: actual delete — success
        secondResolved: { data: null, error: null },
      },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const req = new NextRequest('http://localhost/api/vendors/v1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'v1' }) })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 404 (IDOR protection) when vendor belongs to different agent', async () => {
    const supabase = buildMockSupabase({
      agents: { resolved: { data: MOCK_AGENT, error: null } },
      preferred_vendors: {
        // IDOR check: vendor NOT found because agent_id doesn't match
        resolved: { data: null, error: { message: 'no rows', code: 'PGRST116' } },
      },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const req = new NextRequest('http://localhost/api/vendors/v-other-agent', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'v-other-agent' }) })

    // The route returns 404 because the .eq('agent_id', agent.id) query returns no row
    // This is the IDOR protection — an agent cannot even confirm another agent's vendor exists
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Vendor not found')
  })
})
