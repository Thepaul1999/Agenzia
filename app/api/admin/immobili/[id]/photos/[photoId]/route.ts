import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string; photoId: string }> }

export async function DELETE(request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id: immobileId, photoId } = await params
    const supabase = createAdminClient()

    // Get foto record
    const { data: fotoRecord, error: fetchError } = await supabase
      .from('immobili_foto')
      .select('filename')
      .eq('id', photoId)
      .eq('immobile_id', immobileId)
      .single()

    if (fetchError || !fotoRecord) {
      return NextResponse.json({ error: 'Foto non trovata' }, { status: 404 })
    }

    // Delete da storage
    const { error: storageError } = await supabase.storage
      .from('immobili')
      .remove([fotoRecord.filename])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continua comunque col delete dal DB
    }

    // Delete da database
    const { error: dbError } = await supabase
      .from('immobili_foto')
      .delete()
      .eq('id', photoId)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log(`✓ Foto eliminata: ${fotoRecord.filename}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete photo error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
