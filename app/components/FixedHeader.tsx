'use client'

import Link from 'next/link'

export default function FixedHeader() {
  return (
    <>
      <style>{`
        .fh-root {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 200;
          padding: clamp(.75rem, 2vw, 1.25rem) clamp(1rem, 4vw, 2rem);
          pointer-events: none;
        }
        .fh-btn {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          backdrop-filter: blur(10px) saturate(1.4);
          -webkit-backdrop-filter: blur(10px) saturate(1.4);
          border: 1px solid rgba(255,255,255,.28);
          box-shadow: 0 2px 12px rgba(12,12,10,.18);
          color: #fff;
          text-decoration: none;
          transition: background .2s, transform .2s, box-shadow .2s;
        }
        .fh-btn:hover {
          background: rgba(196,98,45,.85);
          border-color: rgba(196,98,45,.6);
          box-shadow: 0 4px 20px rgba(196,98,45,.35);
          transform: scale(1.08);
        }
        .fh-btn svg {
          width: 1.2rem;
          height: 1.2rem;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .fh-btn { width: 2.4rem; height: 2.4rem; }
          .fh-btn svg { width: 1.05rem; height: 1.05rem; }
        }
      `}</style>

      <div className="fh-root">
        <Link href="/" className="fh-btn" aria-label="Vai alla home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5V21h-5.5v-5.5h-7V21H3z"/>
          </svg>
        </Link>
      </div>
    </>
  )
}
