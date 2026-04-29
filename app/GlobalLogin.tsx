'use client'

import Link from 'next/link'

export default function GlobalLogin() {
  return (
    <>
      <style>{`
        .global-login-btn {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 999;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.4rem;
          background: #fff;
          color: #0c0c0a;
          border-radius: 12px;
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border: 1.5px solid #e9e4dd;
          box-shadow: 0 8px 32px rgba(12, 12, 10, 0.15), 0 2px 8px rgba(196, 98, 45, 0.2);
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          overflow: hidden;
        }

        .global-login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #c4622d 0%, #a0501f 100%);
          border-radius: 11px;
          opacity: 0;
          transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: -1;
        }

        .global-login-btn:hover {
          border-color: #c4622d;
          box-shadow: 0 12px 40px rgba(196, 98, 45, 0.3), 0 4px 12px rgba(196, 98, 45, 0.25);
          transform: translateY(-3px);
          color: #fff;
        }

        .global-login-btn:hover::before {
          opacity: 1;
        }

        .global-login-btn:active {
          transform: translateY(-1px);
        }

        .global-login-btn svg {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          stroke: currentColor;
        }

        .global-login-label {
          display: none;
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          .global-login-label {
            display: inline;
          }
        }

        @media (max-width: 640px) {
          .global-login-btn {
            top: 1.2rem;
            right: 1.2rem;
            padding: 0.7rem 0.85rem;
            font-size: 0.65rem;
            border-radius: 10px;
          }
        }

        @media (max-width: 480px) {
          .global-login-btn {
            top: 0.9rem;
            right: 0.9rem;
            padding: 0.65rem 0.75rem;
          }
        }
      `}</style>

      <Link href="/login" className="global-login-btn" aria-label="Area riservata">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="global-login-label">Accedi</span>
      </Link>
    </>
  )
}
