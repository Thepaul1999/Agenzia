import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Parametro q mancante' }, { status: 400 })

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=it`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'AgenziaImmobiliareMonferrato/1.0' },
  })
  if (!res.ok) return NextResponse.json({ error: 'Errore geocoding' }, { status: 502 })

  const data = await res.json()
  if (!data.length) return NextResponse.json({ error: 'Indirizzo non trovato' }, { status: 404 })

  const { lat, lon, display_name } = data[0]
  return NextResponse.json({ lat: parseFloat(lat), lng: parseFloat(lon), display_name })
}
