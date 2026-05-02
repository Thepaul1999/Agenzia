import './globals.css'
import './home.css'
import { cookies } from 'next/headers'
import LanguageGateWrapper from './LanguageGateWrapper'
import FixedHeader from './components/FixedHeader'
import AdminEditBar from './components/AdminEditBar'
import { EditModeProvider } from './context/EditModeContext'
import type { Viewport } from 'next'

export const metadata = {
  title: 'Agenzia Immobiliare Monferrato',
  description: 'Immobili nel cuore del Monferrato – case, cascinali, appartamenti.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'

  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <EditModeProvider isAdmin={isAdmin}>
          <AdminEditBar />
          <FixedHeader />
          <main className="min-h-screen">
            <LanguageGateWrapper>{children}</LanguageGateWrapper>
          </main>
        </EditModeProvider>
      </body>
    </html>
  )
}
