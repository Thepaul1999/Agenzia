import ImmobileDetailPageContent from '@/app/immobili/[slug]/ImmobileDetailPageContent'

export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

const ADMIN_NAV = {
  catalogHref: '/admin/immobili',
  homeHref: '/admin/home',
  propertyBasePath: '/admin/immobili',
} as const

export default async function AdminBrowseImmobileDetailPage({ params }: Props) {
  const { slug } = await params
  return <ImmobileDetailPageContent slug={slug} nav={ADMIN_NAV} />
}
