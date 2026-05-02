/** wa.me vuole prefisso internazionale senza + (solo cifre). */
export function digitsForWhatsApp(phoneRaw: string): string | null {
  const d = phoneRaw.replace(/\D/g, '')
  return d.length > 0 ? d : null
}

export function buildWhatsAppHref(phoneRaw: string | undefined | null, message: string): string {
  const d = digitsForWhatsApp(String(phoneRaw ?? '').trim())
  if (!d) return '#'
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`
}
