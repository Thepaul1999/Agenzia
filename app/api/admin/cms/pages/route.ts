import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { listPagesSummary } from '@/lib/cms/serverApi'

async function ensureAdmin() {
  const store = await cookies()
  return store.get('site_admin')?.value === 'true'
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const pages = await listPagesSummary()
  return NextResponse.json({ ok: true, pages })
}
