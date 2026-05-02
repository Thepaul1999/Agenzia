import { redirect } from 'next/navigation'

/** Vecchia URL `/gestione/new` → query sulla stessa pagina gestione. */
export default function LegacyGestioneNewRedirect() {
  redirect('/admin/immobili/gestione?new=1')
}
