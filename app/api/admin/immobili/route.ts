import { NextResponse } from 'next/server'
import { createClient }  from '@/lib/server'
import { isAdminSession } from '@/lib/adminSession'

export async function GET() {
  try {
    const isAdmin = await isAdminSession()

    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: immobili, error } = await supabase
      .from('immobili')
      .select('id, titolo, slug, citta, prezzo, immaginecopertina, featured, pubblicato, viste, descrizione, tipo_contratto, stato, indirizzo, lat, lng, posizione_approssimativa, mq, locali, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ immobili: immobili ?? [] })
  } catch {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
