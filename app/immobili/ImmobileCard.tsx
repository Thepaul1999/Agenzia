'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { translations } from '@/lib/language'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function imgUrl(src: string | null) {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('/')) return src
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${src}`
}

function fmt(v: number | null) {
  if (v === null) return null
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

type TR = { [K in keyof typeof translations.it]: string }
type CardItem = {
  id: string
  titolo: string
  titolo_en?: string | null
  slug: string
  citta: string | null
  prezzo: number | null
  immaginecopertina: string | null
  descrizione: string | null
  descrizione_en?: string | null
  featured: boolean
  stato: string
  mq: number | null
  locali: number | null
  tipo_contratto: string | null
}

export default function ImmobileCard({ item, sold = false, isAdmin = false, lang, t }: {
  item: CardItem
  sold?: boolean
  isAdmin?: boolean
  lang: 'it' | 'en'
  t: TR
}) {
  const src = imgUrl(item.immaginecopertina)
  const isRent = item.tipo_contratto === 'affitto'
  const title = lang === 'en' && item.titolo_en ? item.titolo_en : item.titolo
  const desc = lang === 'en' && item.descrizione_en ? item.descrizione_en : item.descrizione
  const price = fmt(item.prezzo)

  return (
    <Link href={`/immobili/${item.slug}`} className={`imm-card${sold ? ' is-sold' : ''}`}>
      <div className="imm-card-img">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width:680px) 100vw,(max-width:1024px) 50vw,33vw"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e9e4dd,#d5cfc7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', opacity: .35 }}>🏠</span>
          </div>
        )}

        {item.featured && !sold && <span className="imm-badge imm-badge-featured">★ {t.featured}</span>}
        {sold && <span className="imm-badge imm-badge-sold">{t.sold}</span>}
        {!sold && (
          <span className={`imm-badge imm-badge-tipo imm-badge-tipo--${isRent ? 'affitto' : 'vendita'}`}>
            {isRent ? t.contractRent : t.contractSale}
          </span>
        )}
        <span className="imm-price-badge">{price ?? t.priceOnRequest}</span>

        {isAdmin && (
          <a
            href={`/admin/immobili/${item.id}`}
            onClick={e => e.stopPropagation()}
            className="imm-card-edit-btn"
          >
            ✏️ Modifica
          </a>
        )}
      </div>

      <div className="imm-card-body">
        {item.citta && <p className="imm-card-city">{item.citta}</p>}
        <h3 className="imm-card-title">{title}</h3>
        {(item.mq || item.locali) && (
          <div className="imm-card-specs">
            {item.mq && <span>📐 {item.mq} m²</span>}
            {item.locali && <span>🚪 {item.locali} {t.rooms.toLowerCase()}</span>}
          </div>
        )}
        {desc && <p className="imm-card-desc">{desc}</p>}
        <div className="imm-card-foot">
          <span className="imm-card-cta">{sold ? t.viewCTA : t.discoverCTA}</span>
          <span className="imm-card-loc">Monferrato</span>
        </div>
      </div>
    </Link>
  )
}
