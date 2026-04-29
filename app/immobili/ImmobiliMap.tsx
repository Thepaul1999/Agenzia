'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

type MapItem = {
  id: string
  titolo: string
  slug: string
  citta: string | null
  prezzo: number | null
  lat: number
  lng: number
  immaginecopertina: string | null
  tipo_contratto: string | null
  featured: boolean
  stato: string
}

type Props = {
  items: MapItem[]
  supabaseUrl: string
}

function fmt(v: number | null) {
  if (v === null) return 'Prezzo su richiesta'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function imgUrl(src: string | null, supabaseUrl: string) {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('/')) return src
  return `${supabaseUrl}/storage/v1/object/public/immobili/${src}`
}

export default function ImmobiliMap({ items, supabaseUrl }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markersLayer = useRef<any>(null)
  const [selected, setSelected] = useState<MapItem | null>(null)
  const [inBounds, setInBounds] = useState<MapItem[]>(items)
  const [searchMode, setSearchMode] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const updateInBounds = useCallback(() => {
    if (!leafletMap.current || !searchMode) return
    const bounds = leafletMap.current.getBounds()
    setInBounds(items.filter(item => bounds.contains([item.lat, item.lng])))
  }, [items, searchMode])

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Center on Monferrato area
      const center = items.length > 0
        ? [
            items.reduce((s, i) => s + i.lat, 0) / items.length,
            items.reduce((s, i) => s + i.lng, 0) / items.length,
          ]
        : [44.9, 8.4] // Monferrato default

      const map = L.map(mapRef.current!, {
        center: center as [number, number],
        zoom: items.length > 0 ? 11 : 10,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const layer = L.layerGroup().addTo(map)
      markersLayer.current = layer

      leafletMap.current = map
      setMapReady(true)

      map.on('moveend zoomend', () => {
        if (searchMode) updateInBounds()
      })
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-bind moveend when searchMode changes
  useEffect(() => {
    if (!leafletMap.current || !mapReady) return
    leafletMap.current.off('moveend zoomend')
    leafletMap.current.on('moveend zoomend', () => {
      if (searchMode) {
        const bounds = leafletMap.current.getBounds()
        setInBounds(items.filter((item: MapItem) => bounds.contains([item.lat, item.lng])))
      }
    })
  }, [searchMode, items, mapReady])

  // Draw markers when map ready or items change
  useEffect(() => {
    if (!mapReady || !leafletMap.current || !markersLayer.current) return

    import('leaflet').then(L => {
      markersLayer.current.clearLayers()

      items.forEach(item => {
        const isSold = item.stato === 'venduto'
        const isRent = item.tipo_contratto === 'affitto'

        const color = isSold ? '#c0392b' : isRent ? '#1a6e8e' : '#c4622d'
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${color};
            color:#fff;
            font-family:'Syne',sans-serif;
            font-size:.65rem;
            font-weight:800;
            padding:.28rem .55rem;
            border-radius:999px;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
            border:2px solid #fff;
            cursor:pointer;
          ">${isSold ? 'Venduto' : fmt(item.prezzo)}</div>`,
          iconAnchor: [0, 0],
        })

        const marker = L.marker([item.lat, item.lng], { icon })
          .addTo(markersLayer.current)
          .on('click', () => setSelected(item))
      })
    })
  }, [items, mapReady])

  const activateSearchArea = () => {
    setSearchMode(true)
    if (leafletMap.current) {
      const bounds = leafletMap.current.getBounds()
      setInBounds(items.filter((item: MapItem) => bounds.contains([item.lat, item.lng])))
    }
  }

  const resetSearch = () => {
    setSearchMode(false)
    setInBounds(items)
  }

  const visibleItems = searchMode ? inBounds : items

  return (
    <>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="immmap-wrap">
        {/* Left panel: property list */}
        <div className="immmap-list">
          <div className="immmap-list-head">
            <span className="immmap-list-count">
              {visibleItems.length} immobil{visibleItems.length === 1 ? 'e' : 'i'}
              {searchMode ? ' in questa zona' : ''}
            </span>
            {!searchMode ? (
              <button className="immmap-search-btn" onClick={activateSearchArea}>
                🔍 Cerca in questa zona
              </button>
            ) : (
              <button className="immmap-reset-btn" onClick={resetSearch}>
                ✕ Mostra tutti
              </button>
            )}
          </div>

          <div className="immmap-cards">
            {visibleItems.length === 0 && (
              <div className="immmap-empty">
                <p>Nessun immobile in questa zona.</p>
                <p>Sposta la mappa per cercare altrove.</p>
              </div>
            )}
            {visibleItems.map(item => {
              const src = imgUrl(item.immaginecopertina, supabaseUrl)
              const isSold = item.stato === 'venduto'
              const isRent = item.tipo_contratto === 'affitto'
              const isActive = selected?.id === item.id
              return (
                <Link
                  key={item.id}
                  href={`/immobili/${item.slug}`}
                  className={`immmap-card${isActive ? ' immmap-card--active' : ''}${isSold ? ' immmap-card--sold' : ''}`}
                  onClick={() => {
                    setSelected(item)
                    if (leafletMap.current) {
                      leafletMap.current.setView([item.lat, item.lng], 15, { animate: true })
                    }
                  }}
                >
                  <div className="immmap-card-img">
                    {src
                      ? <img src={src} alt={item.titolo} />
                      : <div className="immmap-card-img-ph">🏠</div>
                    }
                    <span className={`immmap-tipo immmap-tipo--${isSold ? 'sold' : isRent ? 'affitto' : 'vendita'}`}>
                      {isSold ? 'Venduto' : isRent ? 'Affitto' : 'Vendita'}
                    </span>
                  </div>
                  <div className="immmap-card-body">
                    {item.citta && <p className="immmap-card-city">{item.citta}</p>}
                    <p className="immmap-card-title">{item.titolo}</p>
                    <p className="immmap-card-price">{fmt(item.prezzo)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: map */}
        <div className="immmap-map-col">
          {searchMode && (
            <div className="immmap-map-banner">
              Sposta o ingrandisci la mappa — la lista si aggiorna automaticamente
            </div>
          )}
          <div ref={mapRef} className="immmap-map" />
        </div>
      </div>

      <style>{`
        .immmap-wrap {
          display: grid;
          grid-template-columns: 380px 1fr;
          height: calc(100vh - 130px);
          min-height: 500px;
          overflow: hidden;
        }
        .immmap-list {
          display: flex;
          flex-direction: column;
          border-right: 1.5px solid var(--line);
          background: var(--bg);
          overflow: hidden;
        }
        .immmap-list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          padding: 1rem 1.2rem;
          border-bottom: 1px solid var(--line);
          background: #fff;
          flex-shrink: 0;
        }
        .immmap-list-count {
          font-family: 'Syne', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--mid);
        }
        .immmap-search-btn, .immmap-reset-btn {
          font-family: 'Syne', sans-serif;
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          padding: .38rem .85rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background .18s, color .18s;
          white-space: nowrap;
        }
        .immmap-search-btn {
          background: var(--ink);
          color: #fff;
          border: none;
        }
        .immmap-search-btn:hover { background: var(--tc); }
        .immmap-reset-btn {
          background: transparent;
          color: #c0392b;
          border: 1.5px solid #c0392b;
        }
        .immmap-reset-btn:hover { background: #c0392b; color: #fff; }
        .immmap-cards {
          flex: 1;
          overflow-y: auto;
          padding: .75rem;
          display: flex;
          flex-direction: column;
          gap: .6rem;
        }
        .immmap-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--mid);
          font-size: .88rem;
          line-height: 1.7;
        }
        .immmap-card {
          display: flex;
          gap: .75rem;
          align-items: center;
          background: #fff;
          border: 1.5px solid var(--line);
          border-radius: 14px;
          padding: .65rem;
          text-decoration: none;
          color: inherit;
          transition: border-color .18s, box-shadow .18s;
          cursor: pointer;
        }
        .immmap-card:hover, .immmap-card--active {
          border-color: var(--tc);
          box-shadow: 0 4px 16px rgba(196,98,45,.12);
        }
        .immmap-card--sold { opacity: .65; }
        .immmap-card-img {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--warm);
          position: relative;
        }
        .immmap-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .immmap-card-img-ph {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; opacity: .35;
        }
        .immmap-tipo {
          position: absolute;
          bottom: .2rem; left: .2rem;
          font-family: 'Syne', sans-serif;
          font-size: .55rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          padding: .18rem .45rem;
          border-radius: 999px;
          color: #fff;
        }
        .immmap-tipo--vendita { background: var(--tc); }
        .immmap-tipo--affitto { background: #1a6e8e; }
        .immmap-tipo--sold { background: #c0392b; }
        .immmap-card-body { flex: 1; min-width: 0; }
        .immmap-card-city {
          font-family: 'Syne', sans-serif;
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: var(--tc);
          margin: 0 0 .2rem;
        }
        .immmap-card-title {
          font-family: 'Syne', sans-serif;
          font-size: .82rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 .25rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .immmap-card-price {
          font-family: 'Syne', sans-serif;
          font-size: .78rem;
          font-weight: 800;
          color: var(--ink);
          margin: 0;
        }
        .immmap-map-col {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .immmap-map {
          flex: 1;
          width: 100%;
        }
        .immmap-map-banner {
          background: rgba(196,98,45,.9);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .04em;
          text-align: center;
          padding: .5rem 1rem;
          z-index: 10;
        }
        @media (max-width: 860px) {
          .immmap-wrap {
            grid-template-columns: 1fr;
            grid-template-rows: 340px 1fr;
            height: auto;
          }
          .immmap-list { border-right: none; border-top: 1.5px solid var(--line); order: 2; max-height: 60vh; }
          .immmap-map-col { order: 1; min-height: 340px; }
        }
      `}</style>
    </>
  )
}
