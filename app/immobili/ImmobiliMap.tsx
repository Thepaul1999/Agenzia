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

/** Ray-casting point-in-polygon */
function pointInPolygon(point: [number, number], poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconDraw = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
  </svg>
)
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function ImmobiliMap({ items, supabaseUrl }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markersLayer = useRef<any>(null)
  const clickHandlerRef = useRef<any>(null)
  const drawPolylineRef = useRef<any>(null)
  const drawnPolygonRef = useRef<any>(null)

  const [selected, setSelected] = useState<MapItem | null>(null)
  const [inBounds, setInBounds] = useState<MapItem[]>(items)
  const [searchMode, setSearchMode] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Draw mode state
  const [drawMode, setDrawMode] = useState(false)
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([])
  const [drawnArea, setDrawnArea] = useState(false)

  const updateInBounds = useCallback(() => {
    if (!leafletMap.current || !searchMode) return
    const bounds = leafletMap.current.getBounds()
    setInBounds(items.filter(item => bounds.contains([item.lat, item.lng])))
  }, [items, searchMode])

  // Init map
  useEffect(() => {
    if (!mapRef.current) return
    if (leafletMap.current) {
      // Map already initialized, skip
      return
    }

    import('leaflet').then(L => {
      // Ensure container is clean before initializing
      if (mapRef.current && mapRef.current.innerHTML) {
        mapRef.current.innerHTML = ''
      }
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = items.length > 0
        ? [
            items.reduce((s, i) => s + i.lat, 0) / items.length,
            items.reduce((s, i) => s + i.lng, 0) / items.length,
          ]
        : [44.9, 8.4]

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
        try { leafletMap.current.remove() } catch (e) { /* already removed */ }
        leafletMap.current = null
      }
      if (mapRef.current) mapRef.current.innerHTML = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bounds search
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

  // Draw markers
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

        L.marker([item.lat, item.lng], { icon })
          .addTo(markersLayer.current)
          .on('click', () => setSelected(item))
      })
    })
  }, [items, mapReady])

  // Draw mode effect: attach/detach click handler on map
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return

    // Remove old click handler
    if (clickHandlerRef.current) {
      leafletMap.current.off('click', clickHandlerRef.current)
      clickHandlerRef.current = null
    }

    if (drawMode) {
      leafletMap.current._container.style.cursor = 'crosshair'

      const handler = (e: any) => {
        const pt: [number, number] = [e.latlng.lat, e.latlng.lng]

        setDrawPoints(prev => {
          const next = [...prev, pt]

          import('leaflet').then(L => {
            // Remove old polyline
            if (drawPolylineRef.current) {
              leafletMap.current.removeLayer(drawPolylineRef.current)
            }
            if (next.length >= 2) {
              drawPolylineRef.current = L.polyline(next, {
                color: '#c4622d',
                weight: 2.5,
                dashArray: '8,5',
                opacity: 0.85,
              }).addTo(leafletMap.current)
            }
          })

          return next
        })
      }

      clickHandlerRef.current = handler
      leafletMap.current.on('click', handler)
    } else {
      leafletMap.current._container.style.cursor = ''
    }
  }, [drawMode, mapReady])

  const completePolygon = () => {
    if (drawPoints.length < 3) return

    import('leaflet').then(L => {
      // Remove polyline
      if (drawPolylineRef.current) {
        leafletMap.current.removeLayer(drawPolylineRef.current)
        drawPolylineRef.current = null
      }
      // Remove old polygon
      if (drawnPolygonRef.current) {
        leafletMap.current.removeLayer(drawnPolygonRef.current)
      }

      drawnPolygonRef.current = L.polygon(drawPoints, {
        color: '#c4622d',
        fillColor: '#c4622d',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: undefined,
      }).addTo(leafletMap.current)

      // Filter properties inside polygon
      const inside = items.filter(item =>
        pointInPolygon([item.lat, item.lng], drawPoints)
      )

      setInBounds(inside)
      setSearchMode(true)
      setDrawnArea(true)
      setDrawMode(false)
      setDrawPoints([])
    })
  }

  const cancelDraw = () => {
    import('leaflet').then(() => {
      if (drawPolylineRef.current) {
        leafletMap.current.removeLayer(drawPolylineRef.current)
        drawPolylineRef.current = null
      }
    })
    setDrawMode(false)
    setDrawPoints([])
  }

  const clearArea = () => {
    if (drawnPolygonRef.current) {
      leafletMap.current.removeLayer(drawnPolygonRef.current)
      drawnPolygonRef.current = null
    }
    setDrawnArea(false)
    setSearchMode(false)
    setInBounds(items)
  }

  const activateSearchArea = () => {
    setSearchMode(true)
    setDrawnArea(false)
    if (leafletMap.current) {
      const bounds = leafletMap.current.getBounds()
      setInBounds(items.filter((item: MapItem) => bounds.contains([item.lat, item.lng])))
    }
  }

  const resetSearch = () => {
    clearArea()
    setSearchMode(false)
    setInBounds(items)
  }

  const visibleItems = searchMode ? inBounds : items

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="immmap-wrap">
        {/* Left panel */}
        <div className="immmap-list">
          <div className="immmap-list-head">
            <span className="immmap-list-count">
              {visibleItems.length} immobil{visibleItems.length === 1 ? 'e' : 'i'}
              {searchMode ? (drawnArea ? ' nell\'area disegnata' : ' in questa zona') : ''}
            </span>
            <div className="immmap-list-actions">
              {!searchMode && !drawMode && (
                <>
                  <button className="immmap-search-btn" onClick={activateSearchArea}>
                    <IconSearch /> Cerca zona
                  </button>
                  <button className="immmap-draw-btn" onClick={() => setDrawMode(true)}>
                    <IconDraw /> Disegna area
                  </button>
                </>
              )}
              {drawMode && (
                <>
                  <button
                    className="immmap-confirm-btn"
                    onClick={completePolygon}
                    disabled={drawPoints.length < 3}
                  >
                    <IconCheck /> Chiudi area
                  </button>
                  <button className="immmap-cancel-btn" onClick={cancelDraw}>
                    <IconX /> Annulla
                  </button>
                </>
              )}
              {searchMode && !drawMode && (
                <button className="immmap-reset-btn" onClick={resetSearch}>
                  <IconX /> Mostra tutti
                </button>
              )}
            </div>
          </div>

          {/* Draw mode hint */}
          {drawMode && (
            <div className="immmap-draw-hint">
              Clicca sulla mappa per aggiungere punti. Almeno 3 punti per chiudere l&apos;area.
              {drawPoints.length > 0 && ` (${drawPoints.length} punto${drawPoints.length > 1 ? 'i' : ''} aggiunti)`}
            </div>
          )}

          <div className="immmap-cards">
            {visibleItems.length === 0 && (
              <div className="immmap-empty">
                <p>Nessun immobile in questa zona.</p>
                <p>Sposta la mappa o amplia l&apos;area.</p>
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
                      : <div className="immmap-card-img-ph">&#8962;</div>
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

        {/* Map */}
        <div className="immmap-map-col">
          {searchMode && !drawnArea && (
            <div className="immmap-map-banner">
              Sposta o ingrandisci la mappa — la lista si aggiorna automaticamente
            </div>
          )}
          {drawMode && (
            <div className="immmap-map-banner immmap-map-banner--draw">
              Modalità disegno attiva — clicca sulla mappa per tracciare l&apos;area
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
          gap: .5rem;
          padding: .85rem 1rem;
          border-bottom: 1px solid var(--line);
          background: #fff;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .immmap-list-count {
          font-family: 'Syne', sans-serif;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--mid);
        }
        .immmap-list-actions {
          display: flex;
          align-items: center;
          gap: .4rem;
          flex-wrap: wrap;
        }
        .immmap-search-btn, .immmap-draw-btn, .immmap-reset-btn,
        .immmap-confirm-btn, .immmap-cancel-btn {
          display: inline-flex;
          align-items: center;
          gap: .3rem;
          font-family: 'Syne', sans-serif;
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          padding: .34rem .75rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background .18s, color .18s, border-color .18s;
          white-space: nowrap;
        }
        .immmap-search-btn {
          background: var(--ink);
          color: #fff;
          border: none;
        }
        .immmap-search-btn:hover { background: var(--tc); }
        .immmap-draw-btn {
          background: transparent;
          color: var(--tc);
          border: 1.5px solid var(--tc);
        }
        .immmap-draw-btn:hover { background: var(--tc); color: #fff; }
        .immmap-reset-btn {
          background: transparent;
          color: #c0392b;
          border: 1.5px solid #c0392b;
        }
        .immmap-reset-btn:hover { background: #c0392b; color: #fff; }
        .immmap-confirm-btn {
          background: #22c55e;
          color: #fff;
          border: none;
        }
        .immmap-confirm-btn:hover { background: #16a34a; }
        .immmap-confirm-btn:disabled { opacity: .45; cursor: not-allowed; }
        .immmap-cancel-btn {
          background: transparent;
          color: #7c7770;
          border: 1.5px solid #d5cfc7;
        }
        .immmap-cancel-btn:hover { background: #0c0c0a; color: #fff; border-color: #0c0c0a; }
        .immmap-draw-hint {
          padding: .6rem 1rem;
          font-family: 'Syne', sans-serif;
          font-size: .65rem;
          font-weight: 600;
          color: #c4622d;
          background: rgba(196,98,45,.06);
          border-bottom: 1px solid rgba(196,98,45,.15);
          flex-shrink: 0;
        }
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
          background: rgba(12,12,10,.82);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: .66rem;
          font-weight: 700;
          letter-spacing: .04em;
          text-align: center;
          padding: .5rem 1rem;
          z-index: 10;
        }
        .immmap-map-banner--draw {
          background: rgba(196,98,45,.9);
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
