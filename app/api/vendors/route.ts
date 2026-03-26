import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PreferredVendor, VendorCategory } from '@/types/database'

const VALID_CATEGORIES: VendorCategory[] = ['title', 'lender', 'inspector', 'attorney', 'hoa']

function isVendorCategory(value: string): value is VendorCategory {
  return (VALID_CATEGORIES as string[]).includes(value)
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')?.toLowerCase() ?? ''

  let query = supabase
    .from('preferred_vendors')
    .select('*')
    .eq('agent_id', agent.id)
    .order('name', { ascending: true })

  if (category && isVendorCategory(category)) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const vendors = (data ?? []) as PreferredVendor[]
  const filtered = q
    ? vendors.filter((v) =>
        v.name.toLowerCase().includes(q) ||
        (v.company ?? '').toLowerCase().includes(q)
      )
    : vendors

  return NextResponse.json({ vendors: filtered })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body = await request.json() as {
    category: string
    name: string
    company?: string
    email?: string
    phone?: string
    notes?: string
    is_brokerage_shared?: boolean
  }

  if (!body.category || !body.name) {
    return NextResponse.json({ error: 'category and name are required' }, { status: 400 })
  }

  if (!isVendorCategory(body.category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const { data: vendor, error } = await supabase
    .from('preferred_vendors')
    .insert({
      agent_id: agent.id,
      category: body.category,
      name: body.name,
      company: body.company ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      notes: body.notes ?? null,
      is_brokerage_shared: body.is_brokerage_shared ?? false,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor }, { status: 201 })
}
