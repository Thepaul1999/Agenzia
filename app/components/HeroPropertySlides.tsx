'use client'

import Link from 'next/link'
import Image from 'next/image'
import { translations } from '@/lib/language'
import type { Lang } from '@/lib/language'

export type HeroSlideItem = {
  id?: string | number
  titolo?: string
  slug?: string
  citta?: string | null
  prezzo?: number | string | null
  immaginecopertina?: string | null
  featured?: boolean | null
  tipo_contratto?: string | null
  mq?: number | null
  locali?: number | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function coverUrl(p: string) {
  if (p.startsWith('http') || p.startsWith('/')) return p
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${p}`
}

function formatPrice(value: number | string | null | undefined, onRequest: string) {
  if (value === undefined || value === null || value === '') return onRequest
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

/**
 * Slide degli immobili sopra l'immagine della hero.
 * `active` = 0 → slide di benvenuto (testo della hero); 1..N → immobili.
 */
export default function HeroPropertySlides({
  items,
  active,
  total,
  lang,
  basePath,
  onSelect,
}: {
  items: HeroSlideItem[]
  active: number
  total: number
  lang: Lang
  basePath: string
  onSelect: (index: number) => void
}) {
  const t = translations[lang]
  const en = lang === 'en'
  const go = (i: number) => onSelect(((i % total) + total) % total)

  return (
    <div className="hps" role="region" aria-roledescription="carousel" aria-label={en ? 'Featured properties' : 'Immobili in evidenza'}>
      {items.map((p, i) => {
        const n = i + 1
        const isActive = active === n
        const isRent = p.tipo_contratto === 'affitto'
        const slug = p.slug || String(p.id)
        const specs = [p.mq ? `${p.mq} m²` : '', p.locali ? `${p.locali} ${en ? 'rooms' : 'locali'}` : ''].filter(Boolean)
        return (
          <Link
            key={slug}
            href={`${basePath}/${slug}`}
            prefetch={false}
            className={`hps-slide${isActive ? ' is-active' : ''}`}
            tabIndex={isActive ? 0 : -1}
            aria-hidden={!isActive}
            aria-label={`${p.titolo ?? ''} — ${t.discover}`}
          >
            <Image
              src={coverUrl(p.immaginecopertina as string)}
              alt=""
              fill
              sizes="100vw"
              priority={n === 1}
              className="hps-img"
            />
            <div className="hps-shade" />
            <div className="site-width hps-caption-wrap">
              <div className="hps-caption">
                <span className="hps-badges">
                  <span className="hps-badge">{isRent ? t.contractRent : t.contractSale}</span>
                  {p.featured ? <span className="hps-badge hps-badge--star">★ {t.featured}</span> : null}
                </span>
                <h2 className="hps-title">{p.titolo}</h2>
                <p className="hps-meta">
                  {[p.citta?.trim(), ...specs].filter(Boolean).join(' · ')}
                </p>
                <p className="hps-price">{formatPrice(p.prezzo, t.priceOnRequest)}</p>
                <span className="hps-cta">
                  {t.discover} <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </Link>
        )
      })}

      <div className="hps-ctrl" role="group" aria-label={en ? 'Slider controls' : 'Controlli slider'}>
        <button type="button" className="hps-arrow" aria-label={en ? 'Previous' : 'Precedente'} onClick={() => go(active - 1)}>←</button>
        <div className="hps-dots">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hps-dot${active === i ? ' is-active' : ''}`}
              aria-label={`${en ? 'Slide' : 'Diapositiva'} ${i + 1}`}
              aria-current={active === i}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="hps-arrow" aria-label={en ? 'Next' : 'Successivo'} onClick={() => go(active + 1)}>→</button>
      </div>
    </div>
  )
}
