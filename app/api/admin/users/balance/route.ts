import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as null | { phoneNumber?: string; balance?: number }
  const phoneNumber = body?.phoneNumber?.trim()
  const balance = body?.balance

  if (!phoneNumber || !/^\+94\d{9}$/.test(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }
  if (typeof balance !== 'number' || Number.isNaN(balance) || balance < 0) {
    return NextResponse.json({ error: 'Invalid balance' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data: user, error: findErr } = await supabase
    .from('users')
    .select('id,balance,is_admin')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })
  if (!user || user.is_admin) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const oldBalance = user.balance ?? 0
  const diff = balance - oldBalance

  const { error: updErr } = await supabase.from('users').update({ balance }).eq('id', user.id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  if (diff > 0) {
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: diff,
      type: 'topup',
    })
  }

  return NextResponse.json({ success: true })
}

