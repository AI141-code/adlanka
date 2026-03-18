import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { AD_PRICES, AdType } from '@/lib/types'

export async function POST(req: Request) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adType } = await req.json()
  const price = AD_PRICES[adType as AdType]

  const supabase = createSupabaseServerClient()

  // Fetch balance and pending ads
  const { data: user } = await supabase.from('users').select('balance').eq('id', session.userId).single()
  const { data: pendingAds } = await supabase.from('ads').select('price').eq('user_id', session.userId).eq('status', 'pending')

  const blockedFunds = (pendingAds || []).reduce((sum, ad) => sum + (ad.price || 0), 0)
  const availableBalance = (user?.balance ?? 0) - blockedFunds

  if (availableBalance < price) {
    return NextResponse.json({ 
      error: `Insufficient available balance. You have Rs ${blockedFunds.toLocaleString()} locked in pending ads.` 
    }, { status: 400 })
  }

  return NextResponse.json({ allowed: true })
}