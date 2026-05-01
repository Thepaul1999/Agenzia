// CMS shared types
// ----------------------------------------------------------------
// A page is a tree of blocks. Each block has a `type` (mapped to a
// React component in the block registry), a `props` object and a
// per-breakpoint `layout` object.

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

export type BlockLayoutEntry = {
  hidden?: boolean
  width?: string // e.g. "100%", "50%", "300px", "auto"
  height?: string // e.g. "auto", "400px"
  position?: 'static' | 'absolute'
  top?: string
  left?: string
  right?: string
  bottom?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  paddingTop?: string
  paddingBottom?: string
  paddingLeft?: string
  paddingRight?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  textAlign?: 'left' | 'center' | 'right'
  columns?: number
  gap?: string
  zIndex?: number
}

export type BlockLayout = Partial<Record<Breakpoint, BlockLayoutEntry>>

export type BlockProps = Record<string, unknown>

export type Block = {
  id: string
  type: string
  props: BlockProps
  layout?: BlockLayout
  children?: Block[]
}

export type PageMeta = {
  title?: string
  description?: string
}

export type PageGlobal = {
  background?: string
  textColor?: string
  fontPrimary?: string
  containerWidth?: string
}

export type PageContent = {
  meta?: PageMeta
  global?: PageGlobal
  blocks: Block[]
}

export type PageRow = {
  id: string
  slug: string
  title: string | null
  description: string | null
  draft_content: PageContent
  published_content: PageContent | null
  draft_updated_at: string | null
  published_at: string | null
  version: number
}

export type PageSummary = {
  slug: string
  title: string | null
  description: string | null
  hasPublished: boolean
  publishedAt: string | null
  draftUpdatedAt: string | null
  version: number
}

export type RevisionRow = {
  id: string
  page_id: string
  version: number
  content: PageContent
  created_at: string
  created_by: string | null
}

// ----- Block schema -----
// Used for the inspector to render the right control for each prop.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'color'
  | 'image'
  | 'href'
  | 'select'
  | 'enum'

export type BlockField = {
  key: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
  defaultValue?: unknown
  placeholder?: string
  hint?: string
  group?: string
}

export type BlockDefinition = {
  type: string
  name: string
  category: 'layout' | 'text' | 'media' | 'data' | 'actions' | 'advanced'
  icon: string
  description?: string
  defaultProps: BlockProps
  defaultLayout?: BlockLayout
  fields: BlockField[]
  acceptsChildren?: boolean
}

export type BlockTree = Block[]
