'use client'

import { useEffect } from 'react'

const ATTR = 'data-site-header-theme'

/** Nel catalogo la header pubblica è chiara: allinea casetta / contrasti sulla nav */
export default function ImmobiliHeaderTheme() {
  useEffect(() => {
    document.documentElement.setAttribute(ATTR, 'light')
    return () => {
      document.documentElement.removeAttribute(ATTR)
    }
  }, [])
  return null
}
