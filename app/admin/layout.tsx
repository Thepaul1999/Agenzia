import { redirect } from 'next/navigation'
import AdminSessionGuard from './AdminSessionGuard'
import { isAdminSession } from '@/lib/adminSession'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isAdminSession()

  if (!isAdmin) redirect('/login')

  return (
    <>
      <AdminSessionGuard timeoutMinutes={15} />
      {children}
    </>
  )
}
