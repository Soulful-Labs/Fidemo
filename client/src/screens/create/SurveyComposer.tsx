import { useState } from 'react'
import Button from '../../components/ui/Button'
import { ChevronDown, ChevronLeft, MoreVertical, Plus, Upload } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
const GRIP = (
  <span className="grid w-3 shrink-0 grid-cols-2 gap-[3px] text-text-body" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-[3px] w-[3px] rounded-full bg-current" />)}
  </span>
)

interface Opt { id: string; text: string; mark: string }
interface SQ { id: string; label: string; kind: string; text: string; options: Opt[] }

const NEW = (n: number): SQ => ({
  id: `sq${Date.now()}`, label: `SQ ${n}`, kind: 'Single-select', text: '',
  options: [{ id: `a${Date.now()}`, text: '', mark: 'Qualify' }, { id: `b${Date.now()}`, text: '', mark: 'Disqualify' }],
})

function Box({ value, placeholder, onChange, className }: {
  value?: string; placeholder?: string; onChange?: (v: string) => void; className?: string
}) {
  return (
    <input value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
      className={cn('h-[38px] w-full rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title placeholder:text-text-body', className)} />
  )
}

function Pick({ value, tone, className, onClick }: { value: string; tone?: string; className?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex h-[38px] shrink-0 items-center justify-between gap-2 rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular',
      tone ?? 'text-text-title', className)}>
      <span className="truncate">{value}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-text-subtitle" />
    </button>
  )
}

/**
 * Create Survey (1518:92064): the questionnaire composer that opens beside
 * the study settings. Its option marks are Qualify and Disqualify, not the
 * screener's Correct and Incorrect.
 */
export default function SurveyComposer({
  onSubmit, onBack, title = 'Create Survey', submit = 'Submit Survey',
  lead = 'Setup your survey inputs form here for users.', dayGroup, kind = 'Single-select', seed = 1,
}: {
  onSubmit: () => void; onBack: () => void
  title?: string; submit?: string; lead?: string; dayGroup?: string; kind?: string; seed?: number
}) {
  const toast = useToast()
  const [questions, setQuestions] = useState<SQ[]>(
    Array.from({ length: seed }, (_, i) => ({ ...NEW(i + 1), label: dayGroup ? `Q${i + 1}` : `SQ ${i + 1}`, kind })),
  )
  /** Adds survey questions rather than toasting; no model is wired here. */
  const generate = () => {
    const bank = [
      'What did you set out to do when you opened the app?',
      'Where did that take longer than you expected?',
      'What would you change first?',
    ]
    setQuestions((qs) => [
      ...qs,
      ...bank.map((text, i) => ({
        ...NEW(qs.length + i + 1),
        label: dayGroup ? `Q${qs.length + i + 1}` : `SQ ${qs.length + i + 1}`,
        kind,
        text,
      })),
    ])
    toast('Questions generated')
  }
  const write = (next: SQ) => setQuestions((qs) => qs.map((q) => (q.id === next.id ? next : q)))

  return (
    <div className="flex w-[628px] shrink-0 flex-col overflow-hidden rounded-lg border-1 border-stroke-input">
      <div className="flex items-center gap-3 border-b-1 border-stroke-input bg-yellow-30 px-4 py-3">
        <button type="button" aria-label="Back" onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-title-s text-text-title">{title}</span>
        <span className="flex-1" />
        <span className="text-text-regular text-text-subtitle">Auto-saved</span>
        <Button size="row" onClick={onSubmit}>{submit}</Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-text-regular text-text-title">{lead}</p>

        <div className="flex flex-col gap-3 rounded-md bg-bg-1 p-3">
          <p className="text-text-regular text-text-body">
            Enter survey context/questions or upload file to let our AI-assitant generate questions
          </p>
          <div className="flex items-center justify-between gap-3">
            <Button variant="tertiary" size="row" leftIcon={<Upload className="h-4 w-4" />} onClick={() => toast('File uploaded')}>Upload File</Button>
            <Button size="row" leftIcon={SPARKLE} onClick={generate}>Generate</Button>
          </div>
        </div>

        <div className={cn('flex flex-col gap-4', dayGroup && 'rounded-md bg-bg-1 p-3')}>
        {dayGroup && (
          <p className="rounded-sm bg-bg-2 py-2 text-center text-text-regular text-text-title">{dayGroup}</p>
        )}
        {questions.map((q) => (
          <div key={q.id} className="flex gap-4">
            {GRIP}
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-[38px] items-center rounded-full bg-bg-1 px-4 text-text-regular text-text-title">{q.label}</span>
                <span className="flex-1" />
                <Pick value={q.kind} className="w-[164px]" />
                <button type="button" aria-label="Question options" onClick={() => toast('Duplicate, move and delete land with the question menu')}
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <Box value={q.text} placeholder="Enter question text..." onChange={(v) => write({ ...q, text: v })} />
              {q.kind === 'Multi-line input' && (
                <input readOnly placeholder="Participants will enter a long text response"
                  className="h-[38px] w-full rounded-sm border-1 border-stroke-input bg-bg-1 px-4 text-text-regular italic text-text-title placeholder:italic placeholder:text-text-body" />
              )}
              <div className={cn('flex flex-col gap-2.5', q.kind !== 'Single-select' && 'hidden')}>
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2.5 pl-2.5">
                    {GRIP}
                    <span className="relative flex flex-1 items-center">
                      <span className="absolute left-4 h-4 w-4 rounded-full border-1.5 border-neutral-1000" />
                      <Box value={o.text} placeholder="Enter option" className="pl-11"
                        onChange={(v) => write({ ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, text: v } : x)) })} />
                    </span>
                    <Pick value={o.mark} tone={o.mark === 'Qualify' ? 'text-brand-secondary' : 'text-state-danger'} className="w-[118px]" />
                    <button type="button" aria-label="Add option" className="text-text-subtitle"
                      onClick={() => write({ ...q, options: [...q.options, { id: `o${Date.now()}`, text: '', mark: 'Qualify' }] })}>
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>

        <Button variant="tertiary" size="row" className="w-full" leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => setQuestions((qs) => [...qs, { ...NEW(qs.length + 1), label: dayGroup ? `Q${qs.length + 1}` : `SQ ${qs.length + 1}`, kind }])}>Add Question</Button>
      </div>
    </div>
  )
}
