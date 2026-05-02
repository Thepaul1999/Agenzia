import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

const FILE_PATH = path.join(process.cwd(), 'editor-data', 'home-content.json')

/** Testi pubblici modificabili da admin (nessun dato sensibile). */
export async function GET() {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8').catch(() => '{}')
    const data = JSON.parse(raw) as Record<string, unknown>
    return NextResponse.json({
      contactCopy: typeof data.contactCopy === 'string' ? data.contactCopy : '',
      footerTagline: typeof data.footerTagline === 'string' ? data.footerTagline : '',
    })
  } catch {
    return NextResponse.json({ contactCopy: '', footerTagline: '' })
  }
}
