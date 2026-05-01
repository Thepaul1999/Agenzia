'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function ContactCardBlock({ block }: { block: Block }) {
  const p = block.props as {
    whatsapp?: string
    mail?: string
    phone?: string
    hours?: string
    logo?: string
  }
  const waHref = p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` : '#'
  const mailHref = p.mail ? `mailto:${p.mail}` : '#'
  const telHref = p.phone ? `tel:${p.phone.replace(/\s+/g, '')}` : '#'

  return (
    <div data-block-id={block.id} data-cms-block style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '1.5rem',
      background: '#0c0c0a',
      color: '#fff',
      borderRadius: '1.5rem',
      padding: '2rem',
      ...buildLayoutStyle(block.layout),
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        <a href={waHref} target="_blank" rel="noopener noreferrer" style={pillStyle('#c4622d')}>
          WhatsApp ↗
        </a>
        <a href={mailHref} style={pillStyle('rgba(255,255,255,.08)')}>
          {p.mail || 'mail@'}
        </a>
        <a href={telHref} style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none' }}>
          {p.phone}
        </a>
        {p.hours ? (
          <p style={{ whiteSpace: 'pre-line', color: 'rgba(255,255,255,.65)', margin: '.4rem 0 0', fontSize: '.85rem', lineHeight: 1.6 }}>
            {p.hours}
          </p>
        ) : null}
      </div>
      {p.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.logo} alt="" style={{ width: 140, height: 'auto', objectFit: 'contain' }} />
      ) : null}
    </div>
  )
}

function pillStyle(bg: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '.55rem 1rem',
    borderRadius: 999,
    background: bg,
    color: '#fff',
    textDecoration: 'none',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    letterSpacing: '.05em',
    fontSize: '.7rem',
    textTransform: 'uppercase',
    width: 'fit-content',
  }
}
