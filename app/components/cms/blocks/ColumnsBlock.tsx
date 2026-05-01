'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

type Props = {
  block: Block
  renderChildren: (children?: Block[]) => React.ReactNode
}

export default function ColumnsBlock({ block, renderChildren }: Props) {
  const p = block.props as Record<string, unknown>
  const columns = Math.max(1, Math.min(6, Number(p.columns ?? 2)))
  const gap = (p.gap as string) ?? '1.5rem'
  const align = (p.align as string) ?? 'stretch'

  return (
    <div
      data-block-id={block.id}
      data-block-type="columns"
      data-cms-block
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
        alignItems: align === 'stretch' ? 'stretch' : align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start',
        ...buildLayoutStyle(block.layout),
      }}
    >
      {renderChildren(block.children)}
    </div>
  )
}
