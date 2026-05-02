'use client'

import { useEffect, useRef } from 'react'

type Props = {
  lat: number
  lng: number
  approximate?: boolean
  /** Modalità form admin: marker trascinabile, coordinate inviate al salvataggio */
  editable?: boolean
  onPositionChange?: (lat: number, lng: number) => void
}

function safeInvalidate(map: any, container: HTMLElement | null) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (!map || !container?.isConnected) return
        if (container.offsetWidth < 2 || container.offsetHeight < 2) return
        map.invalidateSize(true)
      } catch {
        /* Leaflet container detached */
      }
    })
  })
}

/** Anteprima Leaflet in admin; con `editable` il pin si sposta per rifinare dopo geocoding. */
export default function FormLocationMap({
  lat,
  lng,
  approximate = true,
  editable = false,
  onPositionChange,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const featureGroup = useRef<any>(null)
  const moveCb = useRef(onPositionChange)
  moveCb.current = onPositionChange

  /* Inizializza mappa una sola volta */
  useEffect(() => {
    const container = mapRef.current
    if (!container) return

    let disposed = false

    import('leaflet').then((L) => {
      if (disposed || !mapRef.current) return

      container.replaceChildren()

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(container, {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        maxZoom: 19,
      }).addTo(map)

      const fg = L.layerGroup().addTo(map)
      featureGroup.current = fg
      leafletMap.current = map

      safeInvalidate(map, container)
    })

    return () => {
      disposed = true
      featureGroup.current = null
      if (leafletMap.current) {
        try {
          leafletMap.current.remove()
        } catch {
          /* noop */
        }
        leafletMap.current = null
      }
      if (mapRef.current) mapRef.current.replaceChildren()
    }
  }, [])

  /* Aggiorna centro e layer (incluso drag) */
  useEffect(() => {
    const map = leafletMap.current
    const fg = featureGroup.current
    if (!map || !fg || !Number.isFinite(lat) || !Number.isFinite(lng)) return

    import('leaflet').then((L) => {
      fg.clearLayers()
      const z = editable ? (approximate ? 14 : 16) : approximate ? 13 : 15
      map.setView([lat, lng], z)

      if (editable) {
        const m = L.marker([lat, lng], { draggable: true }).addTo(fg)
        m.on('dragend', () => {
          const ll = m.getLatLng()
          moveCb.current?.(ll.lat, ll.lng)
        })
      } else if (approximate) {
        L.circle([lat, lng], {
          radius: 280,
          color: '#c4622d',
          fillColor: '#c4622d',
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(fg)
      } else {
        L.marker([lat, lng]).addTo(fg)
      }

      safeInvalidate(map, mapRef.current)
    })
  }, [lat, lng, approximate, editable])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 280,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1.5px solid #e9e4dd',
          marginTop: 12,
        }}
      />
      {editable ? (
        <p className="text-xs text-neutral-500 mt-2">
          Trascina il puntatore sulla mappa per rifinare il punto. Il testo dell&apos;indirizzo in scheda resta quello che scegli tu (puoi non mostrarlo sul sito usando la privacy sulla posizione).
        </p>
      ) : null}
    </>
  )
}
