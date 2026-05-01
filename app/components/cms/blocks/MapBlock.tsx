'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function MapBlock({ block }: { block: Block }) {
  const p = block.props as { lat?: number; lng?: number; zoom?: number; height?: string; title?: string }
  const lat = p.lat ?? 45.04
  const lng = p.lng ?? 8.4
  const zoom = p.zoom ?? 12
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.06},${lat - 0.04},${lng + 0.06},${lat + 0.04}&layer=mapnik&marker=${lat},${lng}`
  return (
    <div
      data-block-id={block.id}
      data-cms-block
      style={{
        position: 'relative',
        width: '100%',
        height: p.height || '420px',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '1.5px solid #e9e4dd',
        ...buildLayoutStyle(block.layout),
      }}
    >
      <iframe
        title={p.title || 'Mappa'}
        src={src}
        style={{ width: '100%', height: '100%', border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: 'Syne, sans-serif', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#0c0c0a', background: '#fff', padding: '.35rem .8rem', borderRadius: 999, border: '1.5px solid #e9e4dd' }}>
        zoom {zoom}
      </div>
    </div>
  )
}
