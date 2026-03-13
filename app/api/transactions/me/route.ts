import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('id,user_id,amount,type,created_at')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const transactions = (data || []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    amount: t.amount,
    type: t.type,
    createdAt: t.created_at,
  }))

  return NextResponse.json({ transactions })
}

