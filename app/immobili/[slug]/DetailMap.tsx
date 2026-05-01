'use client'

import { useEffect, useRef } from 'react'

type Props = {
  lat: number
  lng: number
  title: string
  isApproximate?: boolean
}

export default function DetailMap({ lat, lng, title, isApproximate = false }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Pulisce container se già inizializzato
    if (mapRef.current.innerHTML) {
      mapRef.current.innerHTML = ''
    }

    let map: any = null

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      // Fix icona default Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const zoomLevel = isApproximate ? 13 : 15

      map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: zoomLevel,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      if (isApproximate) {
        // Mostra cerchio area invece di pin esatto
        L.circle([lat, lng], {
          radius: 250,
          color: '#c4622d',
          fillColor: '#c4622d',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map).bindPopup(`<strong>${title}</strong><br><em>Posizione indicativa</em>`)
      } else {
        // Pin esatto
        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;
            background:#c4622d;
            border:3px solid #fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,.3);
          "></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          className: '',
        })

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${title}</strong>`)
      }
    })

    return () => {
      if (map) map.remove()
    }
  }, [lat, lng, title, isApproximate])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '340px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1.5px solid var(--line, #e9e4dd)',
        }}
      />
    </>
  )
}
