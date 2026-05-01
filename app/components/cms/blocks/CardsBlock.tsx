'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

type CardItem = { title?: string; body?: string; icon?: string; href?: string }

export default function CardsBlock({ block }: { block: Block }) {
  const p = block.props as {
    items?: CardItem[]
    columns?: number
    align?: string
    cardBackground?: string
    cardBorder?: string
  }
  const items = Array.isArray(p.items) ? p.items : []
  const align = (p.align as 'left' | 'center') || 'center'
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, p.columns ?? 3)}, minmax(0, 1fr))`,
        gap: '1.25rem',
        margin: '1.25rem 0',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {items.map((item, i) => (
        <article
          key={i}
          style={{
            background: p.cardBackground || '#f5f3f0',
            border: `1.5px solid ${p.cardBorder || '#e9e4dd'}`,
            borderRadius: '1.5rem',
            padding: '2rem',
            textAlign: align,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            alignItems: align === 'center' ? 'center' : 'flex-start',
            minHeight: 200,
          }}
        >
          {item.icon ? (
            <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
          ) : null}
          {item.title ? (
            <h3
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '1.18rem',
                fontWeight: 700,
                color: '#0c0c0a',
                margin: '0 0 .8rem',
                letterSpacing: '-.01em',
              }}
            >
              {item.title}
            </h3>
          ) : null}
          {item.body ? (
            <p style={{ color: '#6e6962', lineHeight: 1.75, margin: 0, fontSize: '.94rem' }}>{item.body}</p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
