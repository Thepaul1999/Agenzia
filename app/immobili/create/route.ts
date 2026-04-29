import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, role, active')
      .eq('id', user.id)
      .maybeSingle()

    if (adminError || !adminUser || !adminUser.active || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })
    }

    const formData = await request.formData()

    const titolo = String(formData.get('titolo') ?? '').trim()
    const citta = String(formData.get('citta') ?? '').trim()
    const descrizione = String(formData.get('descrizione') ?? '').trim()
    const prezzoRaw = String(formData.get('prezzo') ?? '').trim()
    const foto = formData.get('foto_copertina')

    if (!titolo || !citta) {
      return NextResponse.json(
        { error: 'Titolo e città sono obbligatori.' },
        { status: 400 }
      )
    }

    const prezzo =
      prezzoRaw === '' ? null : Number.parseFloat(prezzoRaw.replace(',', '.'))

    if (prezzoRaw !== '' && Number.isNaN(prezzo)) {
      return NextResponse.json({ error: 'Prezzo non valido.' }, { status: 400 })
    }

    let slugBase = slugify(titolo)
    if (!slugBase) {
      slugBase = `immobile-${Date.now()}`
    }

    let slug = slugBase

    for (let i = 1; i <= 50; i++) {
      const { data: existing, error: existingError } = await supabase
        .from('immobili')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existingError) {
        return NextResponse.json(
          { error: `Errore controllo slug: ${existingError.message}` },
          { status: 400 }
        )
      }

      if (!existing) {
        break
      }

      slug = `${slugBase}-${i}`
    }

    let imagePath: string | null = null

    if (foto instanceof File && foto.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(foto.type)) {
        return NextResponse.json(
          { error: 'Formato immagine non supportato.' },
          { status: 400 }
        )
      }

      const maxSize = 5 * 1024 * 1024
      if (foto.size > maxSize) {
        return NextResponse.json(
          { error: 'Immagine troppo pesante. Max 5MB.' },
          { status: 400 }
        )
      }

      const extension = foto.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
      imagePath = `${user.id}/${fileName}`

      const fileBuffer = Buffer.from(await foto.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('immobili')
        .upload(imagePath, fileBuffer, {
          contentType: foto.type,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload immagine fallito: ${uploadError.message}` },
          { status: 400 }
        )
      }
    }

    const payload = {
      titolo,
      slug,
      descrizione: descrizione || null,
      tipologia: 'appartamento',
      contratto: 'vendita',
      stato: 'disponibile',
      prezzo,
      citta,
      immagine_copertina: imagePath,
      pubblicato: true,
    }

    const { data, error } = await supabase
      .from('immobili')
      .insert(payload)
      .select('id, slug, immagine_copertina')
      .maybeSingle()

    if (error) {
      if (imagePath) {
        await supabase.storage.from('immobili').remove([imagePath])
      }

      return NextResponse.json(
        { error: `Salvataggio immobile fallito: ${error.message}` },
        { status: 400 }
      )
    }

    if (!data) {
      if (imagePath) {
        await supabase.storage.from('immobili').remove([imagePath])
      }

      return NextResponse.json(
        { error: 'Inserimento non confermato dal database.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Immobile creato con successo.',
      id: data.id,
      slug: data.slug,
      imagePath: data.immagine_copertina,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Errore interno del server.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}