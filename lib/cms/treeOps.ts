import type { Block, BlockLayout, PageContent } from './types'
import { BLOCK_DEF_BY_TYPE } from './blockDefinitions'

let counter = 0
export function newBlockId(type: string) {
  counter += 1
  return `${type}-${Date.now().toString(36)}-${counter.toString(36)}`
}

export function createBlock(type: string): Block | null {
  const def = BLOCK_DEF_BY_TYPE[type]
  if (!def) return null
  const block: Block = {
    id: newBlockId(type),
    type,
    props: { ...def.defaultProps },
  }
  if (def.acceptsChildren) block.children = []
  if (def.defaultLayout) block.layout = JSON.parse(JSON.stringify(def.defaultLayout)) as BlockLayout
  return block
}

export function findBlock(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b
    if (b.children) {
      const found = findBlock(b.children, id)
      if (found) return found
    }
  }
  return null
}

export function findBlockParent(blocks: Block[], id: string, parent: Block | null = null): { parent: Block | null; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.id === id) return { parent, index: i }
    if (b.children) {
      const found = findBlockParent(b.children, id, b)
      if (found) return found
    }
  }
  return null
}

function getList(content: PageContent, parentId: string | null): Block[] {
  if (parentId === null) return content.blocks
  const parent = findBlock(content.blocks, parentId)
  if (!parent) return content.blocks
  if (!parent.children) parent.children = []
  return parent.children
}

export function insertBlock(content: PageContent, block: Block, parentId: string | null, index: number): PageContent {
  const next = cloneContent(content)
  const list = getList(next, parentId)
  const idx = Math.max(0, Math.min(index, list.length))
  list.splice(idx, 0, block)
  return next
}

export function moveBlock(content: PageContent, sourceId: string, targetParentId: string | null, targetIndex: number): PageContent {
  if (sourceId === targetParentId) return content
  const next = cloneContent(content)
  const found = findBlockParent(next.blocks, sourceId)
  if (!found) return content
  const sourceList = found.parent ? found.parent.children! : next.blocks
  const [moved] = sourceList.splice(found.index, 1)

  // Prevent moving into own descendants.
  if (targetParentId && isDescendant(moved, targetParentId)) {
    sourceList.splice(found.index, 0, moved)
    return content
  }

  const destList = getList(next, targetParentId)
  let idx = targetIndex
  if (sourceList === destList && found.index < idx) idx -= 1
  destList.splice(Math.max(0, Math.min(idx, destList.length)), 0, moved)
  return next
}

function isDescendant(block: Block, candidateId: string): boolean {
  if (block.id === candidateId) return true
  if (!block.children) return false
  return block.children.some((c) => isDescendant(c, candidateId))
}

export function deleteBlock(content: PageContent, id: string): PageContent {
  const next = cloneContent(content)
  const found = findBlockParent(next.blocks, id)
  if (!found) return content
  const list = found.parent ? found.parent.children! : next.blocks
  list.splice(found.index, 1)
  return next
}

export function duplicateBlock(content: PageContent, id: string): PageContent {
  const next = cloneContent(content)
  const found = findBlockParent(next.blocks, id)
  if (!found) return content
  const list = found.parent ? found.parent.children! : next.blocks
  const clone = cloneBlockFresh(list[found.index])
  list.splice(found.index + 1, 0, clone)
  return next
}

export function updateBlockProps(content: PageContent, id: string, patch: Record<string, unknown>): PageContent {
  const next = cloneContent(content)
  const target = findBlock(next.blocks, id)
  if (!target) return content
  target.props = { ...target.props, ...patch }
  return next
}

export function updateBlockLayout(content: PageContent, id: string, breakpoint: 'desktop' | 'tablet' | 'mobile', patch: Record<string, unknown>): PageContent {
  const next = cloneContent(content)
  const target = findBlock(next.blocks, id)
  if (!target) return content
  if (!target.layout) target.layout = {}
  target.layout[breakpoint] = { ...(target.layout[breakpoint] ?? {}), ...patch }
  return next
}

export function updateMeta(content: PageContent, patch: Partial<NonNullable<PageContent['meta']>>): PageContent {
  const next = cloneContent(content)
  next.meta = { ...(next.meta ?? {}), ...patch }
  return next
}

export function moveBlockBy(content: PageContent, id: string, delta: number): PageContent {
  const next = cloneContent(content)
  const found = findBlockParent(next.blocks, id)
  if (!found) return content
  const list = found.parent ? found.parent.children! : next.blocks
  const newIdx = Math.max(0, Math.min(list.length - 1, found.index + delta))
  if (newIdx === found.index) return content
  const [item] = list.splice(found.index, 1)
  list.splice(newIdx, 0, item)
  return next
}

function cloneBlockFresh(block: Block): Block {
  return {
    id: newBlockId(block.type),
    type: block.type,
    props: JSON.parse(JSON.stringify(block.props)),
    layout: block.layout ? (JSON.parse(JSON.stringify(block.layout)) as BlockLayout) : undefined,
    children: block.children ? block.children.map(cloneBlockFresh) : undefined,
  }
}

export function cloneContent(content: PageContent): PageContent {
  return JSON.parse(JSON.stringify(content)) as PageContent
}
