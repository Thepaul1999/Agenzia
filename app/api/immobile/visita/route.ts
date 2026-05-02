import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { immobileId }: { immobileId: string } = body

    if (!immobileId) {
      return NextResponse.json({ error: 'immobileId mancante' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error: rpcError } = await supabase.rpc('increment_viste', {
      immobile_id: immobileId,
    })

    let counted = !rpcError

    if (rpcError) {
      const { data: current } = await supabase.from('immobili').select('viste').eq('id', immobileId).single()

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
      counted = true
    }

    if (counted) {
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
          const admin = createAdminClient()
          await admin.from('immobile_visite_log').insert({ immobile_id: immobileId })
        }
      } catch {
        /* tabella non migrata */
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
