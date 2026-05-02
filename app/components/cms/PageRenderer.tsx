'use client'

import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import type { Block, BlockLayout, BlockLayoutEntry, PageContent } from '@/lib/cms/types'
import SectionBlock from './blocks/SectionBlock'
import HeadingBlock from './blocks/HeadingBlock'
import TextBlock from './blocks/TextBlock'
import EyebrowBlock from './blocks/EyebrowBlock'
import ButtonBlock from './blocks/ButtonBlock'
import ButtonGroupBlock from './blocks/ButtonGroupBlock'
import ImageBlock from './blocks/ImageBlock'
import GalleryBlock from './blocks/GalleryBlock'
import CardsBlock from './blocks/CardsBlock'
import StatsBlock from './blocks/StatsBlock'
import TestimonialsBlock from './blocks/TestimonialsBlock'
import PropertiesCarouselBlock from './blocks/PropertiesCarouselBlock'
import ContactCardBlock from './blocks/ContactCardBlock'
import MapBlock from './blocks/MapBlock'
import HtmlBlock from './blocks/HtmlBlock'
import SpacerBlock from './blocks/SpacerBlock'
import DividerBlock from './blocks/DividerBlock'
import ColumnsBlock from './blocks/ColumnsBlock'
import { useEditMode } from '@/app/context/EditModeContext'

export type BlockProperties = Record<string, unknown>

export type PropertyForBlocks = {
  id?: string | number
  titolo?: string
  slug?: string
  citta?: string | null
  prezzo?: number | string | null
  immaginecopertina?: string | null
  descrizione?: string | null
  featured?: boolean | null
  tipo_contratto?: string | null
  mq?: number | null
  locali?: number | null
  visiteClienteQuestoMese?: number
}

export type PageRenderContext = {
  isAdmin?: boolean
  immobili?: PropertyForBlocks[]
  /** Schede immobili nei blocchi CMS (pubblico vs mirror admin) */
  propertyBasePath?: string
  selectedBlockId?: string | null
  onSelectBlock?: (id: string) => void
  editing?: boolean
}

function flatten(blocks: Block[]): Block[] {
  const out: Block[] = []
  function walk(b: Block) {
    out.push(b)
    b.children?.forEach(walk)
  }
  blocks.forEach(walk)
  return out
}

export function buildLayoutStyle(layout: BlockLayout | undefined): React.CSSProperties {
  if (!layout) return {}
  return entryToStyle(layout.desktop)
}

function entryToStyle(entry?: BlockLayoutEntry): React.CSSProperties {
  if (!entry) return {}
  const style: React.CSSProperties = {}
  if (entry.hidden) style.display = 'none'
  if (entry.width) style.width = entry.width
  if (entry.height) style.height = entry.height
  if (entry.position === 'absolute') style.position = 'absolute'
  if (entry.top) style.top = entry.top
  if (entry.left) style.left = entry.left
  if (entry.right) style.right = entry.right
  if (entry.bottom) style.bottom = entry.bottom
  if (entry.marginTop) style.marginTop = entry.marginTop
  if (entry.marginBottom) style.marginBottom = entry.marginBottom
  if (entry.marginLeft) style.marginLeft = entry.marginLeft
  if (entry.marginRight) style.marginRight = entry.marginRight
  if (entry.paddingTop) style.paddingTop = entry.paddingTop
  if (entry.paddingBottom) style.paddingBottom = entry.paddingBottom
  if (entry.paddingLeft) style.paddingLeft = entry.paddingLeft
  if (entry.paddingRight) style.paddingRight = entry.paddingRight
  if (entry.textAlign) style.textAlign = entry.textAlign
  if (entry.zIndex !== undefined) style.zIndex = entry.zIndex
  return style
}

function buildResponsiveCss(blocks: Block[]) {
  const lines: string[] = []
  for (const b of flatten(blocks)) {
    if (!b.layout) continue
    const tablet = entryToStyle(b.layout.tablet)
    const mobile = entryToStyle(b.layout.mobile)
    if (Object.keys(tablet).length > 0) {
      const css = cssText(tablet)
      lines.push(`@media (max-width: 1024px) { [data-block-id="${b.id}"] { ${css} } }`)
      lines.push(`@container cms-canvas (max-width: 1024px) { [data-block-id="${b.id}"] { ${css} } }`)
    }
    if (Object.keys(mobile).length > 0) {
      const css = cssText(mobile)
      lines.push(`@media (max-width: 640px) { [data-block-id="${b.id}"] { ${css} } }`)
      lines.push(`@container cms-canvas (max-width: 640px) { [data-block-id="${b.id}"] { ${css} } }`)
    }
  }
  return lines.join('\n')
}

function cssText(style: React.CSSProperties) {
  return Object.entries(style)
    .map(([k, v]) => `${camelToKebab(k)}: ${v} !important;`)
    .join(' ')
}

function camelToKebab(s: string) {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ block: Block; context: PageRenderContext; renderChildren: (children?: Block[]) => React.ReactNode }>> = {
  section: SectionBlock,
  columns: ColumnsBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  eyebrow: EyebrowBlock,
  heading: HeadingBlock,
  text: TextBlock,
  button: ButtonBlock,
  buttonGroup: ButtonGroupBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  cards: CardsBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  propertiesCarousel: PropertiesCarouselBlock,
  contactCard: ContactCardBlock,
  map: MapBlock,
  html: HtmlBlock,
}

function BlockRenderer({ block, context }: { block: Block; context: PageRenderContext }) {
  const Component = BLOCK_COMPONENTS[block.type]
  const renderChildren = (children?: Block[]) => {
    if (!children || children.length === 0) return null
    return children.map((child) => <BlockRenderer key={child.id} block={child} context={context} />)
  }
  if (!Component) {
    return (
      <div data-block-id={block.id} style={{ padding: 12, border: '1px dashed #c4622d', color: '#c4622d', borderRadius: 8 }}>
        Blocco non riconosciuto: {block.type}
      </div>
    )
  }
  return <Component block={block} context={context} renderChildren={renderChildren} />
}

// ---------- Drag-to-reorder wrapper ----------
function DraggableBlockList({
  blocks,
  context,
  pageSlug,
  content,
}: {
  blocks: Block[]
  context: PageRenderContext
  pageSlug: string
  content: PageContent
}) {
  const [localBlocks, setLocalBlocks] = useState<Block[]>(blocks)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const dragIdx = useRef<number | null>(null)

  useEffect(() => {
    setLocalBlocks(blocks)
  }, [blocks])

  const handleDragStart = useCallback((idx: number) => {
    dragIdx.current = idx
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }, [])

  const handleDrop = useCallback(async (dropIdx: number) => {
    const from = dragIdx.current
    if (from === null || from === dropIdx) {
      dragIdx.current = null
      setDragOverIdx(null)
      return
    }
    const next = [...localBlocks]
    const [moved] = next.splice(from, 1)
    next.splice(dropIdx, 0, moved)
    dragIdx.current = null
    setDragOverIdx(null)
    setLocalBlocks(next)

    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/cms/pages/${pageSlug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: { ...content, blocks: next } }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [localBlocks, pageSlug, content])

  const handleDragEnd = useCallback(() => {
    dragIdx.current = null
    setDragOverIdx(null)
  }, [])

  return (
    <>
      {saveStatus !== 'idle' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          padding: '0.5rem 1.1rem',
          borderRadius: 999,
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: 'Syne, sans-serif',
          background: saveStatus === 'saving' ? '#444' : saveStatus === 'saved' ? '#22c55e' : '#ef4444',
          color: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,.3)',
          pointerEvents: 'none',
        }}>
          {saveStatus === 'saving' ? '⏳ Salvataggio ordine…' : saveStatus === 'saved' ? '✓ Ordine salvato' : '✗ Errore salvataggio'}
        </div>
      )}
      {localBlocks.map((block, idx) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={() => handleDrop(idx)}
          onDragEnd={handleDragEnd}
          style={{
            position: 'relative',
            cursor: 'grab',
            outline: dragOverIdx === idx ? '2px solid #c4622d' : '2px dashed rgba(196,98,45,0.4)',
            outlineOffset: 2,
            transition: 'outline-color 0.15s',
          }}
        >
          {/* Drag handle */}
          <div style={{
            position: 'absolute',
            top: 6,
            right: 8,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: '#c4622d',
            color: '#fff',
            borderRadius: 8,
            padding: '3px 8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(196,98,45,.4)',
          }}>
            ⠿ Trascina
          </div>
          <BlockRenderer block={block} context={context} />
        </div>
      ))}
    </>
  )
}

export default function PageRenderer({
  content,
  context = {},
  pageSlug,
}: {
  content: PageContent
  context?: PageRenderContext
  pageSlug?: string
}) {
  const { isEditing } = useEditMode()
  const css = useMemo(() => buildResponsiveCss(content.blocks), [content.blocks])
  const showDrag = isEditing && Boolean(pageSlug)

  return (
    <div className="cms-page" data-cms-page style={{ containerType: 'inline-size', containerName: 'cms-canvas' }}>
      {css ? <style>{css}</style> : null}
      {showDrag ? (
        <DraggableBlockList
          blocks={content.blocks}
          context={context}
          pageSlug={pageSlug!}
          content={content}
        />
      ) : (
        content.blocks.map((b) => (
          <BlockRenderer key={b.id} block={b} context={context} />
        ))
      )}
    </div>
  )
}
