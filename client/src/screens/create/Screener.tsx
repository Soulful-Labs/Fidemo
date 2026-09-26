import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { ChevronDown, MoreVertical, Plus, Trash } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { blankQuestion, MARKS_FOR, useDraft } from '../../mock/createStore'
import type { Question, QuestionKind } from '../../mock/createStore'
import CreateShell from './CreateShell'
import ScreenerPreview from './ScreenerPreview'
import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
const LIST = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M9 6h11M9 12h11M9 18h7M4 6h1M4 12h1M4 18h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const GRIP = (
  <span className="grid w-3 shrink-0 grid-cols-2 gap-[3px] pt-3 text-text-body" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />)}
  </span>
)

/** Workflow step 28: "The three questions that decide eligibility are asked first." */
export const PRESCREENER_QUESTIONS = 3

/**
 * The band that separates the two stages. No Figma frame draws it — the
 * Screener step is one flat list of questions — so it is built from the
 * step's own divider and label rules and flagged for the designer.
 */
function StageBand({ label, help }: { label: string; help: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t-1 border-stroke-2 pb-3 pl-7 pt-4 first:border-t-0 first:pt-0">
      <p className="text-text-large uppercase tracking-[0.04em] text-text-subtitle">{label}</p>
      <p className="text-text-regular text-text-subtitle">{help}</p>
    </div>
  )
}

/** The 38px boxes every row of this step is built from. */
function Box({ value, placeholder, onChange, className, muted }: {
  value?: string; placeholder?: string; onChange?: (v: string) => void; className?: string; muted?: boolean
}) {
  return (
    <input value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} readOnly={muted}
      className={cn('h-[38px] w-full rounded-sm border-1 border-stroke-input px-4 text-text-regular text-text-title placeholder:text-text-body',
        muted ? 'bg-bg-1 italic placeholder:italic' : 'bg-bg', className)} />
  )
}

/**
 * A small select with the frame's own chevron, used for types and marks.
 * It opens its options when the caller gives it some.
 */
function Pick({ value, tone, className, options, onPick }: {
  value: string; tone?: string; className?: string; options?: string[]; onPick?: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative flex shrink-0">
    <button type="button" onClick={() => options && setOpen((o) => !o)}
      className={cn('flex h-[38px] shrink-0 items-center justify-between gap-2 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular',
      tone ?? 'text-text-title', className)}>
      <span className="truncate">{value}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-text-subtitle" />
    </button>
    {open && options && (
      <span className="absolute left-0 top-full z-30 mt-1 flex min-w-full max-h-56 flex-col overflow-y-auto rounded-sm border-1 border-stroke-input bg-bg-0 py-1 shadow-lg">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => { onPick?.(o); setOpen(false) }}
            className="whitespace-nowrap px-3 py-2 text-left text-text-regular text-text-title hover:bg-bg-1">{o}</button>
        ))}
      </span>
    )}
    </span>
  )
}

const MARK_TONE: Record<string, string> = {
  Correct: 'text-brand-secondary', 'Must Select': 'text-brand-secondary',
  Incorrect: 'text-state-danger', 'May Select': 'text-text-subtitle',
}

/** The option rows a select question is answered with. */
function Options({ q, onAdd, onRemove, onText, removable }: {
  q: Question; onAdd: () => void; onRemove: (id: string) => void; onText: (id: string, v: string) => void; removable: boolean
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {q.options.map((o) => (
        <div key={o.id} className="flex items-center gap-2.5 pl-2.5">
          <span className="grid w-3 shrink-0 grid-cols-2 gap-[3px] text-text-body" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />)}
          </span>
          <span className="relative flex flex-1 items-center">
            <span className="absolute left-4 h-4 w-4 rounded-full border-1.5 border-neutral-1000" />
            <Box value={o.text} placeholder="Enter option" onChange={(v) => onText(o.id, v)} className="pl-11" />
          </span>
          <Pick value={o.mark} tone={MARK_TONE[o.mark]} className="w-[110px] px-3" />
          <button type="button" aria-label="Add option" onClick={onAdd} className="text-text-subtitle hover:text-text-title">
            <Plus className="h-5 w-5" />
          </button>
          {removable && (
            <button type="button" aria-label="Delete option" onClick={() => onRemove(o.id)} className="text-text-subtitle hover:text-state-danger">
              <Trash className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/** The grid a Mattrix question is answered on. */
function Matrix({ q, write }: { q: Question; write: (next: Question) => void }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-md bg-bg-1 p-3">
      <div className="flex items-center gap-2.5">
        <span className="w-[72px] shrink-0" />
        <Box value="1" className="w-[72px] bg-bg" />
        <Box placeholder="Enter column item..." className="flex-1" />
        <button type="button" aria-label="Add column" onClick={() => write({ ...q, columns: [...(q.columns ?? []), ''] })}
          className="text-text-subtitle hover:text-text-title"><Plus className="h-5 w-5" /></button>
      </div>
      {(q.rows ?? []).map((r, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Box value={r || undefined} placeholder="Enter row item..." className="w-[72px]" />
          {[0, 1].map((c) => (
            <span key={c} className="flex h-[38px] flex-1 items-center justify-center rounded-sm bg-bg-2">
              <span className="h-4 w-4 rounded-full border-1.5 border-neutral-1000" />
            </span>
          ))}
          <button type="button" aria-label="Add row" onClick={() => write({ ...q, rows: [...(q.rows ?? []), ''] })}
            className="text-text-subtitle hover:text-text-title"><Plus className="h-5 w-5" /></button>
          <button type="button" aria-label="Delete row" onClick={() => write({ ...q, rows: (q.rows ?? []).filter((_, k) => k !== i) })}
            className="text-text-subtitle hover:text-text-title"><Trash className="h-5 w-5" /></button>
        </div>
      ))}
    </div>
  )
}

const PREVIEW_LINE: Partial<Record<QuestionKind, string>> = {
  'Single-line input': 'Participants will enter a short text response',
  'Number input': 'Participants will enter a number in text response',
  'Multi-line input': 'Participants will enter a long text response',
  'File Upload': 'Participants will upload a file',
}

/** One question: its label, its answer type, and whatever that type needs. */
function QuestionBlock({ q, index }: { q: Question; index: number }) {
  const { draft, set } = useDraft()
  const write = (next: Question) => set('questions', draft.questions.map((x) => (x.id === q.id ? next : x)))
  const addOption = () => write({ ...q, options: [...q.options, { id: `o${Date.now()}`, text: '', mark: MARKS_FOR(q.kind)[0] ?? '' }] })
  const removeOption = (id: string) => write({ ...q, options: q.options.filter((o) => o.id !== id) })
  const optionText = (id: string, v: string) => write({ ...q, options: q.options.map((o) => (o.id === id ? { ...o, text: v } : o)) })
  const remove = () => set('questions', draft.questions.filter((x) => x.id !== q.id))

  return (
    <div className={cn('flex gap-4 py-4', index > 0 && 'border-t-1 border-stroke-1')}>
      {GRIP}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[38px] items-center rounded-full bg-bg-1 px-4 text-text-regular text-text-title">{q.label}</span>
          <span className="flex-1" />
          {q.kind === 'Mattrix' && <Pick value={q.matrixKind ?? 'Single-select/row'} className="w-[164px]" />}
          <Pick value={q.kind} className="w-[164px]" />
          <button type="button" aria-label="Question options" onClick={remove}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <Box value={q.text} placeholder="Enter question text..." onChange={(v) => write({ ...q, text: v })} />

        {(q.kind === 'Single-select' || q.kind === 'Multi-select') && (
          <Options q={q} onAdd={addOption} onRemove={removeOption} onText={optionText} removable={q.kind === 'Multi-select'} />
        )}

        {PREVIEW_LINE[q.kind] && <Box muted placeholder={PREVIEW_LINE[q.kind]} />}

        {q.kind === 'Slider' && (
          <div className="flex items-end gap-3">
            {([['Min Value', 'min'], ['Max Value', 'max'], ['Gap', 'gap']] as const).map(([label, key]) => (
              <label key={key} className="flex flex-1 flex-col gap-1">
                <span className="text-text-regular text-text-subtitle">{label}</span>
                <Box value={q[key]} placeholder="0" onChange={(v) => write({ ...q, [key]: v })} />
              </label>
            ))}
            <span className="flex h-[38px] shrink-0 items-center gap-2">
              <Toggle checked={q.showGap ?? true} onChange={(v) => write({ ...q, showGap: v })} label="Show Gap" />
              <span className="text-text-regular text-text-title">Show Gap</span>
            </span>
          </div>
        )}

        {q.kind === 'Ranking' && (
          <div className="flex flex-col gap-2.5">
            {q.options.map((o, i) => (
              <div key={o.id} className="flex items-center gap-2.5 pl-2.5">
                <span className="grid w-3 shrink-0 grid-cols-2 gap-[3px] text-text-body" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, k) => <span key={k} className="h-[3px] w-[3px] rounded-full bg-current" />)}
                </span>
                <span className="relative flex flex-1 items-center">
                  <span className="absolute left-4 text-text-regular text-text-title">{i + 1}</span>
                  <Box value={o.text} placeholder="Enter email address" onChange={(v) => optionText(o.id, v)} className="pl-10" />
                </span>
                <button type="button" aria-label="Add item" onClick={addOption} className="text-text-subtitle hover:text-text-title">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {q.kind === 'File Upload' && (
          <div className="flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-text-regular text-text-subtitle">File formats</span>
              <Pick value={q.formats || 'Select formats'} tone={q.formats ? undefined : 'text-text-body'} className="w-full" />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-text-regular text-text-subtitle">Max number of files</span>
              <Box value={q.maxFiles} onChange={(v) => write({ ...q, maxFiles: v })} />
            </label>
          </div>
        )}

        {q.kind === 'Mattrix' && <Matrix q={q} write={write} />}
      </div>
    </div>
  )
}

/**
 * 2.1.2 Screener, New Study (1622:81771): the screening questions, one block
 * per answer type, beside the participant preview.
 */
export default function Screener() {
  /**
   * Generate adds screener questions, Regenerate All replaces the lot. No
   * model here, so they come from a short bank rather than a toast.
   */
  const BANK = [
    'Which of these best describes your current role?',
    'How many years have you worked in this field?',
    'How often do you use a product like this?',
    'Which of these have you used in the last six months?',
    'What is the size of the team you work in?',
  ]
  const generate = (all: boolean) => {
    const start = all ? 0 : draft.questions.length
    const made = BANK.slice(0, all ? BANK.length : 2).map((text, i) => ({
      ...blankQuestion(`Q${start + i + 1}`),
      text,
    }))
    set('questions', all ? made : [...draft.questions, ...made])
    toast(all ? 'All questions regenerated' : 'Questions generated')
  }
  const toast = useToast()
  const { draft, set } = useDraft()

  return (
    <CreateShell step="screener">
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col">
          <div className="flex items-start gap-2 pb-4">
            <span className="w-5 shrink-0 text-brand-secondary">{LIST}</span>
            <div className="flex flex-1 items-start justify-between gap-4">
              <div className="flex max-w-[440px] flex-col">
                <h2 className="text-title-s text-text-title">Screening questions</h2>
                <p className="text-text-regular text-text-subtitle">
                  Use these questions to filter participants and identify who qualifies for this study. Click Preview to see how it will appear to participants.
                </p>
              </div>
              <Button variant="tertiary" size="row" leftIcon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m10 8.5 6 3.5-6 3.5v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>} onClick={() => {
                  /* The preview is always beside the questions on this step,
                     so Preview brings it into view rather than opening it. */
                  document.getElementById('screener-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  toast('Preview is beside your questions')
                }}>Preview</Button>
            </div>
          </div>

          <div className="ml-7 flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 p-[14px]">
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-2 text-body-medium text-text-title">{SPARKLE}Generate with AI</p>
              <p className="text-text-regular text-text-subtitle">Let our AI-assitant generate questions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="row" leftIcon={SPARKLE} onClick={() => generate(false)}>Generate</Button>
              <Button variant="tertiary" size="row" leftIcon={SPARKLE} onClick={() => generate(true)}>Regenerate All</Button>
              <span className="relative flex flex-1 items-center">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="absolute left-4 text-text-body">
                  <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <Box placeholder="Write - Tell AI what to do" className="pl-10" />
              </span>
            </div>
          </div>

          <div className="flex flex-col pl-1 pt-[18px]">
            {draft.questions.map((q, i) => (
              <div key={q.id}>
                {/* Workflow step 28, which no frame draws: the three questions
                    that decide eligibility are asked first, and only those who
                    pass see the full screener. */}
                {i === 0 && <StageBand label="Eligibility pre-screener" help="The three questions that decide who may continue. Answers are pre-set, so nothing is reviewed by hand." />}
                {i === PRESCREENER_QUESTIONS && <StageBand label="Full screener" help="Only participants who pass the pre-screener are asked these. A borderline answer is held for review rather than rejected." />}
                <QuestionBlock q={q} index={i} />
              </div>
            ))}
          </div>

          <div className="pl-7">
            <Button variant="secondary" size="row" className="w-full" leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => set('questions', [...draft.questions, blankQuestion(`Q${draft.questions.length + 1}`)])}>
              Add Question
            </Button>
          </div>
        </div>

        <ScreenerPreview />
      </div>
    </CreateShell>
  )
}
