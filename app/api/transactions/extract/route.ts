import { extractContractData } from '@/lib/pdf-extractor'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 20MB.' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Verify PDF magic bytes (%PDF)
  if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== '%PDF') {
    return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 })
  }
  const extracted = await extractContractData(buffer)

  return NextResponse.json({ extracted })
}
