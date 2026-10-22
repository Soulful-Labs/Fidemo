import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { ChevronDown, Plus, Trash } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import Modal from '../../components/ui/Modal'
import { blankQuestion, MARKS_FOR, useDraft } from '../../mock/createStore'
import type { Question, QuestionKind } from '../../mock/createStore'
import CreateShell from './CreateShell'
import ScreenerPreview, { PreviewButton, PreviewPanel } from './ScreenerPreview'
import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'
import { buildScreener } from '@shared/questions'
import PromptDialog from './PromptDialog'
import { screenerFromPrompt } from '../../lib/fromPrompt'

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
  <span className="grid h-fit w-3 shrink-0 grid-cols-2 content-start gap-[3px] self-start pt-4 text-text-body" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />)}
  </span>
)

/** The 38px boxes every row of this step is built from. */
function Box({ value, placeholder, onChange, className, muted, large }: {
  value?: string; placeholder?: string; onChange?: (v: string) => void; className?: string; muted?: boolean
  /** The diary form's preview line (1518:94904): 16px in the subtitle grey, 12 in. */
  large?: boolean
}) {
  return (
    <input value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} readOnly={muted}
      className={cn('h-[38px] w-full rounded-sm border-1 border-stroke-input text-text-title',
        large ? 'px-3 text-body-regular placeholder:text-text-subtitle' : 'px-4 text-text-regular placeholder:text-text-body',
        muted ? 'bg-bg-1 italic placeholder:italic' : 'bg-bg', className)} />
  )
}

/**
 * A small select with the frame's own chevron, used for types and marks.
 * It opens its options when the caller gives it some.
 */
export function Pick({ value, tone, className, options, onPick }: {
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
  Incorrect: 'text-red-600', 'May Select': 'text-text-subtitle',
  Qualify: 'text-brand-secondary', Disqualify: 'text-red-600',
}

/** The option rows a select question is answered with. */
function Options({ q, marks, markWidth, onAdd, onRemove, onText, onMark, removable }: {
  q: Question; marks: string[]; markWidth: string; onAdd: () => void; onRemove: (id: string) => void; onText: (id: string, v: string) => void
  /** The mark an option carries, which the question kind decides. */
  onMark: (id: string, mark: string) => void
  removable: boolean
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {q.options.map((o) => (
        <div key={o.id} className="flex items-center gap-2.5 pl-2.5">
          <span className="grid w-3 shrink-0 grid-cols-2 gap-[3px] text-text-body" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />)}
          </span>
          <span className="relative flex flex-1 items-center">
            {/* A multi-select's options are ticked, so they show a checkbox; a single-select's a radio (22 Oct 2026). */}
            <span className={cn('absolute left-4 h-4 w-4 border-1.5 border-neutral-1000', q.kind === 'Multi-select' ? 'rounded-[5px]' : 'rounded-full')} />
            <Box value={o.text} placeholder="Enter option" onChange={(v) => onText(o.id, v)} className="pl-11" />
          </span>
          <Pick value={o.mark} tone={MARK_TONE[o.mark]} className={cn(markWidth, 'px-3')}
            options={marks} onPick={(v) => onMark(o.id, v)} />
          <button type="button" aria-label="Add option" onClick={onAdd} className="text-text-subtitle hover:text-text-title">
            <Plus className="h-5 w-5" />
          </button>
          {removable && (
            <button type="button" aria-label="Delete option" onClick={() => onRemove(o.id)} className="text-text-subtitle hover:text-red-600">
              <Trash className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/** The grid a Mattrix question is answered on: its columns across the top, a row per item. */
function Matrix({ q, write }: { q: Question; write: (next: Question) => void }) {
  const columns = q.columns ?? [], rows = q.rows ?? []
  const column = (i: number, v: string) => write({ ...q, columns: columns.map((c, k) => (k === i ? v : c)) })
  return (
    <div className="flex flex-col gap-2.5 rounded-md bg-bg-1 p-3">
      <div className="flex items-center gap-2.5">
        <span className="w-[72px] shrink-0" />
        {columns.map((c, i) => (
          <Box key={i} value={c} placeholder="Enter column item..." onChange={(v) => column(i, v)} className={i === 0 ? 'w-[72px] bg-bg' : 'flex-1'} />
        ))}
        <button type="button" aria-label="Add column" onClick={() => write({ ...q, columns: [...columns, ''] })}
          className="text-text-subtitle hover:text-text-title"><Plus className="h-5 w-5" /></button>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Box value={r} placeholder="Enter row item..." className="w-[72px]"
            onChange={(v) => write({ ...q, rows: rows.map((x, k) => (k === i ? v : x)) })} />
          {columns.map((_, c) => (
            <span key={c} className="flex h-[38px] flex-1 items-center justify-center rounded-sm bg-bg-2">
              <span className={cn('h-4 w-4 border-1.5 border-neutral-1000', q.matrixKind === 'Multi-select/row' ? 'rounded-[5px]' : 'rounded-full')} />
            </span>
          ))}
          <button type="button" aria-label="Add row" onClick={() => write({ ...q, rows: [...rows, ''] })}
            className="text-text-subtitle hover:text-text-title"><Plus className="h-5 w-5" /></button>
          <button type="button" aria-label="Delete row" onClick={() => write({ ...q, rows: rows.filter((_, k) => k !== i) })}
            className="text-text-subtitle hover:text-text-title"><Trash className="h-5 w-5" /></button>
        </div>
      ))}
    </div>
  )
}

/**
 * Delete, on the question itself: one click on the bin, then a confirmation.
 * It replaces the three-dot menu, whose only item was Delete Question.
 */
function DeleteQuestion({ label, onDelete }: { label: string; onDelete: () => void }) {
  const [asking, setAsking] = useState(false)
  return (
    <span className="relative flex shrink-0">
      <button type="button" aria-label={`Delete ${label}`} title="Delete question" onClick={() => setAsking(true)}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-red-600">
        <Trash className="h-5 w-5" />
      </button>
      <Modal open={asking} onClose={() => setAsking(false)} title="Delete Question?"
        body={<>{label} and everything typed into it will be removed. This cannot be undone.</>}
        footer={
          <>
            <Button variant="tertiary" className="flex-1" onClick={() => setAsking(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => { setAsking(false); onDelete() }}>Delete</Button>
          </>
        } />
    </span>
  )
}

const PREVIEW_LINE: Partial<Record<QuestionKind, string>> = {
  'Single-line input': 'Participants will enter a short text response',
  'Number input': 'Participants will enter a number in text response',
  'Multi-line input': 'Participants will enter a long text response',
  'File Upload': 'Participants will upload a file',
}

/** The options a question keeps when its answer type changes: a select or ranking always has at least two rows to fill. */
function optionsFor(q: Question, kind: QuestionKind, marks: string[]) {
  const kept = q.options.map((o) => ({ ...o, mark: kind === 'Ranking' ? '' : marks.includes(o.mark) ? o.mark : marks[0] ?? o.mark }))
  const needs = kind === 'Single-select' || kind === 'Multi-select' || kind === 'Ranking' ? 2 : 0
  return [...kept, ...Array.from({ length: Math.max(0, needs - kept.length) }, (_, i) => ({ id: `o${Date.now()}${i}`, text: '', mark: kind === 'Ranking' ? '' : marks[i] ?? marks[0] ?? '' }))]
}

/** One question: its label, its answer type, and whatever that type needs. */
export function QuestionBlock({ q, index, write, onDelete, marksFor = MARKS_FOR, markWidth = 'w-[110px]', plain, labelClass, largePreview }: {
  q: Question; index: number; write: (next: Question) => void; onDelete: () => void
  /** The verdicts an option can carry: a screener's by default, a survey's Qualify and Disqualify. */
  marksFor?: (kind: QuestionKind) => string[]; markWidth?: string
  /** The survey and diary composers draw their questions without the rule between them. */
  plain?: boolean
  /** The question's label pill, where a frame draws it differently (the diary's 32px Q1 on bgAlt-2). */
  labelClass?: string
  /** The diary form draws its preview line larger (1518:94904). */
  largePreview?: boolean
}) {
  const addOption = () => write({ ...q, options: [...q.options, { id: `o${Date.now()}${q.options.length}`, text: '', mark: marksFor(q.kind)[0] ?? '' }] })
  const removeOption = (id: string) => write({ ...q, options: q.options.filter((o) => o.id !== id) })
  const optionText = (id: string, v: string) => write({ ...q, options: q.options.map((o) => (o.id === id ? { ...o, text: v } : o)) })

  return (
    <div className={cn('flex gap-4', !plain && 'py-4', !plain && index > 0 && 'border-t-1 border-stroke-1')}>
      {GRIP}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex items-center rounded-full text-text-regular text-text-title', labelClass ?? 'h-[38px] bg-bg-1 px-4')}>{q.label}</span>
          <span className="flex-1" />
          {q.kind === 'Mattrix' && (
            <Pick value={q.matrixKind ?? 'Single-select/row'} className="w-[164px]"
              options={['Single-select/row', 'Multi-select/row']}
              onPick={(v) => write({ ...q, matrixKind: v })} />
          )}
          <Pick value={q.kind} className="w-[164px]"
            options={['Single-select', 'Multi-select', 'Single-line input', 'Number input',
              'Multi-line input', 'Slider', 'Ranking', 'File Upload', 'Mattrix']}
            onPick={(v) => write({ ...q, kind: v as QuestionKind, options: optionsFor(q, v as QuestionKind, marksFor(v as QuestionKind)) })} />
          <DeleteQuestion label={q.label} onDelete={onDelete} />
        </div>

        <Box value={q.text} placeholder="Enter question text..." onChange={(v) => write({ ...q, text: v })} />

        {(q.kind === 'Single-select' || q.kind === 'Multi-select') && (
          <Options q={q} marks={marksFor(q.kind)} markWidth={markWidth} onAdd={addOption} onRemove={removeOption} onText={optionText}
            onMark={(id, mark) => write({ ...q, options: q.options.map((o) => (o.id === id ? { ...o, mark } : o)) })}
            removable={q.kind === 'Multi-select'} />
        )}

        {PREVIEW_LINE[q.kind] && <Box muted large={largePreview} placeholder={PREVIEW_LINE[q.kind]} />}

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
              <Pick value={q.formats || 'Select formats'} tone={q.formats ? undefined : 'text-text-body'} className="w-full"
                options={['PDF', 'PNG or JPG', 'CSV', 'Any file']}
                onPick={(v) => write({ ...q, formats: v })} />
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
   * Generate adds screener questions written from the client's description of
   * the study, Regenerate All replaces the lot. There is no model: the text is
   * read for the roles, industry and subject it names, and any question the
   * client wrote into it (lib/fromPrompt.ts). Every generated question is
   * complete, and none screens anyone out (each is Correct or May Select),
   * because which answer disqualifies is the client's decision. The set is
   * checked the way Publish checks it, and nothing is added if it would not pass.
   */
  const generate = (text: string, all: boolean) => {
    const start = all ? 1 : draft.questions.length + 1
    const made = screenerFromPrompt(text, start)
    if (made.length === 0) { toast('Your description does not say what the study is about or who it is for, so nothing was generated'); return }
    const checked = buildScreener(made)
    if (!checked.ok) { toast(`Nothing was generated: ${checked.why}`); return }
    set('questions', all ? made : [...draft.questions, ...made])
    toast(`${made.length} questions ${all ? 'written' : 'added'} from your description`)
  }
  const toast = useToast()
  const { draft, set } = useDraft()
  const [preview, setPreview] = useState(false)
  const [at, setAt] = useState(0)
  /** Which button opened the description box. */
  const [asking, setAsking] = useState<null | 'add' | 'all'>(null)

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
              {/* The preview (15 Oct 2026) is collapsible and closed until opened here. */}
              {!preview && <PreviewButton onClick={() => setPreview(true)} />}
            </div>
          </div>

          <div className="ml-7 flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 p-[14px]">
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-2 text-body-medium text-text-title">{SPARKLE}Generate with AI</p>
              <p className="text-text-regular text-text-subtitle">Let our AI-assistant generate questions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="row" leftIcon={SPARKLE} onClick={() => setAsking('add')}>Generate</Button>
              <Button variant="tertiary" size="row" leftIcon={SPARKLE} onClick={() => setAsking('all')}>Regenerate All</Button>
              <span className="relative flex flex-1 items-center">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className="absolute left-4 text-text-body">
                  <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                {/* The description Generate works from: the same text the Audience step's Fill with AI took. */}
                <Box value={draft.aiPrompt ?? ''} onChange={(v) => set('aiPrompt', v)} placeholder="Write - Tell AI what to do" className="pl-10" />
              </span>
            </div>
          </div>
          <PromptDialog open={asking !== null} onClose={() => setAsking(null)} onGenerate={(text) => generate(text, asking === 'all')}
            action={asking === 'all' ? 'Replace All Questions' : 'Add Questions'}
            lead="Describe your study: who it is for (their job and industry) and what it is about. Any question you write here, ending in a question mark, is added as it is." />

          <div className="flex flex-col pl-1 pt-[18px]">
            {draft.questions.map((q, i) => (
              <div key={q.id}>
                {/* One screener: the first three are the pre-screener, shown only by their tags (Pre-screener - Q1 to Q3). */}
                <QuestionBlock q={q} index={i}
                  write={(next) => set('questions', draft.questions.map((x) => (x.id === next.id ? next : x)))}
                  onDelete={() => { set('questions', draft.questions.filter((x) => x.id !== q.id)); toast(`${q.label} deleted`) }} />
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

        {preview && (
          <PreviewPanel onClose={() => setPreview(false)} onRefresh={() => setAt(0)}>
            <ScreenerPreview at={at} setAt={setAt} />
          </PreviewPanel>
        )}
      </div>
    </CreateShell>
  )
}
