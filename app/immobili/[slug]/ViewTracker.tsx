'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ViewTracker({ immobileId }: { immobileId: string }) {
  const pathname = usePathname()

  useEffect(() => {
    // Traccia vista sito (una volta per path per sessione)
    const siteKey = `site_visited_${pathname}`
    if (!sessionStorage.getItem(siteKey)) {
      sessionStorage.setItem(siteKey, '1')
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {})
    }

    // Traccia vista immobile (una volta per ID per sessione)
    const key = `visited_${immobileId}`
    if (sessionStorage.getItem(key)) return

    sessionStorage.setItem(key, '1')

    fetch('/api/immobile/visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ immobileId }),
    }).catch(() => {})
  }, [immobileId, pathname])

  return null
}
