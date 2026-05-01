import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import UnifiedImmobileForm from '../UnifiedImmobileForm'

type Props = { params: Promise<{ id: string }> }

export default async function AdminImmobileEditorPage({ params }: Props) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'
  if (!isAdmin) redirect('/login')

  const { id } = await params
  const isNewMode = id === 'new'
  let immobile = null

  if (!isNewMode) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('immobili')
      .select('id, titolo, titolo_en, slug, citta, prezzo, descrizione, descrizione_en, featured, pubblicato, stato, tipo_contratto, indirizzo, posizione_approssimativa, mq, locali, immaginecopertina')
      .eq('id', id)
      .single()
    immobile = data
  }

  const title = isNewMode ? 'Nuovo immobile' : 'Modifica immobile'
  const subtitle = isNewMode
    ? 'Compila i campi per aggiungere un immobile al catalogo'
    : immobile?.titolo ?? 'Immobile non trovato'

  return (
    <>
      <style>{`
        body { background: #f5f3f0; }
        .edit-page { max-width: 780px; margin: 0 auto; padding: 2.5rem 1.5rem 6rem; }
        .edit-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .edit-back { display: inline-flex; align-items: center; gap: .4rem; font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #7c7770; text-decoration: none; padding: .4rem .9rem; border-radius: 999px; border: 1.5px solid #e9e4dd; transition: background .18s, color .18s; }
        .edit-back:hover { background: #0c0c0a; color: #fff; border-color: #0c0c0a; }
        .edit-title { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0c0c0a; margin: 0; }
        .edit-subtitle { font-size: .88rem; color: #7c7770; margin: .2rem 0 0; }
        .edit-card { background: #fff; border-radius: 1.5rem; border: 1.5px solid #e9e4dd; padding: 2rem; }
      `}</style>

      <div className="edit-page">
        <div className="edit-header">
          <a href="/admin/immobili" className="edit-back">← Admin</a>
          <div>
            <h1 className="edit-title">{title}</h1>
            <p className="edit-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="edit-card">
          {!isNewMode && !immobile ? (
            <p style={{ color: '#c0392b', fontSize: '.9rem' }}>Immobile non trovato.</p>
          ) : (
            <UnifiedImmobileForm item={immobile} />
          )}
        </div>
      </div>
    </>
  )
}
