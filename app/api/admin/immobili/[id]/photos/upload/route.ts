import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { isAdminSession } from '@/lib/adminSession'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const isAdmin = await isAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id: immobileId } = await params
    const supabase = await createClient()

    const formData = await request.formData()
    const files = formData.getAll('photos') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nessun file selezionato' }, { status: 400 })
    }

    const MAX_FILES = 50
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB per file
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Max ${MAX_FILES} foto per volta` }, { status: 400 })
    }

    const uploadedPhotos: any[] = []
    const errors: string[] = []

    // Upload ogni foto
    for (let i = 0; i < files.length; i++) {
      const foto = files[i]

      // Validazioni
      if (foto.size > MAX_SIZE) {
        errors.push(`${foto.name}: Troppo grande (${(foto.size / 1024 / 1024).toFixed(1)}MB)`)
        continue
      }

      if (!ALLOWED_TYPES.includes(foto.type)) {
        errors.push(`${foto.name}: Formato non supportato`)
        continue
      }

      const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
      if (!ALLOWED_EXTS.includes(ext)) {
        errors.push(`${foto.name}: Estensione non valida`)
        continue
      }

      // Upload a Supabase Storage
      const filename = `${immobileId}/${Date.now()}-${i}.${ext}`
      const arrayBuf = await foto.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('immobili')
        .upload(filename, new Uint8Array(arrayBuf), {
          contentType: foto.type,
          upsert: false,
        })

      if (uploadError) {
        console.error(`Upload error for ${foto.name}:`, uploadError)
        errors.push(`${foto.name}: ${uploadError.message}`)
        continue
      }

      // Get current max ordine
      const { data: maxOrdine } = await supabase
        .from('immobili_foto')
        .select('ordine')
        .eq('immobile_id', immobileId)
        .order('ordine', { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextOrdine = (maxOrdine?.ordine ?? -1) + 1

      // Salva record in DB
      const { data: photoRecord, error: dbError } = await supabase
        .from('immobili_foto')
        .insert({
          immobile_id: immobileId,
          filename,
          ordine: nextOrdine,
        })
        .select('id, filename, ordine')
        .single()

      if (dbError) {
        console.error('DB insert error:', dbError)
        errors.push(`${foto.name}: Errore salvataggio DB`)
        continue
      }

      uploadedPhotos.push(photoRecord)
      console.log(`✓ Foto caricata: ${filename}`)
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedPhotos.length,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
      warning: errors.length > 0 ? `${uploadedPhotos.length} foto caricate, ${errors.length} errori` : undefined,
    })
  } catch (err) {
    console.error('Upload photos error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
