import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ user: null })

  const supabase = createSupabaseServerClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('id, phone_number, balance, spent, is_admin, created_at')
    .eq('id', session.userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!user) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone_number,
      balance: user.balance ?? 0,
      spent: user.spent ?? 0,
      isAdmin: !!user.is_admin,
      createdAt: user.created_at,
    },
  })
}

