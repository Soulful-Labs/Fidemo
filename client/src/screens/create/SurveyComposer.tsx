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
import PromptDialog from './PromptDialog'
import { surveyFromPrompt } from '../../lib/fromPrompt'

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
  /**
   * Upload File reads a text or CSV file on this device: each line (a CSV
   * row's first cell) becomes an open question. Nothing is sent anywhere, and
   * a file with no readable line adds nothing.
   */
  const upload = async (f: File | undefined) => {
    if (!f) return
    const lines = (await f.text()).split(/\r?\n/).map((l) => (/^"((?:[^"]|"")*)"/.exec(l)?.[1]?.replace(/""/g, '"') ?? l.split(',')[0] ?? '').trim()).filter(Boolean).slice(0, 50)
    if (lines.length === 0) { toast(`${f.name} has no questions to read`); return }
    const kept = questions.filter((q) => q.text.trim())
    write([...kept, ...lines.map((text, i) => ({ ...fresh(kept.length + i + 1, 'Multi-line input'), text }))])
    setFile(f.name)
    toast(`${lines.length} question${lines.length === 1 ? '' : 's'} read from ${f.name}`)
  }

  /**
   * The frame opens the composer with its first questions already there,
   * empty. The survey (Create Survey_Study, 15 Oct 2026) draws five, one per
   * answer type: Single-select, Number input, Multi-line input, Slider,
   * Ranking. Empty questions are left out when the form is submitted.
   */
  useEffect(() => {
    const kinds: QuestionKind[] = dayGroup ? Array.from({ length: seed }, () => kind) : ['Single-select', 'Number input', 'Multi-line input', 'Slider', 'Ranking']
    if (draft.tasks.length === 0) set('tasks', kinds.map((k, i) => fresh(i + 1, k)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Generate writes questions from the client's description of the study.
   * There is no model: the text is read for its subject and for any question
   * the client wrote into it (lib/fromPrompt.ts). Empty questions are
   * replaced; anything already written is kept.
   */
  const [asking, setAsking] = useState(false)
  const generate = (text: string) => {
    const kept = questions.filter((q) => q.text.trim())
    const made = surveyFromPrompt(text, label, kept.length + 1, marksFor)
    if (made.length === 0) { toast('Your description does not say what the study is about, so nothing was written'); return }
    write([...kept, ...made])
    toast(`${made.length} questions written from your description`)
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
        {/* The form is submitted from the top bar's Save & Continue (15 Oct 2026); this is what that button presses. */}
        <button type="button" data-submit-form aria-label={submit} hidden onClick={send} />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-text-regular text-text-title">{lead}</p>

        {/* The context box (15 Oct 2026): what is typed here is the description Generate writes from. Empty, Generate asks for one. */}
        <div className="flex flex-col gap-3 rounded-md border-1 border-stroke-2 bg-bgAlt-1 p-3">
          <textarea value={draft.aiPrompt ?? ''} onChange={(e) => set('aiPrompt', e.target.value)} rows={2} aria-label="Survey context"
            placeholder="Enter survey context/questions or upload file to let our AI-assitant generate questions"
            className="w-full resize-none bg-transparent text-text-regular text-text-title outline-none placeholder:text-text-body" />
          <div className="flex items-center justify-between gap-3">
            <input id="questions-file" type="file" accept=".txt,.csv,text/plain,text/csv" className="sr-only"
              onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} />
            <Button variant="tertiary" size="row" leftIcon={<Upload className="h-4 w-4" />} onClick={() => document.getElementById('questions-file')?.click()}>{file ?? 'Upload File'}</Button>
            <Button variant="secondary" size="row" leftIcon={SPARKLE} onClick={() => (draft.aiPrompt?.trim() ? generate(draft.aiPrompt.trim()) : setAsking(true))}>Generate</Button>
          </div>
        </div>
        <PromptDialog open={asking} onClose={() => setAsking(false)} onGenerate={generate} action="Write Questions"
          lead={`Describe your ${dayGroup ? 'diary study' : 'survey'}: what it is about and what you want to learn. Any question you write here, ending in a question mark, is added as it is.`} />

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
