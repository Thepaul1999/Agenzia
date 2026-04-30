'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PropertyCardCarousel from './PropertyCardCarousel'

type Property = {
  id?: string | number
  titolo?: string
  slug?: string
  citta?: string | null
  prezzo?: number | string | null
  immaginecopertina?: string | null
  descrizione?: string | null
  featured?: boolean | null
  tipo_contratto?: string | null
  mq?: number | null
  locali?: number | null
}

type Photo = {
  id: string
  filename: string
  ordine: number
}

function formatEuro(value?: number | string | null) {
  if (value === undefined || value === null || value === '') return 'Prezzo su richiesta'
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const FALLBACK_IMAGE = '/images/hero/sfondo-home.jpg'

export default function PropertyCard({ property, index }: { property: Property; index: number }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  const slug = property.slug || String(property.id)
  const city = property.citta?.trim() || 'Monferrato'
  const title = property.titolo?.trim() || 'Immobile'
  const description = property.descrizione?.trim() || ''
  const price = formatEuro(property.prezzo)
  const isRent = property.tipo_contratto === 'affitto'
  const dClass = `au d${Math.min(index + 1, 4)}`

  // Carica le foto della galleria
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/admin/immobili/${property.id}/photos`)
        const data = await res.json()
        setPhotos(data.photos ?? [])
      } catch (err) {
        console.error('Error loading photos:', err)
      } finally {
        setLoading(false)
      }
    }
    if (property.id) {
      fetchPhotos()
    } else {
      setLoading(false)
    }
  }, [property.id])

  return (
    <Link href={`/immobili/${slug}`} className={`property-card ${dClass}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="property-image-shell">
        {!loading && (
          <PropertyCardCarousel
            coverImage={property.immaginecopertina ?? null}
            galleryPhotos={photos}
            title={title}
            supabaseUrl={SUPABASE_URL}
            fallbackImage={FALLBACK_IMAGE}
          />
        )}
        {property.featured && <div className="property-badge">★ In evidenza</div>}
        <div className={`property-badge-type property-badge-type--${isRent ? 'affitto' : 'vendita'}`}>
          {isRent ? 'Affitto' : 'Vendita'}
        </div>
        <div className="property-price">{price}</div>
      </div>
      <div className="property-content">
        <p className="property-city">{city}</p>
        <h3 className="property-title">{title}</h3>
        {description && <p className="property-description">{description}</p>}
        {(property.mq || property.locali) && (
          <div className="property-specs">
            {property.mq && <span>{property.mq} m²</span>}
            {property.locali && <span>{property.locali} loc.</span>}
          </div>
        )}
        <div className="property-footer">
          <span className="property-link">Scopri <span>→</span></span>
          <span className="property-meta">Monferrato</span>
        </div>
      </div>
    </Link>
  )
}
