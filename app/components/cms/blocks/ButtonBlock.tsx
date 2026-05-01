'use client'

import Link from 'next/link'
import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

const VARIANTS: Record<string, React.CSSProperties> = {
  primary: { background: '#c4622d', color: '#fff', border: '1.5px solid #c4622d' },
  ghost: { background: 'transparent', color: '#0c0c0a', border: '1.5px solid #0c0c0a' },
  'ghost-white': { background: 'transparent', color: '#fff', border: '1.5px solid #fff' },
}

export default function ButtonBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined>
  const variant = VARIANTS[p.variant || 'primary'] || VARIANTS.primary
  const align = (p.align as 'left' | 'center' | 'right') || 'left'
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

  const content = (
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
      {p.text || 'Pulsante'}
    </span>
  )

  return (
    <div data-block-id={block.id} data-cms-block style={{ display: 'flex', justifyContent: justify, margin: '0 0 1rem', ...buildLayoutStyle(block.layout) }}>
      {p.href ? (
        p.newTab === ('true' as unknown as string) ? (
          <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            {content}
          </a>
        ) : (
          <Link href={p.href} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        )
      ) : (
        content
      )}
    </div>
  )
}
