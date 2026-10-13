import type { PreScreenQuestion, Question } from './types'

/**
 * The questions a client writes in the Create flow, and how a study carries
 * them. One place, so the client app, the console and the respondent app are
 * all reading the same questions in the same order.
 *
 * The client's builder (client Figma 1622:81771) offers nine answer types.
 * The respondent app draws five (PRD 6.8). Each built question is stored as
 * the respondent kind it is asked in, and keeps the type the client chose in
 * `authored`, so the client app and the console name it as the client did.
 */
export const AUTHORED_KINDS = [
  'Single-select', 'Multi-select', 'Single-line input', 'Number input', 'Multi-line input', 'Slider', 'Ranking', 'File Upload', 'Mattrix',
] as const
export type AuthoredKind = (typeof AUTHORED_KINDS)[number]

/** A question as the client's builder holds it. Only what the type needs is read. */
export interface AuthoredQuestion {
  kind: AuthoredKind
  text: string
  /** Select and ranking options. `mark` is the builder's verdict: Correct, Incorrect, May Select or Must Select. */
  options?: { text: string; mark?: string }[]
  /** Slider. */
  min?: string; max?: string; gap?: string
  /** Mattrix: one row is asked as its own question over the columns. */
  rows?: string[]; columns?: string[]
}

type Refusal = { ok: false; why: string }
type Built = { ok: true; preScreener: PreScreenQuestion[]; screener: Question[] }

/** Workflow 28: "The three questions that decide eligibility are asked first." */
export const PRESCREENER_MAX = 3
/** A slider is asked as a scale while it has few enough steps to tap; past that it is a number. */
const SCALE_MAX_STEPS = 11

const clean = (s?: string) => (s ?? '').trim()
const filled = (q: AuthoredQuestion) => clean(q.text).length > 0
const optionsOf = (q: AuthoredQuestion) => (q.options ?? []).map((o) => ({ text: clean(o.text), mark: clean(o.mark) })).filter((o) => o.text)
const marksOf = (opts: { text: string; mark: string }[]) => {
  const m = Object.fromEntries(opts.filter((o) => o.mark).map((o) => [o.text, o.mark]))
  return Object.keys(m).length ? m : undefined
}

/** The steps a slider offers, or nothing when it has no usable range. */
function sliderSteps(q: AuthoredQuestion): string[] | undefined {
  const min = Number(clean(q.min)), max = Number(clean(q.max)), gap = Number(clean(q.gap)) || 1
  if (!clean(q.min) || !clean(q.max) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min || gap <= 0) return undefined
  const n = Math.floor((max - min) / gap) + 1
  if (n < 2 || n > SCALE_MAX_STEPS) return undefined
  return Array.from({ length: n }, (_, i) => String(Math.round((min + i * gap) * 1000) / 1000))
}

/**
 * One built question as the questions a respondent is asked. Every type is
 * one question except Mattrix, which is one per row.
 */
function asked(q: AuthoredQuestion, id: string): Question[] | string {
  const prompt = clean(q.text)
  const opts = optionsOf(q)
  const base = { id, prompt, authored: q.kind }
  switch (q.kind) {
    case 'Single-select':
    case 'Multi-select':
      if (opts.length < 2) return 'needs at least two options'
      if (new Set(opts.map((o) => o.text)).size !== opts.length) return 'has the same option twice'
      return [{ ...base, kind: q.kind === 'Single-select' ? 'single' : 'multi', options: opts.map((o) => o.text), marks: marksOf(opts) }]
    case 'Ranking':
      if (opts.length < 2) return 'needs at least two items to rank'
      return [{ ...base, kind: 'multi', options: opts.map((o) => o.text), helper: 'Tap them in order, your first choice first.' }]
    case 'Single-line input': return [{ ...base, kind: 'text', placeholder: 'Type a short answer' }]
    case 'Multi-line input': return [{ ...base, kind: 'text' }]
    case 'Number input': return [{ ...base, kind: 'text', format: 'number', placeholder: 'Enter a number' }]
    case 'Slider': {
      const steps = sliderSteps(q)
      return steps ? [{ ...base, kind: 'scale', options: steps }] : [{ ...base, kind: 'text', format: 'number', placeholder: 'Enter a number' }]
    }
    case 'File Upload': return [{ ...base, kind: 'image' }]
    case 'Mattrix': {
      const rows = (q.rows ?? []).map(clean).filter(Boolean), cols = (q.columns ?? []).map(clean).filter(Boolean)
      if (rows.length < 1 || cols.length < 2) return 'needs at least one row and two columns'
      return rows.map((row, i) => ({ id: `${id}-${i + 1}`, prompt: `${prompt}: ${row}`, authored: q.kind, kind: 'single' as const, options: cols }))
    }
  }
}

/** A question that can decide eligibility on its own: one answer, with a right one and a wrong one. */
const decides = (q: AuthoredQuestion) => {
  const opts = optionsOf(q)
  return q.kind === 'Single-select' && opts.some((o) => o.mark === 'Correct') && opts.some((o) => o.mark !== 'Correct')
}

/**
 * The screener a study is submitted with, from what the client built.
 *
 * Blank questions (the builder opens with nine empty ones) and blank options
 * are left out. The questions keep the client's order. The leading
 * single-select questions that mark a Correct answer, up to three, are the
 * eligibility pre-screener (workflow 28); everything after them is the full
 * screener. A question that cannot be asked is refused with the reason,
 * numbered as the client sees it.
 */
export function buildScreener(authored: AuthoredQuestion[]): Built | Refusal {
  const kept = authored.filter(filled)
  if (kept.length === 0) return { ok: false, why: 'Add at least one screener question before publishing' }
  const preScreener: PreScreenQuestion[] = []
  const screener: Question[] = []
  let leading = true
  for (const [i, q] of kept.entries()) {
    const id = `q${i + 1}`
    if (leading && preScreener.length < PRESCREENER_MAX && decides(q)) {
      const opts = optionsOf(q)
      if (new Set(opts.map((o) => o.text)).size !== opts.length) return { ok: false, why: `Screener question ${i + 1} has the same option twice` }
      preScreener.push({ id, prompt: clean(q.text), options: opts.map((o) => o.text), passing: opts.filter((o) => o.mark === 'Correct').map((o) => o.text) })
      continue
    }
    leading = false
    const made = asked(q, id)
    if (typeof made === 'string') return { ok: false, why: `Screener question ${i + 1} ${made}` }
    screener.push(...made)
  }
  return { ok: true, preScreener, screener }
}

/** A survey's or a diary's own questions, from the client's form builder. Same rules, no pre-screener. */
export function buildTasks(authored: AuthoredQuestion[]): { ok: true; tasks: Question[] } | Refusal {
  const tasks: Question[] = []
  for (const [i, q] of authored.filter(filled).entries()) {
    const made = asked(q, `t${i + 1}`)
    if (typeof made === 'string') return { ok: false, why: `Study question ${i + 1} ${made}` }
    tasks.push(...made)
  }
  return { ok: true, tasks }
}

/** A study's whole screener in the order it is asked, each named as the client built it. For the client app and the console. */
export function screenerOutline(study: { preScreener: PreScreenQuestion[]; screener: Question[] }): { id: string; prompt: string; type: string; options?: string[]; eligibility: boolean }[] {
  const TYPE: Record<Question['kind'], string> = { single: 'Single-select', multi: 'Multi-select', text: 'Multi-line input', image: 'File Upload', scale: 'Slider' }
  return [
    ...study.preScreener.map((q) => ({ id: q.id, prompt: q.prompt, type: 'Single-select', options: q.options, eligibility: true })),
    ...study.screener.map((q) => ({ id: q.id, prompt: q.prompt, type: q.authored ?? TYPE[q.kind], options: 'options' in q ? q.options : undefined, eligibility: false })),
  ]
}
