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

    const { id } = await params
    const supabase = createAdminClient()
    const update: Record<string, unknown> = {}
    let uploadError: string | null = null // ← Traccia errore upload

    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      const allowed = ['titolo', 'titolo_en', 'citta', 'prezzo', 'descrizione', 'descrizione_en',
                       'featured', 'pubblicato', 'stato', 'indirizzo',
                       'posizione_approssimativa', 'mq', 'locali', 'tipo_contratto']

      for (const key of allowed) {
        const val = formData.get(key)
        if (val === null) continue
        if (key === 'prezzo' || key === 'mq' || key === 'locali') {
          update[key] = val === '' ? null : Number(val)
        } else if (key === 'featured' || key === 'pubblicato' || key === 'posizione_approssimativa') {
          update[key] = val === 'true'
        } else {
          update[key] = String(val).trim() || null
        }
      }

      // Handle image upload
      const foto = formData.get('foto_copertina') as File | null

      if (foto && foto.size > 0) {
        // Validazioni file
        const MAX_SIZE = 10 * 1024 * 1024 // 10MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

        if (foto.size > MAX_SIZE) {
          uploadError = `Foto troppo grande: ${(foto.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`
        } else if (!ALLOWED_TYPES.includes(foto.type)) {
          uploadError = `Formato non supportato: ${foto.type}. Usa JPEG, PNG o WebP`
        } else {
          const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
          const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp']
          if (!ALLOWED_EXTS.includes(ext)) {
            uploadError = `Estensione non valida: .${ext}`
          } else {
            const filename = `${id}-${Date.now()}.${ext}`
            const arrayBuf = await foto.arrayBuffer()
            const { error: supabaseError } = await supabase.storage
              .from('immobili')
              .upload(filename, new Uint8Array(arrayBuf), { contentType: foto.type, upsert: true })

            if (supabaseError) {
              console.error('Supabase upload error:', supabaseError)
              uploadError = `Errore upload: ${supabaseError.message || 'Sconosciuto'}`
            } else {
              update['immaginecopertina'] = filename
              console.log(`✓ Foto aggiornata: ${filename}`)
            }
          }
        }
      }

      // Handle planimetria upload
      const planimetria = formData.get('planimetria') as File | null

      if (planimetria && planimetria.size > 0) {
        const MAX_SIZE = 50 * 1024 * 1024 // 50MB
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

        if (planimetria.size > MAX_SIZE) {
          uploadError = `Planimetria troppo grande: ${(planimetria.size / 1024 / 1024).toFixed(1)}MB (max 50MB)`
        } else if (!ALLOWED_TYPES.includes(planimetria.type)) {
          uploadError = `Formato non supportato: ${planimetria.type}. Usa PDF, JPEG, PNG o WebP`
        } else {
          const ext = planimetria.name.split('.').pop()?.toLowerCase() || 'pdf'
          const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'webp']
          if (!ALLOWED_EXTS.includes(ext)) {
            uploadError = `Estensione non valida: .${ext}`
          } else {
            const filename = `${id}-plan-${Date.now()}.${ext}`
            const arrayBuf = await planimetria.arrayBuffer()
            const { error: supabaseError } = await supabase.storage
              .from('immobili')
              .upload(filename, new Uint8Array(arrayBuf), { contentType: planimetria.type, upsert: true })

            if (supabaseError) {
              console.error('Supabase planimetria upload error:', supabaseError)
              uploadError = `Errore upload planimetria: ${supabaseError.message || 'Sconosciuto'}`
            } else {
              update['planimetria'] = filename
              console.log(`✓ Planimetria aggiornata: ${filename}`)
            }
          }
        }
      }
    } else {
      const body = await request.json()
      const strFields = ['titolo', 'titolo_en', 'citta', 'descrizione', 'descrizione_en',
                         'stato', 'indirizzo', 'tipo_contratto'] as const
      const numFields = ['prezzo', 'lat', 'lng', 'mq', 'locali'] as const
      const boolFields = ['featured', 'pubblicato', 'posizione_approssimativa'] as const

      for (const key of strFields) {
        if (!(key in body)) continue
        update[key] = body[key]
      }
      for (const key of numFields) {
        if (!(key in body)) continue
        update[key] = body[key] === '' || body[key] === null ? null : Number(body[key])
      }
      for (const key of boolFields) {
        if (!(key in body)) continue
        update[key] = body[key]
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
    }

    const { error } = await supabase.from('immobili').update(update).eq('id', id)
    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Risposta con optional warning se upload fallito
    const response: any = { success: true }
    if (uploadError) {
      response.warning = uploadError
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('PATCH error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Get image path to delete from storage too
    const { data: imm } = await supabase
      .from('immobili')
      .select('immaginecopertina')
      .eq('id', id)
      .single()

    const { error } = await supabase.from('immobili').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remove image from storage (best-effort)
    if (imm?.immaginecopertina) {
      await supabase.storage.from('immobili').remove([imm.immaginecopertina])
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
