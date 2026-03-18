import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { AD_DURATIONS, AD_PRICES, AdType, Category } from '@/lib/types'

export async function POST(req: Request) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.isAdmin) return NextResponse.json({ error: 'Admins cannot post ads' }, { status: 403 })

  const body = (await req.json().catch(() => null)) as null | {
    category?: Category
    adType?: AdType
    title?: string
    description?: string
    imageUrl?: string | null
  }

  const category = body?.category
  const adType = body?.adType
  const title = body?.title?.trim()
  const description = body?.description?.trim()
  const imageUrl = body?.imageUrl ?? null

  if (!category || !adType || !title || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const price = AD_PRICES[adType]
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + AD_DURATIONS[adType])

  const supabase = createSupabaseServerClient()

  // --- NEW BALANCE LOCK LOGIC START ---
  
  // 1. Fetch user balance
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id,balance')
    .eq('id', session.userId)
    .single()

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })

  // 2. Fetch costs of all ads currently waiting for admin approval
  const { data: pendingAds, error: pendingErr } = await supabase
    .from('ads')
    .select('price')
    .eq('user_id', session.userId)
    .eq('status', 'pending')

  if (pendingErr) return NextResponse.json({ error: pendingErr.message }, { status: 500 })

  // 3. Calculate "Blocked" funds and true Available Balance
  const blockedFunds = (pendingAds || []).reduce((sum, ad) => sum + (ad.price || 0), 0)
  const availableBalance = (user.balance ?? 0) - blockedFunds

  // 4. Final check: Can they afford this new ad PLUS their pending ones?
  if (availableBalance < price) {
    return NextResponse.json({ 
      error: `Insufficient available balance. You have Rs ${blockedFunds.toLocaleString()} locked in pending ads.` 
    }, { status: 400 })
  }

  // --- NEW BALANCE LOCK LOGIC END ---
  
  // const { data: user, error: userErr } = await supabase
  //   .from('users')
  //   .select('id,balance')
  //   .eq('id', session.userId)
  //   .single()

  // if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
  // if ((user.balance ?? 0) < price) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  const { data: ad, error } = await supabase
    .from('ads')
    .insert({
      user_id: session.userId,
      category,
      ad_type: adType,
      title,
      description,
      price,
      image_url: imageUrl,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ad: {
      id: ad.id,
      userId: ad.user_id,
      category: ad.category,
      adType: ad.ad_type,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      imageUrl: ad.image_url,
      status: ad.status,
      createdAt: ad.created_at,
      expiresAt: ad.expires_at,
    },
  })
}

