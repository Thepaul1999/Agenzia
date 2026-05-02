import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSessionGuard from './AdminSessionGuard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'

  if (!isAdmin) redirect('/login')

  return (
    <>
      <AdminSessionGuard timeoutMinutes={15} />
      {children}
    </>
  )
}
