import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id: immobileId } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // body.photos = [{ id, ordine }, ...]
    const photos = body.photos as Array<{ id: string; ordine: number }>

    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'Invalid photos array' }, { status: 400 })
    }

    // Update ordine per ogni foto
    for (const photo of photos) {
      const { error } = await supabase
        .from('immobili_foto')
        .update({ ordine: photo.ordine })
        .eq('id', photo.id)
        .eq('immobile_id', immobileId)

      if (error) {
        console.error(`Reorder error for photo ${photo.id}:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    console.log(`✓ ${photos.length} foto riordinate`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reorder photos error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
