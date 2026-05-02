import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/server'

async function ensureAdmin() {
  const store = await cookies()
  return store.get('site_admin')?.value === 'true'
}

// POST /api/admin/translations
// Body: { changes: { it: { key: value }, en: { key: value } } }
export async function POST(req: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await req.json() as {
    changes: Record<string, Record<string, string>>
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const rows: { lang: string; key: string; value: string; updated_at: string }[] =
    []

  for (const [lang, keys] of Object.entries(body.changes ?? {})) {
    for (const [key, value] of Object.entries(keys)) {
      if (typeof value === 'string') {
        rows.push({ lang, key, value, updated_at: now })
      }
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  const { error } = await supabase
    .from('site_translations')
    .upsert(rows, { onConflict: 'lang,key' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated: rows.length })
}
