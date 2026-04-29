'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSessionGuard({ timeoutMinutes = 15 }: { timeoutMinutes?: number }) {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const ms = timeoutMinutes * 60 * 1000

    function reset() {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        await fetch('/api/logout', { method: 'POST' })
        router.push('/login?expired=1')
      }, ms)
    }

    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [timeoutMinutes, router])

  return null
}
