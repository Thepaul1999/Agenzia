'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

type StatItem = { n?: string; suffix?: string; label?: string }

export default function StatsBlock({ block }: { block: Block }) {
  const p = block.props as { items?: StatItem[] }
  const items = Array.isArray(p.items) ? p.items : []
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, items.length || 1)}, minmax(0, 1fr))`,
        gap: '1rem',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{ borderTop: '1px solid #e9e4dd', padding: '1.5rem 1.25rem', textAlign: 'center' }}
        >
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              lineHeight: 1,
              color: '#0c0c0a',
              letterSpacing: '-.03em',
            }}
          >
            {item.n}
            <span>{item.suffix}</span>
          </div>
          <div style={{ marginTop: '.7rem', fontSize: '.82rem', color: '#7c7770', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
