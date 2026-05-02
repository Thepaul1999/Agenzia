import HomePage from '@/app/HomePage'
import { loadHomePageData } from '@/lib/loadHomePage'

export const revalidate = 60

export default async function HomeRoutePage() {
  const { isAdmin, properties, homeContent, cmsContent } = await loadHomePageData()

  return (
    <HomePage
      properties={properties}
      isAdmin={isAdmin}
      homeContent={homeContent}
      cmsContent={cmsContent}
      homeHref="/home"
      immobiliHref="/immobili"
      propertyBasePath="/immobili"
    />
  )
}
