import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const session = await getSessionFromCookies()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const phoneNumber = searchParams.get('phoneNumber')?.trim()
  if (!phoneNumber || !/^\+94\d{9}$/.test(phoneNumber)) {
    return NextResponse.json({ user: null })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id,phone_number,balance,spent,is_admin,created_at')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: data.id,
      phone: data.phone_number,
      balance: data.balance ?? 0,
      spent: data.spent ?? 0,
      isAdmin: !!data.is_admin,
      createdAt: data.created_at,
    },
  })
}

