'use client'

import Link from 'next/link'

export default function GlobalLogin() {
  return (
    <Link href="/login" className="global-login-btn" aria-label="Area riservata">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 21v-1c0-2.761-4.029-5-8-5s-8 2.239-8 5v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="global-login-label">Area riservata</span>
    </Link>
  )
}
