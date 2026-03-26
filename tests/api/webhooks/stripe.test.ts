import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock stripe BEFORE importing the route
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/server-admin', () => ({
  createAdminClient: vi.fn(),
}))

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server-admin'

function makeRequest(body: string, sig?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (sig) headers['stripe-signature'] = sig
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers,
  })
}

function mockAdminClient() {
  const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
  const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate })
  vi.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof createAdminClient>)
  return { mockFrom, mockUpdate, mockEq }
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  vi.clearAllMocks()
})

describe('POST /api/webhooks/stripe', () => {
  it('returns 500 when STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET

    const req = makeRequest('{}')
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toMatch(/not configured/i)
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = makeRequest('{}') // no sig
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/missing signature/i)
  })

  it('returns 400 when signature verification fails', async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error('Signature verification failed')
    })

    const req = makeRequest('{}', 'bad_sig')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/invalid signature/i)
  })

  it('updates agent plan and status on subscription.updated', async () => {
    const { mockFrom, mockUpdate, mockEq } = mockAdminClient()

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'active',
          metadata: { agentId: 'agent-abc', plan: 'professional' },
        },
      },
    } as never)

    const req = makeRequest('{}', 'valid_sig')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockFrom).toHaveBeenCalledWith('agents')
    expect(mockUpdate).toHaveBeenCalledWith({
      plan: 'professional',
      subscription_status: 'active',
      stripe_subscription_id: 'sub_123',
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'agent-abc')
  })

  it('returns 200 with received:true for valid events', async () => {
    mockAdminClient()

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_456',
          status: 'trialing',
          metadata: { agentId: 'agent-xyz', plan: 'starter' },
        },
      },
    } as never)

    const req = makeRequest('{}', 'valid_sig')
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })
})
