import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('ads')
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at')
    .eq('status', 'approved')
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const typeOrder: Record<string, number> = { vip: 0, super: 1, normal: 2 }
  const ads = (data || [])
    .map((a) => ({
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
    .sort((a, b) => (typeOrder[a.adType] ?? 99) - (typeOrder[b.adType] ?? 99))

  return NextResponse.json({ ads })
}

