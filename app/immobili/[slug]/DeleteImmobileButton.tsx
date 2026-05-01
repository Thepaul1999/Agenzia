'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteImmobileButton({ immobileId }: { immobileId: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Eliminare definitivamente questo immobile? L\'azione non è reversibile.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/immobili/${immobileId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/immobili')
      } else {
        const data = await res.json()
        alert('Errore: ' + (data.error ?? 'sconosciuto'))
        setDeleting(false)
      }
    } catch {
      alert('Errore di rete')
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.4rem',
        padding: '.42rem 1rem',
        borderRadius: '999px',
        background: 'transparent',
        color: '#ff6b6b',
        border: '1.5px solid rgba(255,107,107,.4)',
        fontFamily: "'Syne', sans-serif",
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        cursor: deleting ? 'not-allowed' : 'pointer',
        opacity: deleting ? .6 : 1,
        transition: 'background .15s, color .15s',
      }}
      onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#c0392b' }}}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,107,107,.4)' }}
    >
      {deleting ? '⏳ Eliminazione…' : '🗑 Elimina'}
    </button>
  )
}
