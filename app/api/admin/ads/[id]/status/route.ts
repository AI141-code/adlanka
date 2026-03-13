import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = (await req.json().catch(() => null)) as null | { status?: 'approved' | 'rejected' }
  const status = body?.status
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: ad, error: adErr } = await supabase
    .from('ads')
    .select('id,user_id,price,status')
    .eq('id', id)
    .single()

  if (adErr) return NextResponse.json({ error: adErr.message }, { status: 500 })

  const previousStatus = ad.status as string
  const { error: updErr } = await supabase.from('ads').update({ status }).eq('id', id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  if (status === 'approved' && previousStatus === 'pending') {
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id,balance,spent')
      .eq('id', ad.user_id)
      .single()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if ((user.balance ?? 0) < (ad.price ?? 0)) {
      // Revert approval if insufficient funds
      await supabase.from('ads').update({ status: 'pending' }).eq('id', id)
      return NextResponse.json({ error: 'User has insufficient balance' }, { status: 400 })
    }

    const newBalance = (user.balance ?? 0) - (ad.price ?? 0)
    const newSpent = (user.spent ?? 0) + (ad.price ?? 0)

    const { error: balErr } = await supabase
      .from('users')
      .update({ balance: newBalance, spent: newSpent })
      .eq('id', ad.user_id)

    if (balErr) return NextResponse.json({ error: balErr.message }, { status: 500 })

    await supabase.from('transactions').insert({
      user_id: ad.user_id,
      amount: ad.price ?? 0,
      type: 'spent',
    })
  }

  return NextResponse.json({ success: true })
}

