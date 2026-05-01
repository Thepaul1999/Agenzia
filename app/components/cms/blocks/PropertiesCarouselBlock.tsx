'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import PropertyCard from '@/app/components/PropertyCard'
import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'
import type { PageRenderContext } from '../PageRenderer'

type Props = { block: Block; context: PageRenderContext }

export default function PropertiesCarouselBlock({ block, context }: Props) {
  const p = block.props as {
    filter?: 'featured' | 'all' | 'sale' | 'rent'
    limit?: number
    showFilters?: boolean
    showCta?: boolean
  }
  const list = context.immobili ?? []
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeFilter, setActiveFilter] = useState<'tutti' | 'vendita' | 'affitto'>('tutti')

  const filtered = useMemo(() => {
    let items = list.slice()
    if (p.filter === 'featured') items = items.filter((i) => i.featured)
    if (p.filter === 'sale') items = items.filter((i) => i.tipo_contratto === 'vendita')
    if (p.filter === 'rent') items = items.filter((i) => i.tipo_contratto === 'affitto')
    if (activeFilter !== 'tutti') items = items.filter((i) => i.tipo_contratto === activeFilter)
    if (p.limit) items = items.slice(0, p.limit)
    return items
  }, [list, p.filter, p.limit, activeFilter])

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.property-card')
    const cardWidth = (card?.offsetWidth ?? 300) + 24
    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
  }

  return (
    <div data-block-id={block.id} data-cms-block style={{ ...buildLayoutStyle(block.layout) }}>
      {(p.showFilters || p.showCta) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          {p.showFilters && (
            <div style={{ display: 'inline-flex', gap: '.25rem', padding: '.25rem', background: '#f5f3f0', border: '1.5px solid #e9e4dd', borderRadius: 999 }}>
              {(['tutti', 'vendita', 'affitto'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '.38rem 1rem',
                    borderRadius: 999,
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '.7rem',
                    fontWeight: 700,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeFilter === f ? '#0c0c0a' : 'transparent',
                    color: activeFilter === f ? '#fff' : '#7c7770',
                  }}
                >
                  {f === 'tutti' ? 'Tutti' : f === 'vendita' ? 'Vendita' : 'Affitto'}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
            <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Precedente" style={navBtnStyle}>←</button>
            <button type="button" onClick={() => scrollCarousel(1)} aria-label="Successivo" style={navBtnStyle}>→</button>
          </div>
          {p.showCta && (
            <Link href="/immobili" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '.65rem 1.2rem', borderRadius: 999,
                fontFamily: 'Syne, sans-serif', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em',
                textTransform: 'uppercase', border: '1.5px solid #0c0c0a', color: '#0c0c0a',
              }}>Vedi tutti →</span>
            </Link>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding: '2rem', border: '1.5px dashed #e9e4dd', borderRadius: 18, color: '#7c7770', textAlign: 'center' }}>
          Nessun immobile pubblicato.
        </div>
      ) : (
        <div
          ref={carouselRef}
          className="property-carousel"
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            paddingBottom: '.5rem',
          }}
        >
          {filtered.map((property, idx) => (
            <div key={String(property.id ?? idx)} style={{ flex: '0 0 calc(33.33% - 1rem)', minWidth: 260, scrollSnapAlign: 'start' }}>
              <PropertyCard property={property} index={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  border: '1.5px solid #e9e4dd',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '1rem',
  color: '#0c0c0a',
}
