import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

function isValidSriLankanPhone(phone: string) {
  return /^\+94\d{9}$/.test(phone)
}

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    })
  } catch (e) {
    console.error('Failed to send Telegram message', e)
  }
}

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    return NextResponse.json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN' }, { status: 500 })
  }

  const update = await req.json().catch(() => null)

  if (!update || !update.message) {
    return NextResponse.json({ ok: true })
  }

  const message = update.message
  const chatId: number | undefined = message.chat?.id
  const text: string | undefined = message.text
  const contact = message.contact // Added this to capture shared contacts

  if (!chatId) return NextResponse.json({ ok: true })

  const supabase = createSupabaseServerClient()

  // 1. Handle /start command or generic text
  if (text?.startsWith('/start')) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: [
          '👋 Welcome to AdLanka OTP bot.',
          '',
          'To link your account and receive login OTP codes here:',
          '1) Click the "Share My Number" button below to link your account.',
          '2) Go to the AdLanka site and type the same number to receive OTP here.',
        ].join('\n'),
        reply_markup: {
          keyboard: [
            [{ text: "📲 Share My Number", request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }),
    })
    return NextResponse.json({ ok: true })
  }

  // 2. Handle the Shared Contact (The Secure Part)
  if (contact) {
    // SECURITY CHECK: Verify the contact actually belongs to the person sending it
    if (contact.user_id !== message.from.id) {
      await sendTelegramMessage(botToken, chatId, '❌ Security Error: You can only share your own phone number.')
      return NextResponse.json({ ok: true })
    }

    // Standardize phone format (Telegram often sends it without '+')
    let phoneNumber = contact.phone_number
    if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber

    const { error } = await supabase
      .from('telegram_links')
      .upsert(
        { phone_number: phoneNumber, chat_id: chatId },
        { onConflict: 'phone_number' }
      )

    if (error) {
      await sendTelegramMessage(botToken, chatId, 'Sorry, something went wrong. Please try /start again.')
      return NextResponse.json({ ok: false })
    }

    await sendTelegramMessage(
      botToken,
      chatId,
      `✅ Linked successfully!\n\nYou can now use ${phoneNumber} to login on AdLanka.`
    )

    return NextResponse.json({ ok: true })
  }

  // 3. Fallback for when they try to type the number manually
  await sendTelegramMessage(
    botToken,
    chatId,
    'Please use the "Share My Number" button below to securely link your account. Typing the number manually is not supported for security reasons.'
  )

  return NextResponse.json({ ok: true })
}
// export async function POST(req: Request) {
//   const botToken = process.env.TELEGRAM_BOT_TOKEN

//   if (!botToken) {
//     return NextResponse.json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN' }, { status: 500 })
//   }

//   const update = await req.json().catch(() => null)

//   if (!update || !update.message) {
//     return NextResponse.json({ ok: true })
//   }

//   const message = update.message
//   const chatId: number | undefined = message.chat?.id
//   const text: string | undefined = message.text

//   if (!chatId || !text) {
//     return NextResponse.json({ ok: true })
//   }

//   const supabase = createSupabaseServerClient()
//   const trimmed = text.trim()

//   if (trimmed.startsWith('/start')) {
//     await sendTelegramMessage(
//       botToken,
//       chatId,
//       [
//         '👋 Welcome to AdLanka OTP bot.',
//         '',
//         'To link your account and receive login OTP codes here:',
//         '1) Make sure you registered on AdLanka with your Sri Lankan phone number.',
//         '2) Send your phone number in this chat in the format: +94XXXXXXXXX (9 digits after +94).',
//       ].join('\n')
//     )

//     return NextResponse.json({ ok: true })
//   }

//   if (isValidSriLankanPhone(trimmed)) {
//     const phoneNumber = trimmed

//     const { error } = await supabase
//       .from('telegram_links')
//       .upsert(
//         {
//           phone_number: phoneNumber,
//           chat_id: chatId,
//         },
//         { onConflict: 'phone_number' }
//       )

//     if (error) {
//       console.error('Failed to upsert telegram_links', error)
//       await sendTelegramMessage(
//         botToken,
//         chatId,
//         'Sorry, something went wrong while linking your phone number. Please try again later.'
//       )
//       return NextResponse.json({ ok: false })
//     }

//     await sendTelegramMessage(
//       botToken,
//       chatId,
//       '✅ Your phone number has been linked to this Telegram chat.\n\nYou will now receive AdLanka login OTP codes here when you login with this phone number on the website.'
//     )

//     return NextResponse.json({ ok: true })
//   }

//   await sendTelegramMessage(
//     botToken,
//     chatId,
//     'Please send your Sri Lankan phone number in the format: +94XXXXXXXXX (9 digits after +94).'
//   )

//   return NextResponse.json({ ok: true })
// }

