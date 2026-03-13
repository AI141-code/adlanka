import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { setSessionCookie } from '@/lib/session'

function isValidSriLankanPhone(phone: string) {
  return /^\+94\d{9}$/.test(phone)
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { phoneNumber?: string; otpCode?: string }
  const phoneNumber = body?.phoneNumber?.trim()
  const otpCode = body?.otpCode?.trim()

  if (!phoneNumber || !isValidSriLankanPhone(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number. Format: +94XXXXXXXXX' }, { status: 400 })
  }
  if (!otpCode || !/^\d{6}$/.test(otpCode)) {
    return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  const { data: otpRows, error: otpErr } = await supabase
    .from('otp_codes')
    .select('id, otp_code, expires_at')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(5)

  if (otpErr) {
    return NextResponse.json({ error: otpErr.message }, { status: 500 })
  }

  const now = Date.now()
  const matching = (otpRows || []).find((r) => r.otp_code === otpCode && new Date(r.expires_at).getTime() > now)

  if (!matching) {
    return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 401 })
  }

  // Delete all OTPs for this phone after success
  await supabase.from('otp_codes').delete().eq('phone_number', phoneNumber)

  // Create user if not exists
  const { data: existingUser, error: userFindErr } = await supabase
    .from('users')
    .select('id, phone_number, balance, created_at, is_admin, spent')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (userFindErr) {
    return NextResponse.json({ error: userFindErr.message }, { status: 500 })
  }

  let user = existingUser
  if (!user) {
    const { data: created, error: createErr } = await supabase
      .from('users')
      .insert({
        phone_number: phoneNumber,
        balance: 0,
        spent: 0,
        is_admin: false,
      })
      .select('id, phone_number, balance, created_at, is_admin, spent')
      .single()

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 })
    }
    user = created
  }

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

  setSessionCookie(res, { userId: user.id, phoneNumber, isAdmin: !!user.is_admin })
  return res
}

