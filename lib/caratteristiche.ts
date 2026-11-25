// Caratteristiche dell'immobile (stile portali): salvate in immobili.caratteristiche (jsonb).

export type Opt = { v: string; it: string; en: string }

export const TIPOLOGIE: Opt[] = [
  { v: 'appartamento', it: 'Appartamento', en: 'Apartment' },
  { v: 'casa_indipendente', it: 'Casa indipendente', en: 'Detached house' },
  { v: 'villa', it: 'Villa', en: 'Villa' },
  { v: 'villetta_schiera', it: 'Villetta a schiera', en: 'Terraced house' },
  { v: 'villetta_bifamiliare', it: 'Villetta bifamiliare', en: 'Semi-detached house' },
  { v: 'cascinale', it: 'Cascinale / rustico', en: 'Farmhouse / country house' },
  { v: 'terreno', it: 'Terreno', en: 'Land' },
]

export const STATI_CONSERVAZIONE: Opt[] = [
  { v: 'nuova', it: 'Nuova costruzione', en: 'New build' },
  { v: 'buono', it: 'Buono stato', en: 'Good condition' },
  { v: 'da_ristrutturare', it: 'Da ristrutturare', en: 'To renovate' },
]

export const ORIENTAMENTI: Opt[] = [
  { v: 'nord', it: 'Nord', en: 'North' },
  { v: 'sud', it: 'Sud', en: 'South' },
  { v: 'est', it: 'Est', en: 'East' },
  { v: 'ovest', it: 'Ovest', en: 'West' },
]

export const DOTAZIONI: Opt[] = [
  { v: 'armadi_a_muro', it: 'Armadi a muro', en: 'Built-in wardrobes' },
  { v: 'aria_condizionata', it: 'Aria condizionata', en: 'Air conditioning' },
  { v: 'terrazza', it: 'Terrazza', en: 'Terrace' },
  { v: 'balcone', it: 'Balcone', en: 'Balcony' },
  { v: 'box', it: 'Box', en: 'Garage' },
  { v: 'posto_auto', it: 'Posto auto', en: 'Parking space' },
  { v: 'cantina', it: 'Cantina', en: 'Cellar' },
  { v: 'piscina', it: 'Piscina', en: 'Swimming pool' },
  { v: 'giardino', it: 'Giardino', en: 'Garden' },
]

export const RISCALDAMENTI: Opt[] = [
  { v: 'autonomo', it: 'Autonomo', en: 'Autonomous' },
  { v: 'centralizzato', it: 'Centralizzato', en: 'Central' },
  { v: 'pompa_di_calore', it: 'Pompa di calore', en: 'Heat pump' },
  { v: 'pellet_legna', it: 'Stufa a pellet / legna', en: 'Pellet / wood stove' },
  { v: 'nessuno', it: 'Assente', en: 'None' },
]

export const CLASSI_ENERGETICHE = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export type Caratteristiche = {
  tipologia?: string
  mq_calpestabili?: number
  mq_terreno?: number
  bagni?: number
  piani?: number
  stato_conservazione?: string
  ascensore?: boolean
  orientamento?: string[]
  dotazioni?: string[]
  anno_costruzione?: number
  riscaldamento?: string
  classe_energetica?: string
}

const values = (o: Opt[]) => o.map(x => x.v)

function num(v: unknown, min: number, max: number): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return undefined
  return Math.round(n)
}

function pick(v: unknown, allowed: string[]): string | undefined {
  return typeof v === 'string' && allowed.includes(v) ? v : undefined
}

function pickMany(v: unknown, allowed: string[]): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = v.filter((x): x is string => typeof x === 'string' && allowed.includes(x))
  return out.length ? Array.from(new Set(out)) : undefined
}

/** Accetta un oggetto o una stringa JSON e restituisce solo valori ammessi (nessun dato libero dal client). */
export function sanitizeCaratteristiche(raw: unknown): Caratteristiche {
  let src: unknown = raw
  if (typeof raw === 'string') {
    try {
      src = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!src || typeof src !== 'object') return {}
  const s = src as Record<string, unknown>
  const out: Caratteristiche = {}

  const tipologia = pick(s.tipologia, values(TIPOLOGIE))
  if (tipologia) out.tipologia = tipologia
  const calp = num(s.mq_calpestabili, 1, 100000)
  if (calp !== undefined) out.mq_calpestabili = calp
  const terr = num(s.mq_terreno, 1, 10000000)
  if (terr !== undefined) out.mq_terreno = terr
  const bagni = num(s.bagni, 0, 30)
  if (bagni !== undefined) out.bagni = bagni
  const piani = num(s.piani, 0, 30)
  if (piani !== undefined) out.piani = piani
  const stato = pick(s.stato_conservazione, values(STATI_CONSERVAZIONE))
  if (stato) out.stato_conservazione = stato
  if (typeof s.ascensore === 'boolean') out.ascensore = s.ascensore
  const orient = pickMany(s.orientamento, values(ORIENTAMENTI))
  if (orient) out.orientamento = orient
  const dot = pickMany(s.dotazioni, values(DOTAZIONI))
  if (dot) out.dotazioni = dot
  const anno = num(s.anno_costruzione, 1000, 2100)
  if (anno !== undefined) out.anno_costruzione = anno
  const risc = pick(s.riscaldamento, values(RISCALDAMENTI))
  if (risc) out.riscaldamento = risc
  const classe = pick(s.classe_energetica, [...CLASSI_ENERGETICHE])
  if (classe) out.classe_energetica = classe

  return out
}

export function labelOf(list: Opt[], v: string | undefined, lang: 'it' | 'en'): string {
  const o = list.find(x => x.v === v)
  return o ? o[lang] : ''
}
