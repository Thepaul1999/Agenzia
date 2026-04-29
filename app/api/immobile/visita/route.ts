import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { immobileId }: { immobileId: string } = body

    if (!immobileId) {
      return NextResponse.json({ error: 'immobileId mancante' }, { status: 400 })
    }

    const supabase = await createClient()

    // Try atomic RPC increment (defined in schema SQL)
    const { error: rpcError } = await supabase.rpc('increment_viste', {
      immobile_id: immobileId,
    })

    if (rpcError) {
      // Fallback: read + write
      const { data: current } = await supabase
        .from('immobili')
        .select('viste')
        .eq('id', immobileId)
        .single()

      if (!current) {
        return NextResponse.json({ error: 'Immobile non trovato' }, { status: 404 })
      }

      const { error } = await supabase
        .from('immobili')
        .update({ viste: (current.viste ?? 0) + 1 })
        .eq('id', immobileId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
