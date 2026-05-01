'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function TextBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined>
  return (
    <p
      data-block-id={block.id}
      data-cms-block
      style={{
        fontFamily: 'Manrope, sans-serif',
        color: p.color || '#7c7770',
        fontSize: p.size || '1rem',
        lineHeight: 1.75,
        textAlign: (p.align as React.CSSProperties['textAlign']) || 'left',
        maxWidth: p.maxWidth || '36rem',
        margin: '0 0 1.2rem',
        whiteSpace: 'pre-wrap',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {p.text}
    </p>
  )
}
