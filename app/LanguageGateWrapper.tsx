'use client'

import { usePathname } from 'next/navigation'
import LanguageGate from './components/LanguageGate'
import LanguageSwitcher from './components/LanguageSwitcher'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import type { ReactNode } from 'react'

function isAdminToolsPath(pathname: string): boolean {
  if (pathname === '/admin' || pathname === '/admin/') return true
  return (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/builder') ||
    pathname.startsWith('/admin/statistiche') ||
    pathname.startsWith('/admin/home-content') ||
    pathname.startsWith('/admin/immobili/gestione')
  )
}

export default function LanguageGateWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Login e strumenti back-office senza gate/footer; mirror `/admin/home` e `/admin/immobili` come il sito pubblico
  const isPrivate = pathname.startsWith('/login') || (pathname.startsWith('/admin') && isAdminToolsPath(pathname))

  if (isPrivate) return <>{children}</>

  return (
    <LanguageGate>
      {children}
      <Footer />
      <LanguageSwitcher />
      <CookieBanner />
    </LanguageGate>
  )
}
