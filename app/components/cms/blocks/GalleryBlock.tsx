'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

type Img = { src: string; alt?: string }

export default function GalleryBlock({ block }: { block: Block }) {
  const p = block.props as { images?: Img[]; columns?: number; gap?: string; ratio?: string }
  const images = Array.isArray(p.images) ? p.images : []
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, p.columns ?? 3)}, minmax(0, 1fr))`,
        gap: p.gap || '1rem',
        margin: '1rem 0',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: p.ratio || '4 / 3',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#ece7e1',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt ?? ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>
  )
}
