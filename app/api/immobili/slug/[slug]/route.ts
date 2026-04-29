import { NextResponse } from 'next/server'
import { createClient }  from '@/lib/server'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: immobile, error } = await supabase
      .from('immobili')
      .select('id, titolo, slug, citta, prezzo, immaginecopertina, descrizione, featured, tipologia, contratto, stato, superfice, locali, pubblicato')
      .eq('slug', slug)
      .eq('pubblicato', true)
      .single()

    if (error || !immobile) {
      return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
    }

    return NextResponse.json({ immobile })
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
