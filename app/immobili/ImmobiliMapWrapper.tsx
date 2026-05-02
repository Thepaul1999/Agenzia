'use client'

import dynamic from 'next/dynamic'

const ImmobiliMap = dynamic(() => import('./ImmobiliMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 'calc(100vh - 130px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f3f0',
      color: '#7c7770',
      fontFamily: 'Syne, sans-serif',
      fontSize: '.9rem',
      fontWeight: 600,
    }}>
      Caricamento mappa…
    </div>
  ),
})

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

export default function ImmobiliMapWrapper({
  items,
  supabaseUrl,
  propertyBasePath = '/immobili',
}: {
  items: MapItem[]
  supabaseUrl: string
  propertyBasePath?: string
}) {
  return <ImmobiliMap items={items} supabaseUrl={supabaseUrl} propertyBasePath={propertyBasePath} />
}
