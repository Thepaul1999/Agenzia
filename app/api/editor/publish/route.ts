import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const html = body?.html ?? ''
    const css = body?.css ?? ''

    const outDir = path.join(process.cwd(), 'public', 'published')
    await fs.mkdir(outDir, { recursive: true })

    const fullHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sito pubblicato</title>
  <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`

    await fs.writeFile(
      path.join(outDir, 'index.html'),
      fullHtml,
      'utf8'
    )

    return NextResponse.json({
      ok: true,
      url: '/published/index.html',
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: 'Publish failed' },
      { status: 500 }
    )
  }
}