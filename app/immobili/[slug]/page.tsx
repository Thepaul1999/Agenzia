import ImmobileDetailPageContent from './ImmobileDetailPageContent'

export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

const PUBLIC_NAV = {
  catalogHref: '/immobili',
  homeHref: '/home',
  propertyBasePath: '/immobili',
} as const

export default async function ImmobileDetailPage({ params }: Props) {
  const { slug } = await params
  return <ImmobileDetailPageContent slug={slug} nav={PUBLIC_NAV} />
}
