import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/adminSession'

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    // Use MyMemory API (free, no key needed) for Google Translate quality
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q', text)
    url.searchParams.set('langpair', 'it|en')

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Translation API error')

    const data = await res.json()
    const translated = data.responseData?.translatedText || ''

    if (!translated) {
      return NextResponse.json({ error: 'Traduzione non riuscita' }, { status: 500 })
    }

    return NextResponse.json({ translated })
  } catch (err) {
    return NextResponse.json(
      { error: `Errore traduzione: ${err instanceof Error ? err.message : 'Sconosciuto'}` },
      { status: 500 }
    )
  }
}
