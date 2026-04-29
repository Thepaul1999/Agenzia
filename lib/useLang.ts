'use client'
import { useState, useEffect } from 'react'
import type { Lang } from './language'

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>('it')

  useEffect(() => {
    const saved = sessionStorage.getItem('lang_session')
    if (saved === 'en') setLang('en')

    // Listen for runtime lang changes (from LanguageSwitcher)
    const handler = (e: CustomEvent) => {
      if (e.detail === 'it' || e.detail === 'en') setLang(e.detail)
    }
    window.addEventListener('lang-change', handler as EventListener)
    return () => window.removeEventListener('lang-change', handler as EventListener)
  }, [])

  return lang
}
