import Image from 'next/image'

/** Logo dell'agenzia a colori (fascia giallo-arancione con testo blu). Proporzioni del file: circa 5 : 1. */
export const BRAND_LOGO_SRC = '/images/logo/Logo_agenzia.jpg'
const RATIO = 5949 / 1194

export default function BrandLogo({
  height = 40,
  priority = false,
  className = '',
}: {
  height?: number
  priority?: boolean
  className?: string
}) {
  const width = Math.round(height * RATIO)
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt="Agenzia Immobiliare Monferrato"
      width={width}
      height={height}
      priority={priority}
      sizes={`${width * 2}px`}
      className={`brand-logo ${className}`.trim()}
      style={{ height, width: 'auto', borderRadius: 6, boxShadow: '0 6px 18px rgba(12,12,10,.22)' }}
    />
  )
}
