import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

function isValidSriLankanPhone(phone: string) {
  return /^\+94\d{9}$/.test(phone)
}

async function sendOtpToTelegram(
  phoneNumber: string,
  otpCode: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return

  const supabase = createSupabaseServerClient()
  const { data: link, error } = await supabase
    .from('telegram_links')
    .select('chat_id')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (error || !link?.chat_id) {
    if (error) {
      console.error('Failed to load telegram_links', error)
    }
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: link.chat_id,
        text: `Your AdLanka OTP code is: ${otpCode}\n\nThis code will expire in 5 minutes.`,
      }),
    })
  } catch (e) {
    console.error('Failed to send OTP via Telegram', e)
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { phoneNumber?: string }
  const phoneNumber = body?.phoneNumber?.trim()

  if (!phoneNumber || !isValidSriLankanPhone(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number. Format: +94XXXXXXXXX' }, { status: 400 })
  }

  const otpCode =
    process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456'
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const supabase = createSupabaseServerClient()

  // Rate limit: 1 OTP per minute per phone number
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: recentOtps, error: recentErr } = await supabase
    .from('otp_codes')
    .select('id, created_at')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recentErr) {
    return NextResponse.json({ error: recentErr.message }, { status: 500 })
  }

  const lastOtp = recentOtps?.[0]
  if (lastOtp && lastOtp.created_at && new Date(lastOtp.created_at).getTime() > Date.now() - 60 * 1000) {
    return NextResponse.json(
      { error: 'You can request a new OTP only once every 60 seconds.' },
      { status: 429 }
    )
  }

  const { error } = await supabase.from('otp_codes').insert({
    phone_number: phoneNumber,
    otp_code: otpCode,
    expires_at: expiresAt,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Try to send OTP to Telegram, but don't fail the request if Telegram is unreachable
  await sendOtpToTelegram(phoneNumber, otpCode)

  return NextResponse.json({
    success: true,
    message:
      'OTP generated. If your phone is linked to @adlanka_otp_bot on Telegram, the code has been sent there.',
  })
}

