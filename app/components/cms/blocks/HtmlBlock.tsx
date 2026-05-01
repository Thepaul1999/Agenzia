'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

function sanitize(html: string) {
  // Remove <script> tags and inline event handlers as a basic guard.
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/ on[a-z]+="[^"]*"/gi, '')
    .replace(/ on[a-z]+='[^']*'/gi, '')
}

export default function HtmlBlock({ block }: { block: Block }) {
  const p = block.props as { html?: string }
  const html = sanitize(p.html ?? '')
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{ ...buildLayoutStyle(block.layout) }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
