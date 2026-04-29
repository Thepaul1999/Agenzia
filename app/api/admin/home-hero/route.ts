// app/api/admin/home-hero/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { data: adminRow, error: adminError } = await supabase
      .from('admin_users')
      .select('id, active, role')
      .eq('id', user.id)
      .maybeSingle()

    if (
      adminError ||
      !adminRow ||
      adminRow.active !== true ||
      adminRow.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = await req.json()

    const payload = {
      title: String(body.title ?? '').trim(),
      subtitle: String(body.subtitle ?? '').trim(),
      buttonText: String(body.buttonText ?? '').trim(),
      buttonHref: String(body.buttonHref ?? '').trim(),
      backgroundImage: String(body.backgroundImage ?? '').trim(),
    }

    if (!payload.title || !payload.subtitle || !payload.buttonText || !payload.buttonHref) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    const { error: upsertError } = await supabase
      .from('site_content')
      .upsert(
        {
          key: 'home_hero',
          value: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, key: 'home_hero' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}