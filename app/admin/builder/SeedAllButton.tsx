'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedAllButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handle = async () => {
    if (!confirm('Inizializzare tutte le pagine mancanti con il contenuto di default?')) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/cms/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Errore')
      const list = (data?.seeded ?? []) as string[]
      setMsg(list.length ? `Inizializzate: ${list.join(', ')}` : 'Tutte le pagine erano già presenti')
      startTransition(() => router.refresh())
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Errore')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem' }}>
      <button
        type="button"
        onClick={handle}
        disabled={busy || pending}
        style={{
          padding: '.6rem 1.1rem',
          borderRadius: 999,
          background: '#0c0c0a',
          color: '#fff',
          border: 'none',
          cursor: busy || pending ? 'wait' : 'pointer',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '.72rem',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}
      >
        {busy || pending ? 'Inizializzo…' : '⚙ Inizializza pagine'}
      </button>
      {msg && (
        <span style={{ fontSize: '.78rem', color: 'var(--mid)' }}>{msg}</span>
      )}
    </div>
  )
}
