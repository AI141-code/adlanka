import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getSessionFromCookies } from '@/lib/session'

type Ctx = { params: Promise<{ id: string }> }

function mapAd(a: any) {
  return {
    id: a.id,
    userId: a.user_id,
    category: a.category,
    adType: a.ad_type,
    title: a.title,
    description: a.description,
    price: a.price,
    imageUrl: a.image_url,
    status: a.status,
    createdAt: a.created_at,
    expiresAt: a.expires_at,
  }
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('ads')
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at, users(phone_number)')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ad: mapAd(data), posterPhone: (data as any)?.users?.phone_number ?? null })
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as null | { title?: string; description?: string }
  const updates: Record<string, string> = {}
  if (typeof body?.title === 'string') updates.title = body.title.trim()
  if (typeof body?.description === 'string') updates.description = body.description.trim()
  if (!updates.title && !updates.description) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data: existing, error: existingErr } = await supabase
    .from('ads')
    .select('id,user_id')
    .eq('id', id)
    .single()

  if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 500 })
  if (!session.isAdmin && existing.user_id !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('ads')
    .update(updates)
    .eq('id', id)
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ad: mapAd(data) })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const supabase = createSupabaseServerClient()

  const { data: existing, error: existingErr } = await supabase
    .from('ads')
    .select('id,user_id')
    .eq('id', id)
    .single()

  if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 500 })
  if (!session.isAdmin && existing.user_id !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('ads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

