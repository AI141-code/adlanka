import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('id,ad_id,reason,created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const reports = (data || []).map((r) => ({
    id: r.id,
    adId: r.ad_id,
    reason: r.reason,
    createdAt: r.created_at,
  }))

  return NextResponse.json({ reports })
}

export async function DELETE(req: Request) {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as null | { reportId?: string }
  const reportId = body?.reportId?.trim()
  if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('reports').delete().eq('id', reportId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

