'use client'

import Link from 'next/link'

export default function FixedHeader() {
  return (
    <>
      <style>{`
        .fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem clamp(1rem, 5vw, 2.5rem);
          pointer-events: none;
        }

        .fixed-header a {
          pointer-events: auto;
        }

        .house-logo {
          font-size: clamp(1.4rem, 5vw, 2rem);
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(2.4rem, 8vw, 3rem);
          height: clamp(2.4rem, 8vw, 3rem);
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .house-logo:hover {
          transform: scale(1.1);
        }

        @media (max-width: 640px) {
          .fixed-header {
            padding: 0.75rem clamp(0.75rem, 3vw, 1.5rem);
          }
          .house-logo {
            font-size: clamp(1.2rem, 4vw, 1.6rem);
            width: clamp(2rem, 6vw, 2.4rem);
            height: clamp(2rem, 6vw, 2.4rem);
          }
        }
      `}</style>

      <div className="fixed-header">
        <Link href="/" className="house-logo" aria-label="Home">
          🏠
        </Link>
      </div>
    </>
  )
}
