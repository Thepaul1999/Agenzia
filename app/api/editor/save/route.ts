import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { page, data } = body

    const outDir = path.join(process.cwd(), 'editor-data')
    await fs.mkdir(outDir, { recursive: true })

    const filePath = path.join(outDir, `${page}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}