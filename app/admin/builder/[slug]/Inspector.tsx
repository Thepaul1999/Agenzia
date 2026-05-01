'use client'

import { useMemo } from 'react'
import type { Block, BlockField, PageContent } from '@/lib/cms/types'
import { BLOCK_DEF_BY_TYPE } from '@/lib/cms/blockDefinitions'

type Props = {
  content: PageContent
  block: Block | null
  breakpoint: 'desktop' | 'tablet' | 'mobile'
  onPropChange: (patch: Record<string, unknown>) => void
  onLayoutChange: (patch: Record<string, unknown>) => void
  onMetaChange: (patch: { title?: string; description?: string }) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function Inspector({
  content,
  block,
  breakpoint,
  onPropChange,
  onLayoutChange,
  onMetaChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: Props) {
  if (!block) return <PageInspector content={content} onMetaChange={onMetaChange} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BlockHeader block={block} onDelete={onDelete} onDuplicate={onDuplicate} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
      <BlockProps block={block} onPropChange={onPropChange} />
      <LayoutPanel block={block} breakpoint={breakpoint} onLayoutChange={onLayoutChange} />
      <ItemsEditor block={block} onPropChange={onPropChange} />
    </div>
  )
}

function PageInspector({
  content,
  onMetaChange,
}: {
  content: PageContent
  onMetaChange: (patch: { title?: string; description?: string }) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
      <PaneTitle>Pagina</PaneTitle>
      <Field label="Titolo">
        <input
          type="text"
          value={content.meta?.title ?? ''}
          onChange={(e) => onMetaChange({ title: e.target.value })}
          style={inputStyle}
        />
      </Field>
      <Field label="Descrizione">
        <textarea
          value={content.meta?.description ?? ''}
          onChange={(e) => onMetaChange({ description: e.target.value })}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
        />
      </Field>
      <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.78rem', lineHeight: 1.55, margin: 0 }}>
        Seleziona un blocco nel canvas o nella struttura per modificarne le proprietà. Trascina dalla libreria per
        aggiungerne di nuovi.
      </p>
    </div>
  )
}

function BlockHeader({
  block,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  block: Block
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const def = BLOCK_DEF_BY_TYPE[block.type]
  return (
    <div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#c4622d' }}>
        {def?.category}
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 800, marginBottom: '.6rem' }}>
        {def?.name || block.type}
      </div>
      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
        <button type="button" style={smallBtn} onClick={onMoveUp}>↑</button>
        <button type="button" style={smallBtn} onClick={onMoveDown}>↓</button>
        <button type="button" style={smallBtn} onClick={onDuplicate}>Duplica</button>
        <button type="button" style={{ ...smallBtn, background: 'rgba(220,80,80,.2)', color: '#ffb6b6' }} onClick={onDelete}>Elimina</button>
      </div>
    </div>
  )
}

function BlockProps({ block, onPropChange }: { block: Block; onPropChange: (patch: Record<string, unknown>) => void }) {
  const def = BLOCK_DEF_BY_TYPE[block.type]
  const groups = useMemo(() => {
    const map = new Map<string, BlockField[]>()
    for (const f of def?.fields ?? []) {
      const g = f.group ?? 'Generale'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(f)
    }
    return Array.from(map.entries())
  }, [def])

  if (!def) return null
  if (def.fields.length === 0 && !['cards', 'testimonials', 'stats', 'gallery', 'buttonGroup'].includes(def.type)) {
    return <div style={{ color: 'rgba(255,255,255,.55)', fontSize: '.78rem' }}>Nessuna proprietà aggiuntiva.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {groups.map(([groupName, fields]) => (
        <div key={groupName} style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          <PaneTitle>{groupName}</PaneTitle>
          {fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={(block.props as Record<string, unknown>)[field.key]}
              onChange={(v) => onPropChange({ [field.key]: v })}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function FieldControl({ field, value, onChange }: { field: BlockField; value: unknown; onChange: (v: unknown) => void }) {
  const inputType = field.type
  if (inputType === 'textarea') {
    return (
      <Field label={field.label}>
        <textarea
          value={(value as string) ?? ''}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
        />
        {field.hint && <Hint>{field.hint}</Hint>}
      </Field>
    )
  }
  if (inputType === 'boolean') {
    return (
      <Field label={field.label}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', color: '#fff', fontSize: '.85rem' }}>
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          Attiva
        </label>
      </Field>
    )
  }
  if (inputType === 'select' || inputType === 'enum') {
    return (
      <Field label={field.label}>
        <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    )
  }
  if (inputType === 'color') {
    return (
      <Field label={field.label}>
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <input
            type="color"
            value={normalizeColor((value as string) ?? '#000000')}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 40, height: 32, padding: 0, border: 'none', borderRadius: 6, background: 'transparent' }}
          />
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#hex / rgba()"
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </Field>
    )
  }
  if (inputType === 'number') {
    return (
      <Field label={field.label}>
        <input
          type="number"
          value={(value as number | string) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          style={inputStyle}
        />
      </Field>
    )
  }
  if (inputType === 'image') {
    return (
      <Field label={field.label}>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL o /percorso/immagine.jpg"
          style={inputStyle}
        />
        <Hint>Puoi puntare a immagini in /public, alla bucket Supabase, o ad URL esterni.</Hint>
      </Field>
    )
  }
  if (inputType === 'href') {
    return (
      <Field label={field.label}>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/immobili oppure https://..."
          style={inputStyle}
        />
      </Field>
    )
  }
  // default text
  return (
    <Field label={field.label}>
      <input
        type="text"
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={inputStyle}
      />
    </Field>
  )
}

function LayoutPanel({
  block,
  breakpoint,
  onLayoutChange,
}: {
  block: Block
  breakpoint: 'desktop' | 'tablet' | 'mobile'
  onLayoutChange: (patch: Record<string, unknown>) => void
}) {
  const layout = block.layout?.[breakpoint] ?? {}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
      <PaneTitle>Layout · {breakpoint}</PaneTitle>
      <Field label="Visibilità">
        <label style={{ color: '#fff', fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
          <input
            type="checkbox"
            checked={Boolean(layout.hidden)}
            onChange={(e) => onLayoutChange({ hidden: e.target.checked || undefined })}
          />
          Nascondi su {breakpoint}
        </label>
      </Field>
      <Row>
        <Field label="Margine sopra">
          <input
            type="text"
            value={layout.marginTop ?? ''}
            onChange={(e) => onLayoutChange({ marginTop: e.target.value || undefined })}
            placeholder="es. 2rem"
            style={inputStyle}
          />
        </Field>
        <Field label="Margine sotto">
          <input
            type="text"
            value={layout.marginBottom ?? ''}
            onChange={(e) => onLayoutChange({ marginBottom: e.target.value || undefined })}
            placeholder="es. 2rem"
            style={inputStyle}
          />
        </Field>
      </Row>
      <Row>
        <Field label="Larghezza">
          <input
            type="text"
            value={layout.width ?? ''}
            onChange={(e) => onLayoutChange({ width: e.target.value || undefined })}
            placeholder="es. 100% / 50% / 280px"
            style={inputStyle}
          />
        </Field>
        <Field label="Allineamento testo">
          <select
            value={(layout.textAlign as string) ?? ''}
            onChange={(e) => onLayoutChange({ textAlign: e.target.value || undefined })}
            style={inputStyle}
          >
            <option value="">—</option>
            <option value="left">Sinistra</option>
            <option value="center">Centro</option>
            <option value="right">Destra</option>
          </select>
        </Field>
      </Row>
    </div>
  )
}

// ItemsEditor lets the user edit array-of-objects props (cards, testimonials,
// stats, gallery images, button groups).
function ItemsEditor({ block, onPropChange }: { block: Block; onPropChange: (patch: Record<string, unknown>) => void }) {
  const config = ITEMS_CONFIG[block.type]
  if (!config) return null
  const list = ((block.props as Record<string, unknown>)[config.key] as Array<Record<string, unknown>>) || []

  const update = (idx: number, patch: Record<string, unknown>) => {
    const next = list.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    onPropChange({ [config.key]: next })
  }
  const add = () => {
    onPropChange({ [config.key]: [...list, { ...config.template }] })
  }
  const remove = (idx: number) => {
    onPropChange({ [config.key]: list.filter((_, i) => i !== idx) })
  }
  const moveBy = (idx: number, delta: number) => {
    const next = list.slice()
    const newIdx = idx + delta
    if (newIdx < 0 || newIdx >= next.length) return
    const [item] = next.splice(idx, 1)
    next.splice(newIdx, 0, item)
    onPropChange({ [config.key]: next })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
      <PaneTitle>{config.label}</PaneTitle>
      {list.map((item, idx) => (
        <div key={idx} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '.7rem', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.6)' }}>
              {config.label.replace(/i$/, '')} {idx + 1}
            </span>
            <div style={{ display: 'flex', gap: '.25rem' }}>
              <button type="button" style={smallBtn} onClick={() => moveBy(idx, -1)}>↑</button>
              <button type="button" style={smallBtn} onClick={() => moveBy(idx, 1)}>↓</button>
              <button type="button" style={{ ...smallBtn, color: '#ffb6b6' }} onClick={() => remove(idx)}>×</button>
            </div>
          </div>
          {config.fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={item[field.key]}
              onChange={(v) => update(idx, { [field.key]: v })}
            />
          ))}
        </div>
      ))}
      <button type="button" style={{ ...smallBtn, padding: '.5rem 1rem' }} onClick={add}>
        + Aggiungi
      </button>
    </div>
  )
}

const ITEMS_CONFIG: Record<string, { key: string; label: string; template: Record<string, unknown>; fields: BlockField[] }> = {
  cards: {
    key: 'items',
    label: 'Cards',
    template: { title: 'Nuova card', body: 'Descrizione...', icon: '' },
    fields: [
      { key: 'title', label: 'Titolo', type: 'text' },
      { key: 'body', label: 'Testo', type: 'textarea' },
      { key: 'icon', label: 'Icona/emoji', type: 'text' },
    ],
  },
  testimonials: {
    key: 'items',
    label: 'Recensioni',
    template: { text: 'Testo recensione', role: 'Cliente', initial: 'X.Y.' },
    fields: [
      { key: 'text', label: 'Testo', type: 'textarea' },
      { key: 'role', label: 'Ruolo / contesto', type: 'text' },
      { key: 'initial', label: 'Iniziali', type: 'text' },
    ],
  },
  stats: {
    key: 'items',
    label: 'Numeri',
    template: { n: '0', suffix: '', label: 'Etichetta' },
    fields: [
      { key: 'n', label: 'Numero', type: 'text' },
      { key: 'suffix', label: 'Suffisso (es. + %)', type: 'text' },
      { key: 'label', label: 'Etichetta', type: 'text' },
    ],
  },
  gallery: {
    key: 'images',
    label: 'Immagini',
    template: { src: '', alt: '' },
    fields: [
      { key: 'src', label: 'URL immagine', type: 'image' },
      { key: 'alt', label: 'Alt', type: 'text' },
    ],
  },
  buttonGroup: {
    key: 'buttons',
    label: 'Pulsanti',
    template: { text: 'Pulsante', href: '/', variant: 'primary' },
    fields: [
      { key: 'text', label: 'Testo', type: 'text' },
      { key: 'href', label: 'Link', type: 'href' },
      {
        key: 'variant',
        label: 'Stile',
        type: 'select',
        options: [
          { value: 'primary', label: 'Primario' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'ghost-white', label: 'Ghost bianco' },
        ],
      },
      { key: 'newTab', label: 'Nuova scheda', type: 'boolean' },
    ],
  },
}

function PaneTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,.55)',
      }}
    >
      {children}
    </div>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '.7rem', color: 'rgba(255,255,255,.7)', marginBottom: '.2rem', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>
        {label}
      </span>
      {children}
    </label>
  )
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', margin: '.3rem 0 0', lineHeight: 1.5 }}>{children}</p>
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>{children}</div>
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '.45rem .6rem',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,.12)',
  background: '#0c0c0a',
  color: '#fff',
  fontSize: '.85rem',
  fontFamily: 'inherit',
}
const smallBtn: React.CSSProperties = {
  padding: '.3rem .55rem',
  borderRadius: 6,
  background: 'rgba(255,255,255,.08)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '.7rem',
  fontFamily: 'inherit',
}

function normalizeColor(input: string): string {
  if (!input) return '#000000'
  if (/^#[0-9a-f]{3,8}$/i.test(input)) {
    if (input.length === 4) {
      return '#' + input.slice(1).split('').map((c) => c + c).join('')
    }
    return input.slice(0, 7)
  }
  return '#000000'
}
