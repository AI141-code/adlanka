import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/session'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  // if (file.size > 5 * 1024 * 1024) {
  //   return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 })
  // }

  if (file.size > 1 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image too large. Please try a smaller photo.' }, { status: 400 })
  }

  const allowed = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  if (!allowed.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const bucket = 'ads-images'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${session.userId}/${Date.now()}-${safeName}`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}

