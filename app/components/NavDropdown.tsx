'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type DropdownItem = {
  label: string
  href?: string
  onClick?: () => void
}

export default function NavDropdown({
  trigger,
  items,
}: {
  trigger: React.ReactNode
  items: DropdownItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const closeDropdown = () => {
    setIsOpen(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 5000)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className="nav-dropdown-wrapper"
      onMouseEnter={() => {
        handleMouseEnter()
        setIsOpen(true)
      }}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="site-nav-link"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="nav-dropdown-menu">
          {items.map((item, idx) => (
            <div key={idx}>
              {item.href ? (
                <Link href={item.href} className="nav-dropdown-item" onClick={closeDropdown}>
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className="nav-dropdown-item"
                  onClick={() => {
                    item.onClick?.()
                    closeDropdown()
                  }}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .nav-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border: 1.5px solid #e9e4dd;
          border-radius: 12px;
          padding: 0.6rem 0;
          min-width: 180px;
          box-shadow: 0 8px 24px rgba(12, 12, 10, 0.12);
          z-index: 100;
          margin-top: 0.6rem;
          animation: dropdownSlideIn 0.15s ease;
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .nav-dropdown-item {
          display: block;
          width: 100%;
          padding: 0.6rem 1.2rem;
          text-align: left;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          color: #0c0c0a;
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s ease;
          white-space: nowrap;
        }

        .nav-dropdown-item:hover {
          background: #f5f3f0;
        }

        .nav-dropdown-item:first-child {
          border-radius: 11px 11px 0 0;
        }

        .nav-dropdown-item:last-child {
          border-radius: 0 0 11px 11px;
        }

        @media (max-width: 768px) {
          .nav-dropdown-menu {
            position: static;
            transform: none;
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0.3rem 0 0;
            margin-top: 0;
          }

          .nav-dropdown-item {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
            color: #7c7770;
          }

          .nav-dropdown-item:hover {
            background: transparent;
            color: #0c0c0a;
          }
        }
      `}</style>
    </div>
  )
}
