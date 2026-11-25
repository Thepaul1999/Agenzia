'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './useLang'
import { buildWhatsAppText } from './whatsappMessage'

/** Messaggio WhatsApp per la pagina corrente: sulle schede immobile include il link pubblico dell'immobile. */
export function useWhatsAppMessage(): string {
  const lang = useLang()
  const pathname = usePathname() ?? ''
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const m = pathname.match(/^\/(?:admin\/)?immobili\/([^/]+)\/?$/)
  const slug = m && m[1] !== 'gestione' ? m[1] : null
  const propertyUrl = slug && origin ? `${origin}/immobili/${slug}` : null

  return buildWhatsAppText(lang, propertyUrl)
}
