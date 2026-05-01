'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

type T = { text?: string; role?: string; initial?: string }

export default function TestimonialsBlock({ block }: { block: Block }) {
  const p = block.props as { items?: T[]; columns?: number }
  const items = Array.isArray(p.items) ? p.items : []
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, p.columns ?? 3)}, minmax(0, 1fr))`,
        gap: '1.25rem',
        margin: '1rem 0',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {items.map((q, i) => (
        <blockquote
          key={i}
          style={{
            margin: 0,
            padding: '2rem',
            borderRadius: '1.5rem',
            background: '#f5f3f0',
            border: '1.5px solid #e9e4dd',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          {q.initial ? (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#c4622d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                color: '#fff',
                fontSize: '.75rem',
              }}
            >
              {q.initial}
            </div>
          ) : null}
          <p style={{ color: '#0c0c0a', lineHeight: 1.75, fontSize: '.95rem', margin: 0 }}>“{q.text}”</p>
          {q.role ? <footer style={{ color: '#7c7770', fontSize: '.78rem' }}>{q.role}</footer> : null}
        </blockquote>
      ))}
    </div>
  )
}
