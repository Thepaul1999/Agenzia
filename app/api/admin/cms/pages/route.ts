import { NextResponse } from 'next/server'
import { listPagesSummary } from '@/lib/cms/serverApi'
import { isAdminSession } from '@/lib/adminSession'

async function ensureAdmin() {
  return isAdminSession()
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  const pages = await listPagesSummary()
  return NextResponse.json({ ok: true, pages })
}
