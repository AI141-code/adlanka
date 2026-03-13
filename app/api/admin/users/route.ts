import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id,phone_number,balance,spent,is_admin,created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = (data || []).map((u) => ({
    id: u.id,
    phone: u.phone_number,
    balance: u.balance ?? 0,
    spent: u.spent ?? 0,
    isAdmin: !!u.is_admin,
    createdAt: u.created_at,
  }))

  return NextResponse.json({ users })
}

