'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import RemoveFromFeaturedButton from '@/app/immobili/RemoveFromFeaturedButton'
import type { translations } from '@/lib/language'
import ImmobileCardCarousel from './ImmobileCardCarousel'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

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

type Photo = {
  id: string
  filename: string
  ordine: number
}

export default function ImmobileCard({
  item,
  sold = false,
  isAdmin = false,
  lang,
  t,
  propertyBasePath = '/immobili',
}: {
  item: CardItem
  sold?: boolean
  isAdmin?: boolean
  lang: 'it' | 'en'
  t: TR
  /** Base URL scheda (cliente `/immobili`, admin `/admin/immobili`) */
  propertyBasePath?: string
}) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredUi, setFeaturedUi] = useState(item.featured)

  useEffect(() => {
    setFeaturedUi(item.featured)
  }, [item.featured, item.id])

  const isRent = item.tipo_contratto === 'affitto'
  const title = lang === 'en' && item.titolo_en ? item.titolo_en : item.titolo
  const desc = lang === 'en' && item.descrizione_en ? item.descrizione_en : item.descrizione
  const price = fmt(item.prezzo)

  // Carica le foto della galleria
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/admin/immobili/${item.id}/photos`)
        const data = await res.json()
        setPhotos(data.photos ?? [])
      } catch (err) {
        console.error('Error loading photos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [item.id])

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `/admin/immobili/gestione?id=${encodeURIComponent(item.id)}`
  }

  return (
    <Link href={`${propertyBasePath}/${item.slug}`} className={`imm-card${sold ? ' is-sold' : ''}`}>
      <div className="imm-card-img">
        {!loading && (
          <ImmobileCardCarousel
            coverImage={item.immaginecopertina}
            galleryPhotos={photos}
            title={title}
            supabaseUrl={SUPABASE_URL}
          />
        )}

        {featuredUi && !sold && <span className="imm-badge imm-badge-featured">★ {t.featured}</span>}
        {sold && <span className="imm-badge imm-badge-sold">{t.sold}</span>}
        {!sold && (
          <span className={`imm-badge imm-badge-tipo imm-badge-tipo--${isRent ? 'affitto' : 'vendita'}`}>
            {isRent ? t.contractRent : t.contractSale}
          </span>
        )}
        <span className="imm-price-badge">{price ?? t.priceOnRequest}</span>

        {isAdmin && (
          <div className="imm-card-admin-actions">
            {featuredUi && !sold && (
              <RemoveFromFeaturedButton
                immobileId={item.id}
                onRemoved={() => setFeaturedUi(false)}
                className="imm-card-unfeature-btn"
              />
            )}
            <button
              onClick={handleEditClick}
              className="imm-card-edit-btn"
              type="button"
              aria-label="Modifica proprietà"
            >
              ✏️ Modifica
            </button>
          </div>
        )}
      </div>

      <div className="imm-card-body">
        {item.citta && <p className="imm-card-city">{item.citta}</p>}
        <h3 className="imm-card-title">{title}</h3>
        {(item.mq || item.locali) && (
          <div className="imm-card-specs">
            {item.mq && (
              <span className="imm-card-spec">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                {item.mq} m²
              </span>
            )}
            {item.locali && (
              <span className="imm-card-spec">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {item.locali} {t.rooms.toLowerCase()}
              </span>
            )}
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
