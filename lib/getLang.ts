import { cookies } from 'next/headers'
import type { Lang } from './language'

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const val = cookieStore.get('lang')?.value
  return val === 'en' ? 'en' : 'it'
}
