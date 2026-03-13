import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { setSessionCookie } from '@/lib/session'

const ADMIN_PHONE = '+94771234567'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { phoneNumber?: string; password?: string }
  const phoneNumber = body?.phoneNumber?.trim()
  const password = body?.password?.trim()

  if (phoneNumber !== ADMIN_PHONE) {
    return NextResponse.json({ error: 'Not an admin account' }, { status: 403 })
  }

  const expected = process.env.ADMIN_PASSWORD || 'admin123'
  if (!password || password !== expected) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()
  const { data: user, error } = await supabase
    .from('users')
    .upsert(
      {
        phone_number: ADMIN_PHONE,
        is_admin: true,
        balance: 0,
        spent: 0,
      },
      { onConflict: 'phone_number' }
    )
    .select('id, phone_number, balance, spent, is_admin, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const res = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone_number,
      balance: user.balance ?? 0,
      spent: user.spent ?? 0,
      isAdmin: !!user.is_admin,
      createdAt: user.created_at,
    },
  })
  setSessionCookie(res, { userId: user.id, phoneNumber: ADMIN_PHONE, isAdmin: true })
  return res
}

