'use client'

import type { Block } from '@/lib/cms/types'
import type { PageRenderContext } from '../PageRenderer'
import { buildLayoutStyle } from '../PageRenderer'

type Props = {
  block: Block
  context: PageRenderContext
  renderChildren: (children?: Block[]) => React.ReactNode
}

export default function SectionBlock({ block, renderChildren }: Props) {
  const p = block.props as Record<string, string | undefined>
  const layoutStyle = buildLayoutStyle(block.layout)
  const hasImage = Boolean(p.backgroundImage)
  const overlay = p.backgroundOverlay
  const minHeight = p.minHeight

  return (
    <section
      id={p.anchorId || undefined}
      data-block-id={block.id}
      data-block-type="section"
      data-header-theme={p.headerTheme === 'dark' ? 'dark' : 'light'}
      data-cms-block
      style={{
        position: 'relative',
        background: p.background || 'transparent',
        paddingTop: p.paddingY || '4rem',
        paddingBottom: p.paddingY || '4rem',
        paddingLeft: p.paddingX || '1.5rem',
        paddingRight: p.paddingX || '1.5rem',
        minHeight: minHeight && minHeight !== '0' ? minHeight : undefined,
        color: 'inherit',
        overflow: 'hidden',
        ...layoutStyle,
      }}
    >
      {hasImage && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${p.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {overlay && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: overlay,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: p.contentWidth || '1180px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {renderChildren(block.children)}
      </div>
    </section>
  )
}
