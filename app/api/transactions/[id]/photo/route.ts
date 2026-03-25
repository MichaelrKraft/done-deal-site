import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Verify agent owns this transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, brokerage_id')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single()

  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Image file required' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image too large. Maximum 10MB.' }, { status: 413 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${transaction.brokerage_id}/${id}/property-photo.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('transaction-documents')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('transaction-documents')
    .getPublicUrl(storagePath)

  const photoUrl = urlData.publicUrl

  await supabase
    .from('transactions')
    .update({ photo_url: photoUrl } as Record<string, unknown>)
    .eq('id', id)

  return NextResponse.json({ photo_url: photoUrl })
}
