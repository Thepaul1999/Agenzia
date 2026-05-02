import { redirect } from 'next/navigation'

/** La home canonica per i clienti è `/home` (allineamento percorsi pubblici). */
export default function RootRedirectPage() {
  redirect('/home')
}
