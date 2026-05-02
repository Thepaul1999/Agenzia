import { redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

/** Vecchia URL `/gestione/[id]` → stessa interfaccia sulla pagina lista con query. */
export default async function LegacyGestioneImmRedirect({ params }: Props) {
  const { id } = await params
  if (!id || id === 'new') redirect('/admin/immobili/gestione?new=1')
  redirect(`/admin/immobili/gestione?id=${encodeURIComponent(id)}`)
}
