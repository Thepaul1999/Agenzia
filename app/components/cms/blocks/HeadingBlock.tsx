'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

const SIZES: Record<string, string> = {
  h1: 'clamp(2.4rem, 5vw, 4.4rem)',
  h2: 'clamp(2rem, 4vw, 3.1rem)',
  h3: 'clamp(1.4rem, 2.6vw, 2rem)',
  h4: '1.25rem',
}

export default function HeadingBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined>
  const Tag = (p.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4'
  const size = p.size || SIZES[Tag]
  const align = (p.align || 'left') as React.CSSProperties['textAlign']
  return (
    <Tag
      data-block-id={block.id}
      data-cms-block
      style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        lineHeight: 1.18,
        letterSpacing: '-.02em',
        fontSize: size,
        color: p.color || '#0c0c0a',
        margin: '0 0 1rem',
        textAlign: align,
        ...buildLayoutStyle(block.layout),
      }}
    >
      {p.text}
      {p.accentText && (
        <>
          <br />
          <span style={{ color: p.accentColor || '#c4622d' }}>{p.accentText}</span>
        </>
      )}
    </Tag>
  )
}
