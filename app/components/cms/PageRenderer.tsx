'use client'

import { useMemo } from 'react'
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
}

export type PageRenderContext = {
  isAdmin?: boolean
  immobili?: PropertyForBlocks[]
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
  // Base style applied always; the responsive overrides are emitted as CSS
  // through `useResponsiveCss` below.
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
      lines.push(`@media (max-width: 1024px) { [data-block-id="${b.id}"] { ${cssText(tablet)} } }`)
    }
    if (Object.keys(mobile).length > 0) {
      lines.push(`@media (max-width: 640px) { [data-block-id="${b.id}"] { ${cssText(mobile)} } }`)
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

export default function PageRenderer({
  content,
  context = {},
}: {
  content: PageContent
  context?: PageRenderContext
}) {
  const css = useMemo(() => buildResponsiveCss(content.blocks), [content.blocks])
  return (
    <div className="cms-page" data-cms-page>
      {css ? <style>{css}</style> : null}
      {content.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} context={context} />
      ))}
    </div>
  )
}
