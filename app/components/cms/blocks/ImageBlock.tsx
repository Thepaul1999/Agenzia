'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function ImageBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined | boolean>
  const ratio = (p.ratio as string) || '16 / 9'
  const radius = (p.rounded as string) || '0'
  const fit = (p.objectFit as 'cover' | 'contain') || 'cover'
  const pos = (p.objectPosition as string) || 'center'
  const shadow = p.shadow !== false

  return (
    <figure
      data-block-id={block.id}
      data-cms-block
      style={{
        margin: '0 0 1rem',
        width: '100%',
        ...buildLayoutStyle(block.layout),
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: ratio,
          borderRadius: radius,
          overflow: 'hidden',
          background: '#ece7e1',
          boxShadow: shadow ? '0 12px 40px rgba(12,12,10,.16)' : 'none',
        }}
      >
        {p.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src as string}
            alt={(p.alt as string) || ''}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: pos }}
          />
        ) : null}
      </div>
    </figure>
  )
}
