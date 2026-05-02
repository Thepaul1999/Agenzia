import { redirect } from 'next/navigation'

/** Contenuti home unificati nel Builder CMS (/admin/builder/home). */
export default function AdminHomeContentRedirectPage() {
  redirect('/admin/builder/home')
}
