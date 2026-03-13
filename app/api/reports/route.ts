import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { adId?: string; reason?: string }
  const adId = body?.adId?.trim()
  const reason = body?.reason?.trim()

  if (!adId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('reports')
    .insert({ ad_id: adId, reason })
    .select('id,ad_id,reason,created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    report: { id: data.id, adId: data.ad_id, reason: data.reason, createdAt: data.created_at },
  })
}

