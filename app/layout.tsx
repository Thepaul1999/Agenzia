import './globals.css'
import './home.css'
import LanguageGateWrapper from './LanguageGateWrapper'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <main className="min-h-screen">
          <LanguageGateWrapper>{children}</LanguageGateWrapper>
        </main>
      </body>
    </html>
  )
}
