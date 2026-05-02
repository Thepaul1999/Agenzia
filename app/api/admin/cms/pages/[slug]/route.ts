import { NextResponse } from 'next/server'
import { ensurePageRow, getDraftPageContent, saveDraft, resetDraftToDefault } from '@/lib/cms/serverApi'
import { validatePageContent } from '@/lib/cms/validate'
import { isAdminSession } from '@/lib/adminSession'

type Params = { params: Promise<{ slug: string }> }

async function ensureAdmin() {
  return isAdminSession()
}

export async function GET(_: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  const content = await getDraftPageContent(slug)
  return NextResponse.json({ ok: true, slug, content })
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  try {
    const body = await request.json()
    const content = validatePageContent(body?.content)
    await saveDraft(slug, content)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  const body = await request.json().catch(() => ({}))
  if (body?.action === 'reset') {
    try {
      await resetDraftToDefault(slug)
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
    }
  }
  if (body?.action === 'init') {
    try {
      await ensurePageRow(slug)
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Azione non riconosciuta' }, { status: 400 })
}
