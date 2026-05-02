import ImmobiliCatalog from './ImmobiliCatalog'

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

export default function ImmobiliPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <ImmobiliCatalog searchParams={searchParams} homeHref="/home" propertyBasePath="/immobili" />
  )
}
