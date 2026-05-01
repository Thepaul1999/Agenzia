'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function DividerBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined>
  return (
    <div
      data-block-id={block.id}
      data-block-type="divider"
      data-cms-block
      style={{
        margin: '1rem 0',
        height: p.thickness || '1px',
        background: p.color || '#e9e4dd',
        ...buildLayoutStyle(block.layout),
      }}
    />
  )
}
