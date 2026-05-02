'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  propertyMapEmbedSrc,
  propertyMapExternalHref,
} from '@/lib/propertyMapLinks'

type Props = {
  lat: number
  lng: number
  title: string
  isApproximate?: boolean
  /** Se approssimativo: centro mappa e embed sul comune, non sulle coordinate. */
  municipality?: string | null
  openMapsLabel: string
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const mapBoxStyle: CSSProperties = {
  width: '100%',
  height: '340px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1.5px solid var(--line, #e9e4dd)',
}

const linkRowStyle: CSSProperties = {
  marginTop: '0.65rem',
}

const linkStyle: CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.74rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'var(--tc, #c4622d)',
  textDecoration: 'none',
}

/** Mappa dettaglio: con posizione approssimativa + comune usa il paese per embed/link/centro, non lat/lng reali. */
export default function DetailMap({
  lat,
  lng,
  title,
  isApproximate = false,
  municipality,
  openMapsLabel,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ''
  const townMode = Boolean(isApproximate && municipality?.trim())

  const externalHref = propertyMapExternalHref(isApproximate, municipality, lat, lng)

  useEffect(() => {
    if (!apiKey) return
    const el = mapRef.current
    if (!el) return

    let cancelled = false

    setOptions({ key: apiKey, v: 'weekly' })

    async function resolveCenter(): Promise<{ lat: number; lng: number }> {
      const city = municipality?.trim()
      if (isApproximate && city) {
        try {
          const r = await fetch(`/api/geocode?q=${encodeURIComponent(`${city}, Italia`)}`)
          if (!r.ok) throw new Error('geocode')
          const d = await r.json()
          if (typeof d.lat === 'number' && typeof d.lng === 'number') {
            return { lat: d.lat, lng: d.lng }
          }
        } catch {
          /* fallback alle coordinate salvate */
        }
      }
      return { lat, lng }
    }

    importLibrary('maps').then(async () => {
      const center = await resolveCenter()
      if (cancelled || !mapRef.current || mapRef.current !== el) return

      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current)
        mapInstanceRef.current = null
      }
      infoWindowRef.current?.close()
      infoWindowRef.current = null
      el.replaceChildren()

      const zoomLevel = !isApproximate ? 15 : townMode ? 12 : 13

      const map = new google.maps.Map(el, {
        center,
        zoom: zoomLevel,
        scrollwheel: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
      })
      mapInstanceRef.current = map

      if (isApproximate) {
        const radiusM = townMode ? 2600 : 280
        const circle = new google.maps.Circle({
          center,
          radius: radiusM,
          strokeColor: '#c4622d',
          strokeWeight: 2,
          fillColor: '#c4622d',
          fillOpacity: 0.12,
          map,
        })
        const iw = new google.maps.InfoWindow({
          content: `<div style="padding:4px 2px;max-width:220px"><strong>${escapeHtml(title)}</strong><br><em>${
            townMode ? 'Zona comunale indicativa' : 'Posizione indicativa'
          }</em></div>`,
        })
        infoWindowRef.current = iw
        circle.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            iw.setPosition(e.latLng)
            iw.open({ map, anchor: undefined })
          }
        })
      } else {
        const pinSvg = encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path fill="#c4622d" stroke="#fff" stroke-width="3" d="M18 0C8 0 0 8 0 18c0 14 18 30 18 30s18-16 18-30C36 8 28 0 18 0z"/></svg>`
        )
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
            scaledSize: new google.maps.Size(36, 48),
            anchor: new google.maps.Point(18, 48),
          },
        })
        const iw = new google.maps.InfoWindow({
          content: `<div style="padding:4px 2px"><strong>${escapeHtml(title)}</strong></div>`,
        })
        infoWindowRef.current = iw
        marker.addListener('click', () => {
          iw.open({ map, anchor: marker })
        })
      }

      requestAnimationFrame(() => {
        if (!cancelled && mapInstanceRef.current === map) {
          try {
            google.maps.event.trigger(map, 'resize')
          } catch {
            /* noop */
          }
        }
      })
    })

    return () => {
      cancelled = true
      infoWindowRef.current?.close()
      infoWindowRef.current = null
      if (mapInstanceRef.current) {
        try {
          google.maps.event.clearInstanceListeners(mapInstanceRef.current)
        } catch {
          /* noop */
        }
        mapInstanceRef.current = null
      }
      if (mapRef.current) {
        try {
          mapRef.current.replaceChildren()
        } catch {
          /* noop */
        }
      }
    }
  }, [lat, lng, title, isApproximate, townMode, municipality, apiKey])

  const footer = (
    <div style={linkRowStyle}>
      <a href={externalHref} target="_blank" rel="noopener noreferrer" style={linkStyle}>
        {openMapsLabel} ↗
      </a>
    </div>
  )

  if (!apiKey) {
    return (
      <>
        <iframe
          title={title}
          src={propertyMapEmbedSrc(isApproximate, municipality, lat, lng)}
          style={{ ...mapBoxStyle, border: '1.5px solid var(--line, #e9e4dd)' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {footer}
      </>
    )
  }

  return (
    <>
      <div ref={mapRef} style={mapBoxStyle} />
      {footer}
    </>
  )
}
