import { useEffect, useState } from 'react'
import { buildTasks } from '@shared/questions'
import { TASK_MARKS } from '@shared/studyForm'
import Button from '../../components/ui/Button'
import { ChevronLeft, Plus, Upload } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { blankQuestion, useDraft } from '../../mock/createStore'
import type { Question, QuestionKind } from '../../mock/createStore'
import { QuestionBlock } from './Screener'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

/** A survey's or diary's options qualify or disqualify; nothing else about a question differs from the screener's. */
const marksFor = (kind: QuestionKind) => (kind === 'Single-select' || kind === 'Multi-select' ? TASK_MARKS : [])

/**
 * Create Survey (1518:92064): the questionnaire composer that opens beside
 * the study settings. Its option marks are Qualify and Disqualify, not the
 * screener's Correct and Incorrect. What is built here is the study's own
 * form (`tasks` on the draft), and Submit refuses a form that cannot be asked.
 */
export default function SurveyComposer({
  onSubmit, onBack, title = 'Create Survey', submit = 'Submit Survey',
  lead = 'Setup your survey inputs form here for users.', dayGroup, kind = 'Single-select', seed = 1,
}: {
  onSubmit: () => void; onBack: () => void
  title?: string; submit?: string; lead?: string; dayGroup?: string; kind?: QuestionKind; seed?: number
}) {
  const toast = useToast()
  const { draft, set } = useDraft()
  const [file, setFile] = useState<string | null>(null)
  const questions = draft.tasks
  const label = (n: number) => (dayGroup ? `Q${n}` : `SQ ${n}`)
  const fresh = (n: number, k: QuestionKind = kind): Question => blankQuestion(label(n), k, marksFor(k))
  const write = (next: Question[]) => set('tasks', next.map((q, i) => ({ ...q, label: label(i + 1) })))

  /** The frame opens the composer with its first questions already there, empty. */
  useEffect(() => {
    if (draft.tasks.length === 0) set('tasks', Array.from({ length: seed }, (_, i) => fresh(i + 1)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Adds open questions rather than toasting; no model is wired here. */
  const generate = () => {
    const bank = [
      'What did you set out to do when you opened the app?',
      'Where did that take longer than you expected?',
      'What would you change first?',
    ]
    write([...questions, ...bank.map((text, i) => ({ ...fresh(questions.length + i + 1, 'Multi-line input'), text }))])
    toast('Questions generated')
  }

  const send = () => {
    const built = buildTasks(questions)
    if (!built.ok) { toast(built.why); return }
    if (built.tasks.length === 0) { toast('Write at least one question before submitting'); return }
    onSubmit()
  }

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
        <Button size="row" onClick={send}>{submit}</Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-text-regular text-text-title">{lead}</p>

        <div className="flex flex-col gap-3 rounded-md bg-bg-1 p-3">
          <p className="text-text-regular text-text-body">
            Enter survey context/questions or upload file to let our AI-assitant generate questions
          </p>
          <div className="flex items-center justify-between gap-3">
            <Button variant="tertiary" size="row" leftIcon={<Upload className="h-4 w-4" />} onClick={() => { setFile('questions.csv'); toast('questions.csv attached') }}>{file ?? 'Upload File'}</Button>
            <Button size="row" leftIcon={SPARKLE} onClick={generate}>Generate</Button>
          </div>
        </div>

        <div className={cn('flex flex-col gap-4', dayGroup && 'rounded-md bg-bg-1 p-3')}>
          {dayGroup && (
            <p className="rounded-sm bg-bg-2 py-2 text-center text-text-regular text-text-title">{dayGroup}</p>
          )}
          {questions.map((q, i) => (
            <QuestionBlock key={q.id} q={q} index={i} plain marksFor={marksFor} markWidth="w-[118px]"
              write={(next) => write(questions.map((x) => (x.id === next.id ? next : x)))}
              onDelete={() => { write(questions.filter((x) => x.id !== q.id)); toast(`${q.label} deleted`) }} />
          ))}
        </div>

        <Button variant="tertiary" size="row" className="w-full" leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => write([...questions, fresh(questions.length + 1)])}>Add Question</Button>
      </div>
    </div>
  )
}
