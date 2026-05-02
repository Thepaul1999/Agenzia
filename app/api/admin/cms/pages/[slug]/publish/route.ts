import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { publishPage } from '@/lib/cms/serverApi'
import { isAdminSession } from '@/lib/adminSession'

type Params = { params: Promise<{ slug: string }> }

async function ensureAdmin() {
  return isAdminSession()
}

export async function POST(_: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const { slug } = await params
  try {
    await publishPage(slug, null)
    // Best-effort revalidation of public pages.
    try {
      if (slug === 'home') revalidatePath('/')
      if (slug === 'immobili') revalidatePath('/immobili')
      if (slug === 'login') revalidatePath('/login')
    } catch {}
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
  }
}
