import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('ads')
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ads = (data || []).map((a) => ({
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
  }))

  return NextResponse.json({ ads })
}

