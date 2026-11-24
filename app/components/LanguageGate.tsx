'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/language'

const STORAGE_KEY = 'lang_session'

function readCookieLang(): Lang | null {
  const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)
  return m && (m[1] === 'it' || m[1] === 'en') ? m[1] : null
}

function detectBrowserLang(): Lang {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  return langs.some(l => l?.toLowerCase().startsWith('it')) ? 'it' : 'en'
}

/**
 * Nessuna schermata bloccante: il sito si apre subito.
 * La lingua è, in ordine: scelta salvata (sessione o cookie) → lingua del browser.
 * Il selettore IT/EN in basso permette di cambiarla in ogni momento.
 */
export default function LanguageGate({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    let saved: Lang | null = null
    try {
      const ss = sessionStorage.getItem(STORAGE_KEY)
      if (ss === 'it' || ss === 'en') saved = ss
    } catch {}

    const cookieLang = readCookieLang()
    const lang: Lang = saved ?? cookieLang ?? detectBrowserLang()

    try { sessionStorage.setItem(STORAGE_KEY, lang) } catch {}
    const needsCookie = cookieLang !== lang
    if (needsCookie) {
      document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`
    }
    window.dispatchEvent(new CustomEvent('lang-change', { detail: lang }))

    // Il server legge il cookie per i testi tradotti: se è appena cambiato, ricarica i dati.
    if (needsCookie && lang !== 'it') router.refresh()
  }, [router])

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__setLang = (l: Lang) => {
      try { sessionStorage.setItem(STORAGE_KEY, l) } catch {}
      document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = l
      window.dispatchEvent(new CustomEvent('lang-change', { detail: l }))
      router.refresh()
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__setLang
    }
  }, [router])

  useEffect(() => {
    const handler = (e: Event) => {
      const l = (e as CustomEvent).detail
      if (l === 'it' || l === 'en') document.documentElement.lang = l
    }
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  return <>{children}</>
}
