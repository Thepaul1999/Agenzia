import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cookies } from 'next/headers'

const FILE_PATH = path.join(process.cwd(), 'editor-data', 'home-content.json')

export async function GET() {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const raw = await fs.readFile(FILE_PATH, 'utf8').catch(() => '{}')
    const data = JSON.parse(raw)
    return NextResponse.json({ ok: true, data })
  } catch {
    return NextResponse.json({ ok: false, error: 'Errore lettura contenuto home' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('site_admin')?.value === 'true'
    if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const body = await request.json()
    const data = body?.data ?? {}

    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf8')

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Errore salvataggio contenuto home' }, { status: 500 })
  }
}
