import { BLOCK_DEF_BY_TYPE } from './blockDefinitions'
import type { Block, PageContent } from './types'

const MAX_BLOCKS = 500
const MAX_DEPTH = 6

function validateBlock(input: unknown, depth: number): Block | null {
  if (depth > MAX_DEPTH) return null
  if (!input || typeof input !== 'object') return null

  const obj = input as Record<string, unknown>
  const type = typeof obj.type === 'string' ? obj.type : null
  if (!type) return null
  if (!BLOCK_DEF_BY_TYPE[type]) return null

  const id = typeof obj.id === 'string' && obj.id.length > 0 ? obj.id : `${type}-${Math.random().toString(36).slice(2, 8)}`
  const props = obj.props && typeof obj.props === 'object' ? (obj.props as Record<string, unknown>) : {}
  const layout = obj.layout && typeof obj.layout === 'object' ? (obj.layout as Block['layout']) : undefined
  const childrenRaw = Array.isArray(obj.children) ? obj.children : null
  const children = childrenRaw
    ? (childrenRaw
        .map((c) => validateBlock(c, depth + 1))
        .filter((c): c is Block => Boolean(c)))
    : undefined

  return { id, type, props, layout, children }
}

export function validatePageContent(input: unknown): PageContent {
  if (!input || typeof input !== 'object') {
    return { meta: {}, blocks: [] }
  }
  const obj = input as Record<string, unknown>
  const meta = obj.meta && typeof obj.meta === 'object' ? (obj.meta as PageContent['meta']) : {}
  const global = obj.global && typeof obj.global === 'object' ? (obj.global as PageContent['global']) : {}
  const blocksRaw = Array.isArray(obj.blocks) ? obj.blocks : []
  const blocks: Block[] = []
  for (const raw of blocksRaw) {
    if (blocks.length >= MAX_BLOCKS) break
    const valid = validateBlock(raw, 1)
    if (valid) blocks.push(valid)
  }
  return { meta, global, blocks }
}
