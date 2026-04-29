'use client'

import { useState } from 'react'
import ImmobileEditModal from './ImmobileEditModal'

type Props = {
  immobile: {
    id: string
    titolo: string
    titolo_en: string | null
    descrizione: string | null
    descrizione_en: string | null
    citta: string | null
    prezzo: number | null
    featured: boolean
    stato: string
    tipo_contratto: string | null
    mq: number | null
    locali: number | null
    lat: number | null
    lng: number | null
    indirizzo: string | null
    posizione_approssimativa: boolean
    immaginecopertina: string | null
  }
  isAdmin: boolean
}

export default function EditButtonWrapper({ immobile, isAdmin }: Props) {
  const [showEditModal, setShowEditModal] = useState(false)

  if (!isAdmin) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setShowEditModal(true)}
        className="det-admin-edit-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '.45rem',
          padding: '.42rem 1rem',
          borderRadius: '999px',
          background: '#c4622d',
          color: '#fff',
          border: 'none',
          fontFamily: "'Syne', sans-serif",
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#a0501f')}
        onMouseLeave={e => (e.currentTarget.style.background = '#c4622d')}
      >
        ✏️ Modifica questo immobile
      </button>

      {showEditModal && (
        <ImmobileEditModal
          immobile={{
            ...immobile,
            imageUrl: immobile.immaginecopertina
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.immaginecopertina}`
              : null,
            slug: '',
            prezzoFormattato: null,
          } as any}
          onClose={() => setShowEditModal(false)}
          onSave={() => window.location.reload()}
        />
      )}
    </>
  )
}
