import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { cookies } from 'next/headers'
import { applyPrivacyJitter, geocodeItaliaAddress } from '@/lib/geocodeServer'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const supabase = await createClient()

    let titolo: string | null = null
    let titolo_en: string | null = null
    let citta: string | null = null
    let prezzo: number | null = null
    let descrizione: string | null = null
    let descrizione_en: string | null = null
    let mq: number | null = null
    let locali: number | null = null
    let pubblicato = false
    let featured = false
    let foto: File | null = null
    let indirizzo: string | null = null
    let posizione_approssimativa = true
    let tipo_contratto: 'vendita' | 'affitto' = 'vendita'
    let stato = 'disponibile'
    let submittedLat: number | null = null
    let submittedLng: number | null = null

    const contentType = request.headers.get('content-type') ?? ''
    let multipartData: FormData | null = null

    if (contentType.includes('multipart/form-data')) {
      multipartData = await request.formData()
      const formData = multipartData
      titolo        = (formData.get('titolo')        as string | null)?.trim() ?? null
      titolo_en     = (formData.get('titolo_en')     as string | null)?.trim() || null
      citta         = (formData.get('citta')         as string | null)?.trim() || null
      descrizione   = (formData.get('descrizione')   as string | null)?.trim() || null
      descrizione_en= (formData.get('descrizione_en')as string | null)?.trim() || null
      indirizzo     = (formData.get('indirizzo')     as string | null)?.trim() || null
      stato         = (formData.get('stato')         as string | null)?.trim() || 'disponibile'
      const prezzoRaw = formData.get('prezzo') as string | null
      const mqRaw     = formData.get('mq')     as string | null
      const localiRaw = formData.get('locali') as string | null
      prezzo  = prezzoRaw  && prezzoRaw  !== '' ? Number(prezzoRaw)  : null
      mq      = mqRaw      && mqRaw      !== '' ? Number(mqRaw)      : null
      locali  = localiRaw  && localiRaw  !== '' ? Number(localiRaw)  : null
      pubblicato             = formData.get('pubblicato')             === 'true'
      featured               = formData.get('featured')               === 'true'
      posizione_approssimativa = formData.get('posizione_approssimativa') !== 'false'
      tipo_contratto = (formData.get('tipo_contratto') as string) === 'affitto' ? 'affitto' : 'vendita'
      foto = formData.get('foto_copertina') as File | null
      const latRaw = formData.get('lat') as string | null
      const lngRaw = formData.get('lng') as string | null
      if (latRaw && latRaw.trim() !== '') {
        const n = Number(latRaw)
        if (Number.isFinite(n)) submittedLat = n
      }
      if (lngRaw && lngRaw.trim() !== '') {
        const n = Number(lngRaw)
        if (Number.isFinite(n)) submittedLng = n
      }
    } else {
      const body = await request.json()
      titolo         = body.titolo?.trim() ?? null
      titolo_en      = body.titolo_en?.trim() || null
      citta          = body.citta?.trim()  || null
      descrizione    = body.descrizione?.trim() || null
      descrizione_en = body.descrizione_en?.trim() || null
      indirizzo      = body.indirizzo?.trim() || null
      stato          = body.stato?.trim() || 'disponibile'
      prezzo  = body.prezzo  !== undefined && body.prezzo  !== '' ? Number(body.prezzo)  : null
      mq      = body.mq      !== undefined && body.mq      !== '' ? Number(body.mq)      : null
      locali  = body.locali  !== undefined && body.locali  !== '' ? Number(body.locali)  : null
      pubblicato               = body.pubblicato === true
      featured                 = body.featured   === true
      posizione_approssimativa = body.posizione_approssimativa !== false
      tipo_contratto = body.tipo_contratto === 'affitto' ? 'affitto' : 'vendita'
      if (body.lat !== undefined && body.lat !== '' && body.lat !== null) {
        const n = Number(body.lat)
        if (Number.isFinite(n)) submittedLat = n
      }
      if (body.lng !== undefined && body.lng !== '' && body.lng !== null) {
        const n = Number(body.lng)
        if (Number.isFinite(n)) submittedLng = n
      }
    }

    if (!titolo) {
      return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 400 })
    }

    // Generate unique slug
    let slug = slugify(titolo)
    const { data: existing } = await supabase
      .from('immobili')
      .select('slug')
      .like('slug', `${slug}%`)

    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`
    }

    // Upload cover image if provided
    let immaginecopertina: string | null = null
    let uploadError: string | null = null

    if (foto && foto.size > 0) {
      // Validazioni file
      const MAX_SIZE = 10 * 1024 * 1024 // 10MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

      if (foto.size > MAX_SIZE) {
        uploadError = `Foto troppo grande: ${(foto.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`
      } else if (!ALLOWED_TYPES.includes(foto.type)) {
        uploadError = `Formato non supportato: ${foto.type}. Usa JPEG, PNG, WebP o HEIC`
      } else {
        const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
        // Whitelist estensioni per sicurezza
        const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
        if (!ALLOWED_EXTS.includes(ext)) {
          uploadError = `Estensione non valida: .${ext}`
        } else {
          const filename = `${slug}-${Date.now()}.${ext}`
          const arrayBuf = await foto.arrayBuffer()
          const { error: supabaseError } = await supabase.storage
            .from('immobili')
            .upload(filename, new Uint8Array(arrayBuf), {
              contentType: foto.type,
              upsert: false,
            })

          if (supabaseError) {
            console.error('Supabase upload error:', supabaseError)
            uploadError = `Errore upload: ${supabaseError.message || 'Sconosciuto'}`
          } else {
            immaginecopertina = filename
            console.log(`✓ Foto caricata: ${filename}`)
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('immobili')
      .insert({
        titolo,
        titolo_en,
        slug,
        citta,
        prezzo:  prezzo  !== null && !isNaN(prezzo)  ? prezzo  : null,
        mq:      mq      !== null && !isNaN(mq)      ? mq      : null,
        locali:  locali  !== null && !isNaN(locali)  ? locali  : null,
        descrizione,
        descrizione_en,
        immaginecopertina,
        indirizzo,
        posizione_approssimativa,
        featured,
        pubblicato,
        tipo_contratto,
        stato,
        viste: 0,
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const hasClientCoords = submittedLat !== null && submittedLng !== null
    let pos: { lat: number; lng: number } | null = null
    if (hasClientCoords) {
      pos = posizione_approssimativa
        ? applyPrivacyJitter(submittedLat!, submittedLng!, data.id)
        : { lat: submittedLat!, lng: submittedLng! }
    } else {
      const addr = (indirizzo ?? '').trim()
      const city = (citta ?? '').trim()
      if (addr || city) {
        const geo = await geocodeItaliaAddress({ indirizzo: addr || null, citta: city || null })
        if (geo) {
          pos = posizione_approssimativa ? applyPrivacyJitter(geo.lat, geo.lng, data.id) : geo
        }
      }
    }
    if (pos) {
      await supabase.from('immobili').update({ lat: pos.lat, lng: pos.lng }).eq('id', data.id)
    }

    // Upload additional gallery photos if any
    const additionalPhotos = multipartData ? (multipartData.getAll('photos') as File[]) : []
    let photoUploadWarning: string | null = null

    if (additionalPhotos.length > 0) {
      const MAX_PHOTOS = 50
      const MAX_SIZE = 10 * 1024 * 1024
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']

      for (let i = 0; i < Math.min(additionalPhotos.length, MAX_PHOTOS - 1); i++) {
        const photo = additionalPhotos[i]
        if (!photo || photo.size === 0) continue

        const isValidType = ALLOWED_TYPES.includes(photo.type)
        const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const isValidExt = ALLOWED_EXTS.includes(ext)
        
        if (!isValidType || !isValidExt) {
          console.warn(`Skipping invalid file: ${photo.name}`)
          continue
        }

        if (photo.size > MAX_SIZE) {
          console.warn(`File too large: ${photo.name}`)
          continue
        }

        const filename = `${data.slug}-gallery-${Date.now()}-${i}.${ext}`
        const arrayBuf = await photo.arrayBuffer()
        const { error: uploadErr } = await supabase.storage
          .from('immobili')
          .upload(filename, new Uint8Array(arrayBuf), {
            contentType: photo.type,
            upsert: false,
          })

        if (uploadErr) {
          console.error('Gallery photo upload error:', uploadErr)
          photoUploadWarning = `Alcune foto non sono state caricate: ${uploadErr.message}`
          continue
        }

        // Insert record in immobili_foto
        const { error: dbErr } = await supabase
          .from('immobili_foto')
          .insert({
            immobile_id: data.id,
            filename,
            ordine: i,
          })

        if (dbErr) {
          console.error('Photo DB insert error:', dbErr)
        }
      }
    }

    // Se upload foto fallito, comunica warning ma immobile è comunque creato
    const response: any = { success: true, id: data.id, slug: data.slug }
    if (uploadError) {
      response.warning = `Immobile creato, ma foto copertina non caricata: ${uploadError}`
    }
    if (photoUploadWarning) {
      response.warning = photoUploadWarning
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Create immobile error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE handler: deletes immobile and associated photos from Supabase storage and DB
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    // simple auth: require site_admin cookie
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const body = await request.json()
    const id = Number(body.id)
    if (!id || isNaN(id)) return NextResponse.json({ error: 'ID non valido' }, { status: 400 })

    // Fetch photos
    const { data: photos, error: photosErr } = await supabase.from('immobili_photos').select('filename').eq('immobile_id', id)
    if (photosErr) throw photosErr
    const paths: string[] = Array.isArray(photos) ? photos.map((p: any) => p.filename) : []

    // Delete files from storage
    if (paths.length > 0) {
      const { error: remErr } = await supabase.storage.from('immobili').remove(paths)
      if (remErr) throw remErr
    }

    // Delete photo rows
    const { error: delPhotosErr } = await supabase.from('immobili_photos').delete().eq('immobile_id', id)
    if (delPhotosErr) throw delPhotosErr

    // Delete immobile
    const { error: delImmErr } = await supabase.from('immobili').delete().eq('id', id)
    if (delImmErr) throw delImmErr

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete immobile error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

// PATCH handler: handles photo operations (set-cover, reorder, delete-photo) via { action }
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const body = await request.json()
    const action = body.action as string

    if (action === 'set-cover') {
      const immobileId = Number(body.immobileId)
      const filename = body.filename as string
      if (!immobileId || !filename) return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })

      await supabase.from('immobili_photos').update({ is_cover: 0 }).eq('immobile_id', immobileId)
      const { error: setErr } = await supabase.from('immobili_photos').update({ is_cover: 1 }).eq('immobile_id', immobileId).eq('filename', filename)
      if (setErr) throw setErr
      const { error: updErr } = await supabase.from('immobili').update({ immaginecopertina: filename }).eq('id', immobileId)
      if (updErr) throw updErr

      return NextResponse.json({ success: true })
    }

    if (action === 'reorder') {
      const immobileId = Number(body.immobileId)
      const order = Array.isArray(body.order) ? body.order : []
      if (!immobileId || order.length === 0) return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })

      for (let i = 0; i < order.length; i++) {
        const filename = order[i]
        const { error: updErr } = await supabase.from('immobili_photos').update({ position: i }).eq('immobile_id', immobileId).eq('filename', filename)
        if (updErr) throw updErr
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'delete-photo') {
      const immobileId = Number(body.immobileId)
      const filename = body.filename as string
      if (!immobileId || !filename) return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })

      // delete from storage
      const { error: remErr } = await supabase.storage.from('immobili').remove([filename])
      if (remErr) throw remErr

      // delete db row
      const { error: delErr } = await supabase.from('immobili_photos').delete().eq('immobile_id', immobileId).eq('filename', filename)
      if (delErr) throw delErr

      // if deleted photo was cover, unset immaginecopertina or set to another
      const { data: coverRow } = await supabase.from('immobili').select('immaginecopertina').eq('id', immobileId).single()
      if (coverRow && coverRow.immaginecopertina === filename) {
        // try to set another photo as cover
        const { data: remaining } = await supabase.from('immobili_photos').select('filename').eq('immobile_id', immobileId).order('position', { ascending: true }).limit(1)
        const newCover = Array.isArray(remaining) && remaining.length > 0 ? remaining[0].filename : null
        await supabase.from('immobili').update({ immaginecopertina: newCover }).eq('id', immobileId)
        if (newCover) {
          await supabase.from('immobili_photos').update({ is_cover: 1 }).eq('immobile_id', immobileId).eq('filename', newCover)
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Azione non riconosciuta' }, { status: 400 })
  } catch (err: any) {
    console.error('Photo action error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
