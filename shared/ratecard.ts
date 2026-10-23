/**
 * The rate card (24 Oct 2026): the team's pricing sheet, kept as data. Two
 * tables, in the shape the team's own files have (rate-card.csv and
 * rate-card-fees.csv at the repository root):
 *
 * - segments: by section, segment, level and size band, each with a setup fee
 *   (once per study), a cost per recruit (per participant delivered) and an
 *   incentive guide rate (usually per hour), each a range with a note;
 * - fees: standard fees, additional fees, adjustments and the written rules.
 *
 * The team sees all of it in the console. A client sees only the cost per
 * interview it produces; a participant sees only their incentive. Where the
 * sheet gives a range both ends are kept and the lower one is quoted. A cell
 * that cannot be read as a number is never guessed: it is left blank and
 * reported.
 */
import type { RateCard, RateFee, RateRange, RateSegment } from './types'

// ------------------------------------------------------------------ columns

export const SEGMENT_COLUMNS = ['section', 'segment', 'level', 'criteria', 'size_band', 'setup_min', 'setup_max', 'setup_note', 'cpr_min', 'cpr_max', 'cpr_note', 'incentive_min', 'incentive_max', 'incentive_unit', 'incentive_note'] as const
export const FEE_COLUMNS = ['group', 'item', 'amount_min', 'amount_max', 'unit', 'note'] as const

export const EMPTY_RATE_CARD: RateCard = { segments: [], fees: [] }

/** The card in force now. shared/settings.ts keeps it current; nothing else writes it. */
export const RATE_CARD: { current: RateCard } = { current: EMPTY_RATE_CARD }

// --------------------------------------------------------------- reading CSV

/** Splits CSV text into rows of cells, honouring double quotes. Blank lines are dropped. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  const s = text.replace(/^﻿/, '')
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]!
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i += 1 }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i += 1
      row.push(cell); cell = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

/** A number cell: blank is null and fine; anything else that is not a plain number is unreadable. */
function num(raw: string | undefined): { value: number | null; unreadable: boolean } {
  const t = (raw ?? '').trim()
  if (t === '') return { value: null, unreadable: false }
  const clean = t.replace(/[$,\s]/g, '')
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return { value: null, unreadable: true }
  return { value: Number(clean), unreadable: false }
}

/** What a table read from a file came to: which kind it is, its rows, and the cells that could not be read. */
export interface ReadTable {
  kind: 'segments' | 'fees'
  segments: RateSegment[]
  fees: RateFee[]
  /** Cells left blank because they were not numbers: the row's label, the column, and what was there. */
  unreadable: { label: string; field: string; raw: string }[]
  /** Rows that could not be placed at all (no label to match on). */
  skipped: string[]
}

export const segmentLabel = (s: Pick<RateSegment, 'segment' | 'level' | 'sizeBand'>) => [s.segment, s.level, s.sizeBand].filter(Boolean).join(', ')
export const feeLabel = (f: Pick<RateFee, 'group' | 'item'>) => `${f.group}: ${f.item}`
export const segmentKey = (s: Pick<RateSegment, 'section' | 'segment' | 'level' | 'sizeBand'>) => [s.section, s.segment, s.level, s.sizeBand].map(norm).join('|')
export const feeKey = (f: Pick<RateFee, 'group' | 'item'>) => [f.group, f.item].map(norm).join('|')
const idOf = (key: string) => `rc-${key.replace(/\|/g, '-').slice(0, 80)}`

/**
 * Reads a table (rows of cells, the first being the header) as segments or
 * fees, by its header. Cells past the last column are part of the last one:
 * the team's file writes a note with an unquoted comma in it. Returns null
 * when the header is neither table's.
 */
export function readTable(cells: string[][]): ReadTable | null {
  if (cells.length === 0) return null
  const header = cells[0]!.map(norm)
  const isSeg = header.includes('segment') && header.includes('size_band')
  const isFee = header.includes('group') && header.includes('item')
  if (!isSeg && !isFee) return null
  const out: ReadTable = { kind: isSeg ? 'segments' : 'fees', segments: [], fees: [], unreadable: [], skipped: [] }
  for (const raw of cells.slice(1)) {
    // Fold any overflow into the last column, so "a, b" in an unquoted note stays one note.
    const row = raw.length > header.length ? [...raw.slice(0, header.length - 1), raw.slice(header.length - 1).join(',')] : raw
    const get = (c: string) => (row[header.indexOf(c)] ?? '').trim()
    const range = (label: string, a: string, b: string): RateRange => {
      const lo = num(get(a)), hi = num(get(b))
      if (lo.unreadable) out.unreadable.push({ label, field: a, raw: get(a) })
      if (hi.unreadable) out.unreadable.push({ label, field: b, raw: get(b) })
      return { min: lo.value, max: hi.value }
    }
    if (isSeg) {
      const base = { section: get('section'), segment: get('segment'), level: get('level'), sizeBand: get('size_band') }
      if (!base.segment) { out.skipped.push(row.join(', ')); continue }
      const label = segmentLabel(base)
      out.segments.push({
        id: idOf(segmentKey(base)), ...base, criteria: get('criteria'),
        setup: range(label, 'setup_min', 'setup_max'), setupNote: get('setup_note'),
        cpr: range(label, 'cpr_min', 'cpr_max'), cprNote: get('cpr_note'),
        incentive: range(label, 'incentive_min', 'incentive_max'), incentiveUnit: get('incentive_unit'), incentiveNote: get('incentive_note'),
      })
    } else {
      const base = { group: get('group'), item: get('item') }
      if (!base.item) { out.skipped.push(row.join(', ')); continue }
      out.fees.push({ id: idOf(feeKey(base)), ...base, amount: range(feeLabel(base), 'amount_min', 'amount_max'), unit: get('unit'), note: get('note') })
    }
  }
  return out
}

/** Reads CSV text as one of the two tables. */
export const readCsv = (text: string): ReadTable | null => readTable(parseCsv(text))

// ------------------------------------------------------------------ writing

const q = (v: string | number | null) => {
  const s = v == null ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** The segments table as CSV, in the team's own columns. */
export function segmentsCsv(card: RateCard): string {
  const lines = card.segments.map((s) => [s.section, s.segment, s.level, s.criteria, s.sizeBand, s.setup.min, s.setup.max, s.setupNote, s.cpr.min, s.cpr.max, s.cprNote, s.incentive.min, s.incentive.max, s.incentiveUnit, s.incentiveNote].map(q).join(','))
  return [SEGMENT_COLUMNS.join(','), ...lines].join('\n') + '\n'
}

/** The fees table as CSV, in the team's own columns. */
export function feesCsv(card: RateCard): string {
  const lines = card.fees.map((f) => [f.group, f.item, f.amount.min, f.amount.max, f.unit, f.note].map(q).join(','))
  return [FEE_COLUMNS.join(','), ...lines].join('\n') + '\n'
}

// ------------------------------------------------------------------ an upload

export interface CellChange { field: string; from: string; to: string }
export interface UploadPreview {
  /** Rows already on the card that the file matched by their labels, with what would change. */
  matched: { label: string; changes: CellChange[] }[]
  /** Rows in the file that are not on the card yet: they would be added. */
  added: string[]
  /** Rows on the card that the file did not mention: they stay as they are. */
  untouched: string[]
  unreadable: ReadTable['unreadable']
  skipped: string[]
  /** The card as it would be once the team confirms. */
  next: RateCard
}

const show = (v: unknown) => (v == null || v === '' ? 'blank' : typeof v === 'object' ? (() => { const r = v as RateRange; return r.min == null && r.max == null ? 'blank' : r.min === r.max ? `${r.min}` : `${r.min ?? 'blank'} up to ${r.max ?? 'blank'}` })() : String(v))
const SEG_FIELDS: [keyof RateSegment, string][] = [['criteria', 'Criteria'], ['setup', 'Setup'], ['setupNote', 'Setup note'], ['cpr', 'Cost per recruit'], ['cprNote', 'Cost per recruit note'], ['incentive', 'Incentive guide'], ['incentiveUnit', 'Incentive unit'], ['incentiveNote', 'Incentive note']]
const FEE_FIELDS: [keyof RateFee, string][] = [['amount', 'Amount'], ['unit', 'Unit'], ['note', 'Note']]

/**
 * What an upload would do to the card: rows matched by their labels (section,
 * segment, level and size band; or group and item), the changes cell by cell,
 * rows that would be added, rows the file did not mention (kept), and cells
 * that could not be read (left blank and listed). Nothing is saved here.
 */
export function previewUpload(card: RateCard, tables: ReadTable[]): UploadPreview {
  const next: RateCard = { segments: card.segments.map((s) => ({ ...s })), fees: card.fees.map((f) => ({ ...f })) }
  const p: UploadPreview = { matched: [], added: [], untouched: [], unreadable: tables.flatMap((t) => t.unreadable), skipped: tables.flatMap((t) => t.skipped), next }
  const seen = new Set<string>()
  for (const t of tables) {
    for (const row of t.segments) {
      const key = segmentKey(row); seen.add(key)
      const i = next.segments.findIndex((s) => segmentKey(s) === key)
      if (i < 0) { next.segments.push(row); p.added.push(segmentLabel(row)); continue }
      const was = next.segments[i]!
      const changes = SEG_FIELDS.filter(([k]) => JSON.stringify(was[k]) !== JSON.stringify(row[k])).map(([k, name]) => ({ field: name, from: show(was[k]), to: show(row[k]) }))
      p.matched.push({ label: segmentLabel(row), changes })
      next.segments[i] = { ...row, id: was.id }
    }
    for (const row of t.fees) {
      const key = feeKey(row); seen.add(key)
      const i = next.fees.findIndex((f) => feeKey(f) === key)
      if (i < 0) { next.fees.push(row); p.added.push(feeLabel(row)); continue }
      const was = next.fees[i]!
      const changes = FEE_FIELDS.filter(([k]) => JSON.stringify(was[k]) !== JSON.stringify(row[k])).map(([k, name]) => ({ field: name, from: show(was[k]), to: show(row[k]) }))
      p.matched.push({ label: feeLabel(row), changes })
      next.fees[i] = { ...row, id: was.id }
    }
  }
  const kinds = new Set(tables.map((t) => t.kind))
  if (kinds.has('segments')) p.untouched.push(...card.segments.filter((s) => !seen.has(segmentKey(s))).map(segmentLabel))
  if (kinds.has('fees')) p.untouched.push(...card.fees.filter((f) => !seen.has(feeKey(f))).map(feeLabel))
  return p
}

// ------------------------------------------------------------------ a quote

/** Whether n participants fall in a size band: "1-25", "25 plus", "any". 25 is in "1-25"; "25 plus" starts after it. */
export function bandFits(band: string, n: number): boolean {
  const b = band.trim().toLowerCase()
  if (b === '' || b === 'any') return true
  const range = /^(\d+)\s*-\s*(\d+)$/.exec(b)
  if (range) return n >= Number(range[1]) && n <= Number(range[2])
  const plus = /^(\d+)\s*(plus|\+)$/.exec(b)
  if (plus) return n > Number(plus[1])
  return false
}

/** Hours of a study for an hourly incentive, from its expected minutes. */
export const hoursOf = (durationMins: number) => Math.max(0, durationMins) / 60
const cents = (n: number) => Math.round(n * 100) / 100

/** The incentive a segment's guide proposes for a study of these hours: the lower rate, per hour. Null when the sheet gives none. */
export function proposedIncentive(seg: RateSegment, hours: number): number | null {
  if (seg.incentive.min == null) return null
  return /hour/i.test(seg.incentiveUnit) ? cents(seg.incentive.min * hours) : seg.incentiveUnit.trim() === '' ? null : cents(seg.incentive.min)
}

export interface Quote {
  segment: RateSegment
  participants: number
  hours: number
  setup: number
  cpr: number
  recruitment: number
  incentive: number
  incentives: number
  addOns: { id: string; label: string; amount: number }[]
  total: number
  /** The cost per interview: the total over the participants, to the cent. */
  cpi: number
  /** The same at the top of every range, for the team's eyes. */
  high: { total: number; cpi: number }
}

/**
 * A quote from the card: setup, plus cost per recruit times participants, plus
 * the incentive (the guide rate times hours) times participants, plus any flat
 * add-ons picked, over the participants. The lower end of each range is
 * quoted; the higher is given beside it. Null when a figure the sum needs is
 * blank on the card.
 */
export function quoteFrom(card: RateCard, segmentId: string, participants: number, hours: number, addOnIds: string[] = []): Quote | null {
  const seg = card.segments.find((s) => s.id === segmentId)
  const n = Math.floor(participants)
  if (!seg || n <= 0 || seg.setup.min == null || seg.cpr.min == null) return null
  const incentive = proposedIncentive(seg, hours)
  if (incentive == null) return null
  const incHigh = seg.incentive.max != null && /hour/i.test(seg.incentiveUnit) ? cents(seg.incentive.max * hours) : incentive
  const addOns = card.fees.filter((f) => addOnIds.includes(f.id) && f.unit === 'flat' && f.amount.min != null).map((f) => ({ id: f.id, label: f.item, amount: f.amount.min! }))
  const addOnTotal = addOns.reduce((t, a) => t + a.amount, 0)
  const total = cents(seg.setup.min + seg.cpr.min * n + incentive * n + addOnTotal)
  const highTotal = cents((seg.setup.max ?? seg.setup.min) + (seg.cpr.max ?? seg.cpr.min) * n + incHigh * n + addOnTotal)
  return {
    segment: seg, participants: n, hours, setup: seg.setup.min, cpr: seg.cpr.min, recruitment: seg.cpr.min * n, incentive, incentives: cents(incentive * n),
    addOns, total, cpi: cents(total / n), high: { total: highTotal, cpi: cents(highTotal / n) },
  }
}

/**
 * The segment a study is quoted from before the team reviews it: the first on
 * the card whose size band fits the participants and which can be quoted
 * (setup, cost per recruit and an incentive guide all on the sheet). The team
 * picks the right one in the console.
 */
export function proposedSegment(card: RateCard, participants: number, hours: number): RateSegment | undefined {
  return card.segments.find((s) => bandFits(s.sizeBand, participants) && quoteFrom(card, s.id, participants, hours) !== null)
}
