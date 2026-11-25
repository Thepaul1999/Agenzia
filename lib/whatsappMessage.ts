import type { Lang } from './language'

/**
 * Testo del messaggio WhatsApp precompilato.
 * Sempre in italiano (è la lingua di chi risponde in agenzia); se il visitatore usa il sito in inglese
 * viene aggiunto «(Inglese)» così l'agenzia sa in che lingua rispondere.
 * Se c'è il link di un immobile, va in cima al messaggio.
 */
export function buildWhatsAppText(lang: Lang, propertyUrl?: string | null): string {
  const tag = lang === 'en' ? ' (Inglese)' : ''
  if (propertyUrl) {
    return `${propertyUrl}\n\nCiao! Sono interessato a questo immobile. Potrei avere maggiori informazioni?${tag}`
  }
  return `Ciao! Vorrei avere informazioni sui vostri immobili nel Monferrato.${tag}`
}
