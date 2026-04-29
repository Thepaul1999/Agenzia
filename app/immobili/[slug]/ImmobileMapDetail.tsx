'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type Props = {
  lat: number | null
  lng: number | null
  indirizzo: string | null
  posizione_approssimativa: boolean
  isAdmin?: boolean
  onAddressChange?: (lat: number, lng: number, indirizzo: string) => void
}

export default function ImmobileMapDetail({
  lat,
  lng,
  indirizzo,
  posizione_approssimativa,
  isAdmin,
  onAddressChange,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [searchInput, setSearchInput] = useState(indirizzo ?? '')
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(lat && lng ? [lat, lng] : null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Geocodifica con Nominatim
  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!address.trim()) return

      setSearching(true)
      setError('')

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
        )
        const data = await res.json()

        if (!data || data.length === 0) {
          setError('Indirizzo non trovato')
          return
        }

        const result = data[0]
        const newLat = parseFloat(result.lat)
        const newLng = parseFloat(result.lon)

        setMarkerPos([newLat, newLng])
        onAddressChange?.(newLat, newLng, address)
      } catch (e) {
        setError('Errore ricerca indirizzo')
        console.error(e)
      } finally {
        setSearching(false)
      }
    },
    [onAddressChange]
  )

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (value.trim() && isAdmin) {
      searchTimeoutRef.current = setTimeout(() => {
        geocodeAddress(value)
      }, 800)
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !markerPos || leafletMap.current) return

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: markerPos,
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker(markerPos)
        .bindPopup(indirizzo || `Lat: ${markerPos[0].toFixed(4)}, Lng: ${markerPos[1].toFixed(4)}`)
        .addTo(map)

      leafletMap.current = map
      markerRef.current = marker

      return () => {
        if (leafletMap.current) {
          leafletMap.current.remove()
          leafletMap.current = null
        }
      }
    })
  }, [markerPos, indirizzo])

  return (
    <div className="det-map-section">
      <style>{`
        .det-map-section {
          margin-top: 2rem;
        }
        .det-map-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #7c7770;
          margin: 0.8rem 0 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .det-map-search {
          display: flex;
          gap: 0.6rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .det-map-input {
          flex: 1;
          min-width: 200px;
          border: 1.5px solid #e9e4dd;
          border-radius: 0.75rem;
          padding: 0.6rem 1rem;
          font-size: 0.9rem;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .det-map-input:focus {
          outline: none;
          border-color: #c4622d;
        }
        .det-map-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          background: #0c0c0a;
          color: #fff;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .det-map-btn:hover {
          background: #c4622d;
        }
        .det-map-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .det-map-wrap {
          border-radius: 1rem;
          overflow: hidden;
          border: 1.5px solid #e9e4dd;
          aspect-ratio: 4 / 3;
          position: relative;
          background: #f5f3f0;
          min-height: 300px;
        }
        .det-map-error {
          padding: 0.8rem 1rem;
          background: #fee;
          color: #c00;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .det-map-info {
          font-size: 0.8rem;
          color: #7c7770;
          margin-top: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .det-map-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #7c7770;
        }
        @media (max-width: 640px) {
          .det-map-search {
            flex-direction: column;
          }
          .det-map-input {
            min-width: 100%;
          }
          .det-map-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="det-map-label">📍 Posizione geografica</div>

      {isAdmin && (
        <>
          <div className="det-map-search">
            <input
              type="text"
              className="det-map-input"
              placeholder="Inserisci indirizzo per cercarlo sulla mappa…"
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
            />
            <button className="det-map-btn" onClick={() => geocodeAddress(searchInput)} disabled={searching || !searchInput.trim()}>
              {searching ? '🔍 Cercando…' : '🔍 Cerca'}
            </button>
          </div>
          {error && <div className="det-map-error">{error}</div>}
        </>
      )}

      <div className="det-map-wrap" ref={mapRef}>
        {!markerPos && (
          <div className="det-map-empty">
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>📍 Posizione non disponibile</p>
              {isAdmin && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem' }}>Inserisci un indirizzo per cercare</p>}
            </div>
          </div>
        )}
      </div>

      {isAdmin && markerPos && (
        <div className="det-map-info">✓ Coordinate: {markerPos[0].toFixed(4)}, {markerPos[1].toFixed(4)}</div>
      )}
    </div>
  )
}
