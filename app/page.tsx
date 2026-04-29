import { cookies } from 'next/headers'
import HomePage from './HomePage'
import { createClient } from '@/lib/server'

export const revalidate = 60

export default async function Page() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'

  const supabase = await createClient()

  const { data: immobili } = await supabase
    .from('immobili')
    .select('id, titolo, slug, citta, prezzo, immaginecopertina, descrizione, featured, tipo_contratto, mq, locali')
    .eq('pubblicato', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  const properties = immobili ?? []

  return <HomePage properties={properties} isAdmin={isAdmin} />
}
