'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'

/** PATCH featured=false e refresh pagina/lista */
export default function RemoveFromFeaturedButton({
  immobileId,
  className,
  onRemoved,
}: {
  immobileId: string
  className?: string
  /** Opzionale: aggiorna UI prima del refresh */
  onRemoved?: () => void
}) {
  const router = useRouter()
  const lang = useLang()
  const t = translations[lang]
  const [busy, setBusy] = useState(false)

  async function handleClick(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/immobili/${immobileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: false }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(`${lang === 'en' ? 'Error' : 'Errore'}: ${(data as { error?: string }).error ?? ''}`)
        return
      }
      onRemoved?.()
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={className}>
      {busy ? '…' : t.removeFromFeatured}
    </button>
  )
}
