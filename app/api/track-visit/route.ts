import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path }: { path: string } = body

    if (!path) {
      return NextResponse.json({ error: 'path mancante' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('visite_sito')
      .insert({ path })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
