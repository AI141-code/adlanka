import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const nowIso = new Date().toISOString()

  // --- PASSIVE CLEANUP START ---
  try {
    // 1. Find ads that have expired but are still in the database
    const { data: expiredAds } = await supabase
      .from('ads')
      .select('id, image_url')
      .lt('expires_at', nowIso)

    if (expiredAds && expiredAds.length > 0) {
      // 2. Filter out ads that actually have images and extract filenames
      const filesToDelete = expiredAds
        .map(ad => {
          if (!ad.image_url) return null
          const parts = ad.image_url.split('/')
          return parts[parts.length - 1]
        })
        .filter((name): name is string => !!name)

      // 3. Delete those images from the storage bucket
      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('ads-images')
          .remove(filesToDelete)
      }

      // 4. Delete the expired ad rows from the database
      await supabase.from('ads').delete().lt('expires_at', nowIso)
      
      console.log(`Passive Cleanup: Removed ${expiredAds.length} expired ads.`)
    }
  } catch (error) {
    // We wrap this in a try/catch so that if cleanup fails, 
    // the homepage still loads for the user.
    console.error('Passive Cleanup Error:', error)
  }
  // --- PASSIVE CLEANUP END ---

  const { data, error } = await supabase
    .from('ads')
    .select('id,user_id,category,ad_type,title,description,price,image_url,status,created_at,expires_at')
    .eq('status', 'approved')
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const typeOrder: Record<string, number> = { vip: 0, super: 1, normal: 2 }
  const ads = (data || [])
    .map((a) => ({
      id: a.id,
      userId: a.user_id,
      category: a.category,
      adType: a.ad_type,
      title: a.title,
      description: a.description,
      price: a.price,
      imageUrl: a.image_url,
      status: a.status,
      createdAt: a.created_at,
      expiresAt: a.expires_at,
    }))
    .sort((a, b) => (typeOrder[a.adType] ?? 99) - (typeOrder[b.adType] ?? 99))

  return NextResponse.json({ ads })
}

