import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

// Mock supabase admin client before importing the route
vi.mock('@/lib/supabase/server-admin', () => ({
  createAdminClient: vi.fn(),
}))

import { POST } from '@/app/api/webhooks/docusign/route'
import { createAdminClient } from '@/lib/supabase/server-admin'

const TEST_SECRET = 'test-hmac-secret'

function makeSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
}

function makeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/docusign', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  })
}

function mockAdminClient(singleResult: { data: unknown; error: unknown }) {
  const mockSingle = vi.fn().mockResolvedValue(singleResult)
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
  const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
  const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate })
  vi.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof createAdminClient>)
}

beforeEach(() => {
  process.env.DOCUSIGN_WEBHOOK_HMAC_SECRET = TEST_SECRET
  vi.clearAllMocks()
})

describe('POST /api/webhooks/docusign', () => {
  it('returns 401 when x-docusign-signature-1 header is missing', async () => {
    const body = JSON.stringify({ status: 'completed', envelopeId: 'env-123' })
    const req = makeRequest(body) // no signature header
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toMatch(/missing signature/i)
  })

  it('returns 401 when HMAC signature is invalid', async () => {
    const body = JSON.stringify({ status: 'completed', envelopeId: 'env-123' })
    const req = makeRequest(body, { 'x-docusign-signature-1': 'bad-signature' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toMatch(/invalid signature/i)
  })

  it('returns 200 with ok:true and found:false for unknown envelope ID', async () => {
    // DB returns no document
    mockAdminClient({ data: null, error: { message: 'no rows' } })

    const body = JSON.stringify({ status: 'completed', envelopeId: 'env-unknown' })
    const sig = makeSignature(body, TEST_SECRET)
    const req = makeRequest(body, { 'x-docusign-signature-1': sig })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.found).toBe(false)
  })

  it('returns 200 with esignStatus "signed" for completed envelope', async () => {
    mockAdminClient({ data: { id: 'doc-abc', transaction_id: 'txn-1' }, error: null })

    const body = JSON.stringify({ status: 'completed', envelopeId: 'env-done' })
    const sig = makeSignature(body, TEST_SECRET)
    const req = makeRequest(body, { 'x-docusign-signature-1': sig })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.documentId).toBe('doc-abc')
    // CRITICAL: must be esignStatus, NOT status
    expect(json.esignStatus).toBe('signed')
    expect(json.status).toBeUndefined()
  })

  it('returns 200 with esignStatus "declined" for declined envelope', async () => {
    mockAdminClient({ data: { id: 'doc-xyz', transaction_id: 'txn-2' }, error: null })

    const body = JSON.stringify({ status: 'declined', envelopeId: 'env-declined' })
    const sig = makeSignature(body, TEST_SECRET)
    const req = makeRequest(body, { 'x-docusign-signature-1': sig })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.documentId).toBe('doc-xyz')
    expect(json.esignStatus).toBe('declined')
  })

  it('returns 200 with esignStatus "voided" for voided envelope', async () => {
    mockAdminClient({ data: { id: 'doc-void', transaction_id: 'txn-3' }, error: null })

    const body = JSON.stringify({ status: 'voided', envelopeId: 'env-voided' })
    const sig = makeSignature(body, TEST_SECRET)
    const req = makeRequest(body, { 'x-docusign-signature-1': sig })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.esignStatus).toBe('voided')
  })

  it('returns 200 with ignored:true for untracked envelope status (e.g. "sent")', async () => {
    const body = JSON.stringify({ status: 'sent', envelopeId: 'env-sent' })
    const sig = makeSignature(body, TEST_SECRET)
    const req = makeRequest(body, { 'x-docusign-signature-1': sig })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.ignored).toBe(true)
  })

  it('returns 500 when DOCUSIGN_WEBHOOK_HMAC_SECRET is not configured', async () => {
    delete process.env.DOCUSIGN_WEBHOOK_HMAC_SECRET

    const body = JSON.stringify({ status: 'completed', envelopeId: 'env-123' })
    const req = makeRequest(body)

    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
