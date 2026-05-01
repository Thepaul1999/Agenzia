import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { listRevisions, revertToRevision } from '@/lib/cms/serverApi'

type Params = { params: Promise<{ slug: string }> }

async function ensureAdmin() {
  const store = await cookies()
  return store.get('site_admin')?.value === 'true'
}

export async function GET(_: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  const revisions = await listRevisions(slug)
  return NextResponse.json({ ok: true, revisions })
}

export async function POST(request: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  const body = await request.json().catch(() => ({}))
  if (!body?.revisionId) {
    return NextResponse.json({ error: 'revisionId mancante' }, { status: 400 })
  }
  try {
    await revertToRevision(slug, body.revisionId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
  }
}
