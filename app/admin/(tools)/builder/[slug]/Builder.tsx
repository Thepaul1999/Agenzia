'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Block, PageContent } from '@/lib/cms/types'
import { BLOCK_DEFINITIONS, BLOCK_DEF_BY_TYPE } from '@/lib/cms/blockDefinitions'
import { createBlock, findBlock, findBlockParent, deleteBlock, duplicateBlock, insertBlock, moveBlock, updateBlockProps, updateBlockLayout, updateMeta, moveBlockBy } from '@/lib/cms/treeOps'
import PageRenderer, { type PropertyForBlocks } from '@/app/components/cms/PageRenderer'
import Inspector from './Inspector'

type Props = {
  slug: string
  initialContent: PageContent
  title: string
  route: string
  properties?: unknown[]
}

type Breakpoint = 'desktop' | 'tablet' | 'mobile'
type DragData =
  | { kind: 'new'; type: string }
  | { kind: 'move'; id: string }
  | null

const BREAKPOINT_WIDTHS: Record<Breakpoint, string> = {
  desktop: '100%',
  tablet: 'min(900px, calc(100vw - 2rem))',
  mobile: 'min(420px, calc(100vw - 2rem))',
}

export default function Builder({ slug, initialContent, title, route, properties = [] }: Props) {
  const [content, setContent] = useState<PageContent>(initialContent)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [immersivePreview, setImmersivePreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [revisions, setRevisions] = useState<Array<{ id: string; version: number; created_at: string }>>([])
  const [revisionsOpen, setRevisionsOpen] = useState(false)
  const dragData = useRef<DragData>(null)

  const selectedBlock = useMemo(() => (selectedId ? findBlock(content.blocks, selectedId) : null), [content, selectedId])
  const renderContext = useMemo(
    () => ({ immobili: properties as PropertyForBlocks[] }),
    [properties]
  )

  const setContentDirty = useCallback((updater: (c: PageContent) => PageContent) => {
    setContent((prev) => {
      const next = updater(prev)
      return next
    })
    setDirty(true)
    setStatusMsg(null)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Errore salvataggio')
      }
      setDirty(false)
      setStatusMsg('Bozza salvata')
      setTimeout(() => setStatusMsg(null), 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }, [content, slug])

  const handlePublish = useCallback(async () => {
    if (dirty) {
      await handleSave()
    }
    setPublishing(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}/publish`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Errore pubblicazione')
      }
      setStatusMsg('Pubblicato!')
      setTimeout(() => setStatusMsg(null), 2400)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore')
    } finally {
      setPublishing(false)
    }
  }, [dirty, handleSave, slug])

  const handleReset = useCallback(async () => {
    if (!confirm('Ripristinare il contenuto di default? La bozza corrente verrà sovrascritta.')) return
    setResetting(true)
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (!res.ok) throw new Error('Errore reset')
      const reload = await fetch(`/api/admin/cms/pages/${slug}`)
      const data = await reload.json()
      if (data?.content) {
        setContent(data.content)
        setDirty(false)
        setStatusMsg('Bozza ripristinata al default')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore')
    } finally {
      setResetting(false)
    }
  }, [slug])

  const loadRevisions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}/revisions`)
      const data = await res.json()
      if (data?.revisions) setRevisions(data.revisions)
    } catch {}
  }, [slug])

  useEffect(() => {
    if (revisionsOpen) loadRevisions()
  }, [revisionsOpen, loadRevisions])

  const restoreRevision = async (id: string) => {
    if (!confirm('Caricare questa revisione come nuova bozza?')) return
    try {
      const res = await fetch(`/api/admin/cms/pages/${slug}/revisions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ revisionId: id }),
      })
      if (!res.ok) throw new Error('Errore restore')
      const reload = await fetch(`/api/admin/cms/pages/${slug}`)
      const data = await reload.json()
      if (data?.content) {
        setContent(data.content)
        setDirty(false)
        setStatusMsg('Revisione caricata in bozza')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore')
    }
  }

  // Auto-save every 30s if dirty.
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(() => {
      void handleSave()
    }, 30000)
    return () => clearTimeout(t)
  }, [dirty, handleSave])

  // ----- Drag & Drop helpers -----
  const handleDragStart = (data: DragData) => {
    dragData.current = data
  }
  const handleDropOn = (parentId: string | null, index: number) => {
    const data = dragData.current
    dragData.current = null
    if (!data) return
    if (data.kind === 'new') {
      const block = createBlock(data.type)
      if (!block) return
      setContentDirty((c) => insertBlock(c, block, parentId, index))
      setSelectedId(block.id)
    } else if (data.kind === 'move') {
      setContentDirty((c) => moveBlock(c, data.id, parentId, index))
    }
  }

  // ----- Inspector handlers -----
  const handlePropChange = (patch: Record<string, unknown>) => {
    if (!selectedBlock) return
    setContentDirty((c) => updateBlockProps(c, selectedBlock.id, patch))
  }
  const handleLayoutChange = (patch: Record<string, unknown>) => {
    if (!selectedBlock) return
    setContentDirty((c) => updateBlockLayout(c, selectedBlock.id, breakpoint, patch))
  }
  const handleMetaChange = (patch: { title?: string; description?: string }) => {
    setContentDirty((c) => updateMeta(c, patch))
  }
  const handleDelete = () => {
    if (!selectedBlock) return
    setContentDirty((c) => deleteBlock(c, selectedBlock.id))
    setSelectedId(null)
  }
  const handleDuplicate = () => {
    if (!selectedBlock) return
    setContentDirty((c) => duplicateBlock(c, selectedBlock.id))
  }
  const handleMoveSelected = (delta: number) => {
    if (!selectedBlock) return
    setContentDirty((c) => moveBlockBy(c, selectedBlock.id, delta))
  }

  const previewWidth = immersivePreview
    ? 'min(1560px, calc(100vw - 56px))'
    : BREAKPOINT_WIDTHS[breakpoint]

  return (
    <>
      <style>{builderCss}</style>
      <div className="bld-shell">
        {/* Top bar */}
        <div className="bld-topbar">
          <div className="bld-topbar-left">
            <Link href="/admin/builder" className="bld-back">← Pagine</Link>
            <div>
              <div className="bld-page-slug">{slug}</div>
              <div className="bld-page-title">{title}</div>
            </div>
          </div>
          <div className="bld-topbar-center">
            <button
              type="button"
              className={`bld-bp-btn ${immersivePreview ? 'is-active' : ''}`}
              onClick={() => setImmersivePreview((v) => !v)}
              title="Nasconde libreria e pannello destra per vedere la pagina quasi a tutto schermo"
            >
              {immersivePreview ? '📑 Con pannelli' : '🖼 Anteprima grande'}
            </button>
            <div className={`bld-bp-toggle${immersivePreview ? ' is-disabled' : ''}`}>
              {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`bld-bp-btn ${breakpoint === b && !immersivePreview ? 'is-active' : ''}`}
                  disabled={immersivePreview}
                  onClick={() => setBreakpoint(b)}
                >
                  {b === 'desktop' ? '🖥' : b === 'tablet' ? '📱' : '📲'} {b}
                </button>
              ))}
            </div>
            <a href={route} target="_blank" rel="noopener noreferrer" className="bld-link-btn">↗ Vedi pubblicato</a>
            <button type="button" className="bld-link-btn" onClick={() => setRevisionsOpen((v) => !v)}>
              📜 Revisioni
            </button>
          </div>
          <div className="bld-topbar-right">
            <button type="button" className="bld-secondary" onClick={handleReset} disabled={resetting}>
              {resetting ? '…' : 'Reset default'}
            </button>
            <button type="button" className="bld-secondary" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? 'Salvo…' : dirty ? 'Salva bozza' : '✓ Salvato'}
            </button>
            <button type="button" className="bld-primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Pubblico…' : 'Pubblica'}
            </button>
          </div>
        </div>

        {(statusMsg || errorMsg) && (
          <div className={`bld-flash ${errorMsg ? 'is-err' : 'is-ok'}`}>{errorMsg || statusMsg}</div>
        )}

        {revisionsOpen && (
          <div className="bld-revisions">
            {revisions.length === 0 ? (
              <span style={{ color: 'rgba(255,255,255,.55)' }}>Nessuna revisione ancora.</span>
            ) : (
              revisions.map((r) => (
                <button key={r.id} type="button" className="bld-rev" onClick={() => restoreRevision(r.id)}>
                  v{r.version} · {new Date(r.created_at).toLocaleString('it-IT')}
                </button>
              ))
            )}
          </div>
        )}

        <div className={`bld-body${immersivePreview ? ' bld-body--immersive' : ''}`}>
          {/* LEFT — Library + Outline */}
          <aside className="bld-side bld-side-left">
            <div className="bld-pane">
              <div className="bld-pane-title">Libreria blocchi</div>
              <div className="bld-library">
                {BLOCK_DEFINITIONS.map((def) => (
                  <button
                    key={def.type}
                    type="button"
                    className="bld-lib-item"
                    draggable
                    onDragStart={() => handleDragStart({ kind: 'new', type: def.type })}
                    onDragEnd={() => (dragData.current = null)}
                    onClick={() => {
                      const newB = createBlock(def.type)
                      if (!newB) return
                      const targetParent = selectedBlock && BLOCK_DEF_BY_TYPE[selectedBlock.type]?.acceptsChildren ? selectedBlock.id : null
                      const idx = targetParent
                        ? (findBlock(content.blocks, targetParent)?.children?.length ?? 0)
                        : content.blocks.length
                      setContentDirty((c) => insertBlock(c, newB, targetParent, idx))
                      setSelectedId(newB.id)
                    }}
                    title={def.description}
                  >
                    <span className="bld-lib-icon">{def.icon}</span>
                    <span className="bld-lib-name">{def.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bld-pane">
              <div className="bld-pane-title">Struttura pagina</div>
              <Outline
                blocks={content.blocks}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDragStart={(id) => handleDragStart({ kind: 'move', id })}
                onDropOn={handleDropOn}
              />
              <div style={{ marginTop: '.6rem' }}>
                <DropZone parentId={null} index={content.blocks.length} onDrop={handleDropOn} label="Trascina qui per aggiungere alla fine" />
              </div>
            </div>
          </aside>

          {/* CENTER — Canvas */}
          <main className="bld-canvas-wrap">
            <div
              className={`bld-canvas-frame${!immersivePreview && breakpoint !== 'desktop' ? ` is-${breakpoint}` : ''}`}
              style={{ width: previewWidth }}
            >
              <div
                className="bld-canvas"
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  const blockEl = target.closest('[data-block-id]') as HTMLElement | null
                  if (blockEl) {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedId(blockEl.dataset.blockId ?? null)
                  } else {
                    setSelectedId(null)
                  }
                }}
              >
                {content.blocks.length === 0 ? (
                  <div className="bld-empty">Trascina un blocco dalla libreria a sinistra per iniziare.</div>
                ) : (
                  <PageRenderer content={content} context={renderContext} />
                )}
                <SelectionOverlay selectedId={selectedId} />
              </div>
            </div>
          </main>

          {/* RIGHT — Inspector */}
          <aside className="bld-side bld-side-right">
            <Inspector
              content={content}
              block={selectedBlock}
              breakpoint={breakpoint}
              onPropChange={handlePropChange}
              onLayoutChange={handleLayoutChange}
              onMetaChange={handleMetaChange}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onMoveUp={() => handleMoveSelected(-1)}
              onMoveDown={() => handleMoveSelected(1)}
            />
          </aside>
        </div>
      </div>
    </>
  )
}

// ---------------- Outline ----------------
function Outline({
  blocks,
  selectedId,
  onSelect,
  onDragStart,
  onDropOn,
}: {
  blocks: Block[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDragStart: (id: string) => void
  onDropOn: (parentId: string | null, index: number) => void
}) {
  return (
    <div className="bld-tree">
      <DropZone parentId={null} index={0} onDrop={onDropOn} thin />
      {blocks.map((b, i) => (
        <OutlineNode
          key={b.id}
          block={b}
          parentId={null}
          index={i}
          selectedId={selectedId}
          onSelect={onSelect}
          onDragStart={onDragStart}
          onDropOn={onDropOn}
        />
      ))}
    </div>
  )
}

function OutlineNode({
  block,
  parentId,
  index,
  selectedId,
  onSelect,
  onDragStart,
  onDropOn,
  depth = 0,
}: {
  block: Block
  parentId: string | null
  index: number
  selectedId: string | null
  onSelect: (id: string) => void
  onDragStart: (id: string) => void
  onDropOn: (parentId: string | null, index: number) => void
  depth?: number
}) {
  const def = BLOCK_DEF_BY_TYPE[block.type]
  const acceptsChildren = def?.acceptsChildren
  const isSelected = block.id === selectedId
  return (
    <div>
      <div
        className={`bld-tree-row ${isSelected ? 'is-selected' : ''}`}
        style={{ paddingLeft: `${0.4 + depth * 0.8}rem` }}
        draggable
        onDragStart={(e) => {
          e.stopPropagation()
          onDragStart(block.id)
        }}
        onClick={() => onSelect(block.id)}
        title={`${def?.name ?? block.type} · ${block.id}`}
      >
        <span className="bld-tree-icon">{def?.icon || '?'}</span>
        <span className="bld-tree-label">{def?.name || block.type}</span>
      </div>
      <DropZone parentId={parentId} index={index + 1} onDrop={onDropOn} thin indent={depth} />
      {acceptsChildren && (
        <div>
          <DropZone parentId={block.id} index={0} onDrop={onDropOn} thin indent={depth + 1} label={block.children?.length ? '' : 'Aggiungi all\'interno'} />
          {(block.children ?? []).map((child, ci) => (
            <OutlineNode
              key={child.id}
              block={child}
              parentId={block.id}
              index={ci}
              selectedId={selectedId}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDropOn={onDropOn}
              depth={depth + 1}
            />
          ))}
          {(block.children ?? []).length > 0 && (
            <DropZone parentId={block.id} index={(block.children ?? []).length} onDrop={onDropOn} thin indent={depth + 1} />
          )}
        </div>
      )}
    </div>
  )
}

function DropZone({
  parentId,
  index,
  onDrop,
  thin,
  indent = 0,
  label,
}: {
  parentId: string | null
  index: number
  onDrop: (parentId: string | null, index: number) => void
  thin?: boolean
  indent?: number
  label?: string
}) {
  const [over, setOver] = useState(false)
  return (
    <div
      className={`bld-drop ${thin ? 'is-thin' : ''} ${over ? 'is-over' : ''}`}
      style={{ marginLeft: `${indent * 0.8}rem` }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOver(false)
        onDrop(parentId, index)
      }}
    >
      {label}
    </div>
  )
}

// ---------------- Selection overlay ----------------
function SelectionOverlay({ selectedId }: { selectedId: string | null }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!selectedId) {
      setRect(null)
      return
    }
    const update = () => {
      const canvas = document.querySelector('.bld-canvas') as HTMLElement | null
      if (!canvas) return setRect(null)
      const el = canvas.querySelector(`[data-block-id="${selectedId}"]`) as HTMLElement | null
      if (!el) return setRect(null)
      const cRect = canvas.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      const offsetTop = canvas.scrollTop
      setRect(
        new DOMRect(
          eRect.left - cRect.left,
          eRect.top - cRect.top + offsetTop,
          eRect.width,
          eRect.height
        )
      )
    }
    update()
    const ro = new ResizeObserver(update)
    const canvas = document.querySelector('.bld-canvas') as HTMLElement | null
    if (canvas) ro.observe(canvas)
    window.addEventListener('resize', update)
    const interval = setInterval(update, 400)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      clearInterval(interval)
    }
  }, [selectedId])

  if (!rect) return null
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: '2px solid #c4622d',
        borderRadius: 6,
        boxShadow: '0 0 0 2px rgba(196,98,45,.15)',
        zIndex: 50,
      }}
    />
  )
}

// ---------------- CSS ----------------
const builderCss = `
.bld-shell {
  position: fixed;
  inset: 56px 0 0 0;
  background: #15140f;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Manrope', system-ui, sans-serif;
  z-index: 5;
}
.bld-topbar {
  display: flex; align-items: center; gap: 1rem;
  padding: .65rem 1rem;
  background: #0c0c0a;
  border-bottom: 1px solid rgba(255,255,255,.08);
  flex-wrap: wrap;
}
.bld-topbar-left { display: flex; align-items: center; gap: 1rem; }
.bld-topbar-center { display: flex; align-items: center; gap: .6rem; flex: 1; justify-content: center; flex-wrap: wrap; }
.bld-topbar-right { display: flex; align-items: center; gap: .5rem; }
.bld-back { color: rgba(255,255,255,.7); text-decoration: none; font-size: .8rem; padding: .35rem .8rem; border-radius: 999px; background: rgba(255,255,255,.05); }
.bld-back:hover { color: #fff; background: rgba(255,255,255,.1); }
.bld-page-slug { font-family: 'Syne', sans-serif; font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #c4622d; }
.bld-page-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: .9rem; }

.bld-bp-toggle { display: inline-flex; gap: .15rem; background: rgba(255,255,255,.06); padding: .2rem; border-radius: 999px; }
.bld-bp-btn { padding: .35rem .75rem; border-radius: 999px; background: transparent; color: rgba(255,255,255,.6); border: none; cursor: pointer; font-size: .7rem; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.bld-bp-btn.is-active { background: #fff; color: #0c0c0a; }
.bld-link-btn { padding: .35rem .8rem; border-radius: 999px; background: rgba(255,255,255,.05); color: rgba(255,255,255,.7); text-decoration: none; font-size: .7rem; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
.bld-link-btn:hover { color: #fff; }
.bld-secondary, .bld-primary { padding: .55rem 1rem; border-radius: 999px; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; }
.bld-secondary { background: rgba(255,255,255,.06); color: #fff; }
.bld-secondary:hover:not(:disabled) { background: rgba(255,255,255,.12); }
.bld-secondary:disabled { opacity: .5; cursor: not-allowed; }
.bld-primary { background: #c4622d; color: #fff; }
.bld-primary:hover:not(:disabled) { background: #d8743b; }
.bld-primary:disabled { opacity: .6; cursor: not-allowed; }

.bld-flash { padding: .5rem 1rem; font-size: .82rem; }
.bld-flash.is-ok { background: #294a36; color: #c8eeda; }
.bld-flash.is-err { background: #5a2222; color: #f4c1c1; }

.bld-revisions { display: flex; flex-wrap: wrap; gap: .4rem; padding: .8rem 1rem; background: #0c0c0a; border-bottom: 1px solid rgba(255,255,255,.08); }
.bld-rev { padding: .35rem .8rem; border-radius: 999px; background: rgba(255,255,255,.05); color: rgba(255,255,255,.8); border: none; cursor: pointer; font-size: .72rem; font-family: 'Syne', sans-serif; }
.bld-rev:hover { background: rgba(196,98,45,.3); color: #fff; }

.bld-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 280px 1fr 320px; }
.bld-body.bld-body--immersive { grid-template-columns: 1fr; }
.bld-body.bld-body--immersive .bld-side { display: none !important; }
.bld-body.bld-body--immersive .bld-canvas-wrap { padding: 0.65rem 0.85rem; align-items: stretch; }
.bld-body.bld-body--immersive .bld-canvas-frame { max-width: 100%; min-height: calc(100vh - 120px); }
.bld-body.bld-body--immersive .bld-canvas { min-height: calc(100vh - 136px); }
.bld-bp-toggle.is-disabled { opacity: 0.45; pointer-events: none; filter: grayscale(0.2); }

.bld-side { background: #1a1915; border-right: 1px solid rgba(255,255,255,.06); overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
.bld-side-right { border-right: none; border-left: 1px solid rgba(255,255,255,.06); }

.bld-pane { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: .9rem; }
.bld-pane-title { font-family: 'Syne', sans-serif; font-size: .62rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: .8rem; }

.bld-library { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; }
.bld-lib-item { display: flex; flex-direction: column; align-items: center; gap: .2rem; padding: .65rem .4rem; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; color: #fff; cursor: grab; font-size: .7rem; font-family: 'Manrope', sans-serif; }
.bld-lib-item:hover { background: rgba(196,98,45,.18); border-color: rgba(196,98,45,.35); }
.bld-lib-item:active { cursor: grabbing; }
.bld-lib-icon { font-size: 1rem; }
.bld-lib-name { color: rgba(255,255,255,.85); text-align: center; line-height: 1.1; }

.bld-tree { display: flex; flex-direction: column; gap: 0; }
.bld-tree-row { display: flex; align-items: center; gap: .45rem; padding: .35rem .6rem; border-radius: 8px; cursor: grab; font-size: .8rem; color: rgba(255,255,255,.85); }
.bld-tree-row:hover { background: rgba(255,255,255,.05); }
.bld-tree-row.is-selected { background: rgba(196,98,45,.22); color: #fff; }
.bld-tree-row:active { cursor: grabbing; }
.bld-tree-icon { width: 18px; text-align: center; color: rgba(255,255,255,.55); }
.bld-tree-label { flex: 1; }
.bld-drop { height: 14px; margin: 2px 0; border-radius: 6px; transition: background .12s; display: flex; align-items: center; justify-content: center; font-size: .68rem; color: rgba(255,255,255,.4); }
.bld-drop.is-thin { height: 8px; }
.bld-drop.is-over { background: rgba(196,98,45,.4); height: 18px; }

.bld-canvas-wrap { background: #2a2825; padding: 1rem; overflow: auto; display: flex; justify-content: center; align-items: flex-start; min-height: 0; }
.bld-canvas-frame { position: relative; background: #fff; border-radius: 14px; overflow: auto; box-shadow: 0 30px 80px rgba(0,0,0,.5); transition: width .25s ease; min-height: min(600px, 75vh); max-width: 100%; width: 100%; box-sizing: border-box; container-type: inline-size; container-name: cms-canvas; }
.bld-canvas { position: relative; min-height: min(600px, 70vh); color: #0c0c0a; font-family: 'Manrope', system-ui, sans-serif; overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* Phone device chrome */
.bld-canvas-frame.is-mobile {
  border-radius: 36px;
  border: 10px solid #1c1c1e;
  box-shadow: 0 0 0 2px #3a3a3c, 0 40px 100px rgba(0,0,0,.7);
  position: relative;
  transform: none;
  margin-bottom: 1rem;
}
.bld-canvas-frame.is-mobile::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 28px;
  background: #1c1c1e;
  border-radius: 0 0 18px 18px;
  z-index: 10;
}
.bld-canvas-frame.is-mobile::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: #3a3a3c;
  border-radius: 4px;
  z-index: 10;
}

/* Tablet device chrome */
.bld-canvas-frame.is-tablet {
  border-radius: 24px;
  border: 8px solid #1c1c1e;
  box-shadow: 0 0 0 2px #3a3a3c, 0 40px 100px rgba(0,0,0,.7);
}
.bld-canvas-frame.is-tablet::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: #3a3a3c;
  border-radius: 4px;
  z-index: 10;
}
.bld-canvas-frame.is-tablet::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #3a3a3c;
  border-radius: 50%;
  z-index: 10;
}
.bld-canvas [data-cms-block] { cursor: pointer; }
.bld-empty { padding: 3rem 2rem; text-align: center; color: #7c7770; font-style: italic; }

@media (max-width: 1100px) {
  .bld-body { grid-template-columns: 240px 1fr 280px; }
}
@media (max-width: 900px) {
  .bld-body { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
  .bld-side { max-height: 280px; }
}
`
