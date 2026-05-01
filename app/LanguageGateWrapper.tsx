'use client'

import { usePathname } from 'next/navigation'
import LanguageGate from './components/LanguageGate'
import LanguageSwitcher from './components/LanguageSwitcher'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import Navbar from './components/Navbar'
import type { ReactNode } from 'react'

export default function LanguageGateWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Skip language gate AND switcher for admin area and login page
  const isPrivate = pathname.startsWith('/admin') || pathname.startsWith('/login')

  if (isPrivate) return <>{children}</>

  return (
    <LanguageGate>
      <Navbar />
      {children}
      <Footer />
      <LanguageSwitcher />
      <CookieBanner />
    </LanguageGate>
  )
}
