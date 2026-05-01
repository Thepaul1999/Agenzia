'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [showPropertiesDropdown, setShowPropertiesDropdown] = useState(false)
  const [showContactsDropdown, setShowContactsDropdown] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navbarHeight = 60
      const additionalOffset = 20
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - navbarHeight - additionalOffset,
        behavior: 'smooth',
      })
    }
    setShowPropertiesDropdown(false)
    setShowContactsDropdown(false)
  }

  return (
    <>
      <style>{`
        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid #e9e4dd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 100;
          font-family: 'Syne', sans-serif;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: white;
          border: 1.5px solid #c4622d;
          border-radius: 8px;
          text-decoration: none;
          color: #c4622d;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .navbar-logo:hover {
          background: #c4622d;
          color: white;
          transform: scale(1.05);
        }

        .navbar-divider {
          width: 1px;
          height: 24px;
          background: #e9e4dd;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-reserved {
          text-decoration: none;
          color: #0c0c0a;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.6rem 1rem;
          border: 1.5px solid #e9e4dd;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-reserved:hover {
          border-color: #c4622d;
          color: #c4622d;
        }

        .dropdown-wrapper {
          position: relative;
        }

        .dropdown-trigger {
          background: none;
          border: none;
          color: #0c0c0a;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 0.3s ease;
        }

        .dropdown-trigger:hover {
          color: #c4622d;
        }

        .dropdown-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
          font-size: 0.6rem;
        }

        .dropdown-wrapper.open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1.5px solid #e9e4dd;
          border-radius: 8px;
          margin-top: 0.5rem;
          min-width: 180px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: none;
          flex-direction: column;
        }

        .dropdown-wrapper.open .dropdown-menu {
          display: flex;
        }

        .dropdown-menu a,
        .dropdown-menu button {
          padding: 0.8rem 1rem;
          text-decoration: none;
          color: #0c0c0a;
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .dropdown-menu a:hover,
        .dropdown-menu button:hover {
          background: #f5f3f0;
          color: #c4622d;
          padding-left: 1.2rem;
        }

        .dropdown-menu a:not(:last-child),
        .dropdown-menu button:not(:last-child) {
          border-bottom: 1px solid #e9e4dd;
        }

        .nav-link {
          background: none;
          border: none;
          color: #0c0c0a;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #c4622d;
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
            gap: 1rem;
          }

          .navbar-right {
            gap: 1rem;
          }

          .navbar-reserved {
            font-size: 0.65rem;
            padding: 0.5rem 0.8rem;
          }

          .dropdown-trigger {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 640px) {
          .navbar-divider {
            display: none;
          }

          .navbar-logo {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .navbar-reserved {
            display: none;
          }

          .dropdown-menu {
            min-width: 150px;
          }
        }
      `}</style>

      <div className="navbar-container">
        {/* Logo casetta sinistra */}
        <div className="navbar-left">
          <Link href="/" className="navbar-logo" title="Torna in home" aria-label="Home">
            🏠
          </Link>
          <div className="navbar-divider" />
        </div>

        {/* Menu centrale */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {/* Dropdown Immobili */}
          <div
            className={`dropdown-wrapper ${showPropertiesDropdown ? 'open' : ''}`}
            onMouseEnter={() => setShowPropertiesDropdown(true)}
            onMouseLeave={() => setShowPropertiesDropdown(false)}
          >
            <button
              className="dropdown-trigger"
              onClick={() => setShowPropertiesDropdown(!showPropertiesDropdown)}
              aria-expanded={showPropertiesDropdown}
            >
              Immobili <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <Link href="/immobili?filter=featured">Immobili in evidenza</Link>
              <Link href="/immobili">Tutti gli immobili</Link>
            </div>
          </div>

          {/* Link Servizi */}
          <button className="nav-link" onClick={() => scrollToSection('servizi')}>Servizi</button>

          {/* Link Territorio */}
          <button className="nav-link" onClick={() => scrollToSection('territorio')}>Territorio</button>

          {/* Link Testimonianze */}
          <button className="nav-link" onClick={() => scrollToSection('testimonianze')}>Testimonianze</button>

          {/* Dropdown Contatti */}
          <div
            className={`dropdown-wrapper ${showContactsDropdown ? 'open' : ''}`}
            onMouseEnter={() => setShowContactsDropdown(true)}
            onMouseLeave={() => setShowContactsDropdown(false)}
          >
            <button
              className="dropdown-trigger"
              onClick={() => setShowContactsDropdown(!showContactsDropdown)}
              aria-expanded={showContactsDropdown}
            >
              Contatti <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <a href={`https://wa.me/393332397206?text=Salve%2C%20sono%20interessato%20ai%20vostri%20servizi`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="mailto:info@agenziamonferrato.it">Mail</a>
              <button onClick={() => scrollToSection('contatti')}>Sezione Contatti</button>
            </div>
          </div>
        </div>

        {/* Area destra con area riservata */}
        <div className="navbar-right">
          <Link href="/login" className="navbar-reserved">
            <span>👤</span>
            <span>Area Riservata</span>
          </Link>
        </div>
      </div>

      {/* Spacer per il navbar fixed */}
      <div style={{ height: '60px' }} />
    </>
  )
}
