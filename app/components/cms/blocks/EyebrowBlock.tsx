'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function EyebrowBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, unknown>
  return (
    <div data-block-id={block.id} data-cms-block style={{ marginBottom: '1rem', ...buildLayoutStyle(block.layout) }}>
      <span
        style={{
          display: 'inline-block',
          padding: '.3rem .85rem',
          borderRadius: 999,
          border: p.bordered === false ? 'none' : `1px solid ${p.color ?? '#c4622d'}`,
          color: (p.color as string) || '#c4622d',
          fontFamily: 'Syne, sans-serif',
          fontSize: '.7rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}
      >
        {String(p.text ?? '')}
      </span>
    </div>
  )
}
