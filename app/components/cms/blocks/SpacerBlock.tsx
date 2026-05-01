'use client'

import type { Block } from '@/lib/cms/types'
import { buildLayoutStyle } from '../PageRenderer'

export default function SpacerBlock({ block }: { block: Block }) {
  const p = block.props as Record<string, string | undefined>
  return (
    <div
      data-block-id={block.id}
      data-block-type="spacer"
      data-cms-block
      style={{ height: p.size || '3rem', ...buildLayoutStyle(block.layout) }}
    />
  )
}
