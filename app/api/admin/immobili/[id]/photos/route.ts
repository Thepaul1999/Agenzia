import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id: immobileId } = await params
    const supabase = createAdminClient()

    const { data: photos, error } = await supabase
      .from('immobili_foto')
      .select('id, filename, ordine')
      .eq('immobile_id', immobileId)
      .order('ordine', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photos: photos || [] })
  } catch (err) {
    console.error('Get photos error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
