'use client'

import Link from 'next/link'
import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

const VARIANTS: Record<string, React.CSSProperties> = {
  primary: { background: '#c4622d', color: '#fff', border: '1.5px solid #c4622d' },
  ghost: { background: 'transparent', color: '#0c0c0a', border: '1.5px solid #0c0c0a' },
  'ghost-white': { background: 'transparent', color: '#fff', border: '1.5px solid #fff' },
}

type ButtonItem = { text: string; href?: string; variant?: string; newTab?: boolean }

export default function ButtonGroupBlock({ block }: { block: Block }) {
  const p = block.props as { buttons?: ButtonItem[]; align?: string; gap?: string }
  const buttons = Array.isArray(p.buttons) ? p.buttons : []
  const align = (p.align as 'left' | 'center' | 'right') || 'left'
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{ display: 'flex', flexWrap: 'wrap', gap: p.gap || '1rem', justifyContent: justify, margin: '1.5rem 0', ...buildLayoutStyle(block.layout) }}
    >
      {buttons.map((b, i) => {
        const variant = VARIANTS[b.variant || 'primary'] || VARIANTS.primary
        const inner = (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 42,
              padding: '.65rem 1.25rem',
              borderRadius: 999,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '.74rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              ...variant,
            }}
          >
            {b.text}
          </span>
        )
        if (!b.href) return <span key={i}>{inner}</span>
        if (b.newTab) {
          return (
            <a key={i} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              {inner}
            </a>
          )
        }
        return (
          <Link key={i} href={b.href} style={{ textDecoration: 'none' }}>
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
