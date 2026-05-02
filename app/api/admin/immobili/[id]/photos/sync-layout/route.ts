import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

/** Full ordered list: [copertina, ...galleria]. Sincronizza DB, storage e ordini. */
export async function POST(request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies()
    if (cookieStore.get('site_admin')?.value !== 'true') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id: immobileId } = await params
    const body = await request.json()
    const order = body.order as string[] | undefined
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'order richiesto (almeno una foto)' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: imm, error: immErr } = await supabase
      .from('immobili')
      .select('immaginecopertina')
      .eq('id', immobileId)
      .single()
    if (immErr || !imm) {
      return NextResponse.json({ error: 'Immobile non trovato' }, { status: 404 })
    }

    const { data: rows } = await supabase
      .from('immobili_foto')
      .select('id, filename')
      .eq('immobile_id', immobileId)

    const oldAll = new Set<string>()
    if (imm.immaginecopertina) oldAll.add(imm.immaginecopertina)
    for (const r of rows ?? []) oldAll.add(r.filename)

    const newSet = new Set(order)
    for (const fn of oldAll) {
      if (!newSet.has(fn)) {
        await supabase.storage.from('immobili').remove([fn])
      }
    }

    for (const r of rows ?? []) {
      if (!newSet.has(r.filename)) {
        await supabase.from('immobili_foto').delete().eq('id', r.id)
      }
    }

    const cover = order[0]
    const gallery = order.slice(1)

    const { error: updErr } = await supabase
      .from('immobili')
      .update({ immaginecopertina: cover })
      .eq('id', immobileId)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    const { data: rowsAfter } = await supabase
      .from('immobili_foto')
      .select('id, filename')
      .eq('immobile_id', immobileId)

    for (let i = 0; i < gallery.length; i++) {
      const fn = gallery[i]
      const existing = rowsAfter?.find((r) => r.filename === fn)
      if (existing) {
        await supabase.from('immobili_foto').update({ ordine: i }).eq('id', existing.id)
      } else {
        await supabase.from('immobili_foto').insert({
          immobile_id: immobileId,
          filename: fn,
          ordine: i,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('sync-layout:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
