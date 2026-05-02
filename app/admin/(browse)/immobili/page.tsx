import ImmobiliCatalog from '@/app/immobili/ImmobiliCatalog'

type SearchParams = Promise<{
  tipo?: string
  q?: string
  pmin?: string
  pmax?: string
  mqmin?: string
  locali?: string
  sort?: string
  view?: string
}>

export default function AdminBrowseImmobiliPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <ImmobiliCatalog searchParams={searchParams} homeHref="/admin/home" propertyBasePath="/admin/immobili" />
  )
}
