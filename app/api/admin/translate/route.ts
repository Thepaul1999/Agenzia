import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurata. Aggiungila al file .env.local' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Traduci dall'italiano all'inglese il seguente testo immobiliare. Mantieni lo stile professionale e il tono originale. Restituisci SOLO il testo tradotto, senza spiegazioni o note.\n\n${text}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Errore API: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const translated = data.content?.[0]?.text ?? ''
    return NextResponse.json({ translated })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
