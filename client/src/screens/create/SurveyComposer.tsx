import { useEffect, useState } from 'react'
import { buildTasks } from '@shared/questions'
import { TASK_MARKS, diaryDayFault } from '@shared/studyForm'
import { diaryWords } from '@shared/platform'
import Button from '../../components/ui/Button'
import { ChevronLeft, Plus } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { blankQuestion, useDraft } from '../../mock/createStore'
import type { Question, QuestionKind } from '../../mock/createStore'
import { QuestionBlock } from './Screener'
import ComposerContext from './ComposerContext'
import { DiarySetupCard } from './DiarySetup'
import { DiaryDays, fitDays, relabelDays, startDays } from './DiaryDays'
import { questionLines, surveyFromPrompt } from '../../lib/fromPrompt'

/** A survey's or diary's options qualify or disqualify; nothing else about a question differs from the screener's. */
const marksFor = (kind: QuestionKind) => (kind === 'Single-select' || kind === 'Multi-select' ? TASK_MARKS : [])

/**
 * Create Survey (1518:92064): the questionnaire composer that opens beside
 * the study settings. Its option marks are Qualify and Disqualify, not the
 * screener's Correct and Incorrect. What is built here is the study's own
 * form (`tasks` on the draft), and Submit refuses a form that cannot be asked.
 * A diary (1518:94904, 21 Oct 2026) adds its schedule at the top and one card
 * per entry, each with its own questions (`day` on each question).
 */
export default function SurveyComposer({
  onSubmit, onBack, title = 'Create Survey', submit = 'Submit Survey',
  lead = 'Setup your survey inputs form here for users.', diary, kind = 'Single-select',
}: {
  onSubmit: () => void; onBack: () => void
  title?: string; submit?: string; lead?: string; diary?: boolean; kind?: QuestionKind
}) {
  const toast = useToast()
  const { draft, set } = useDraft()
  const [file, setFile] = useState<string | null>(null)
  const questions = draft.tasks
  const label = (n: number) => (diary ? `Q${n}` : `SQ ${n}`)
  const fresh = (n: number, k: QuestionKind = kind): Question => blankQuestion(label(n), k, marksFor(k))
  const write = (next: Question[]) => set('tasks', diary ? relabelDays(next) : next.map((q, i) => ({ ...q, label: label(i + 1) })))
  /** A diary's entries: how many the study runs, and the word for one ("DAY", "WEEK"). */
  const total = Number.parseInt(draft.studyDuration, 10) || 5
  const words = diaryWords(draft.durationUnit)
  const freshDay = (day: number): Question => ({ ...fresh(1), day })
  /**
   * What Upload and Generate write goes after what is already written, and
   * the empty questions go. In a diary it has no entry, so it is asked on
   * every one and the form can be saved straight away.
   */
  const addMade = (made: Question[]) => write([...questions.filter((q) => q.text.trim()), ...made.map(({ day: _, ...q }) => q)])
  /**
   * Upload File reads a text or CSV file on this device: each line (a CSV
   * row's first cell) becomes an open question. Nothing is sent anywhere, and
   * a file with no readable line adds nothing.
   */
  const upload = async (f: File | undefined) => {
    if (!f) return
    const lines = questionLines(await f.text())
    if (lines.length === 0) { toast(`${f.name} has no questions to read`); return }
    const kept = questions.filter((q) => q.text.trim())
    addMade(lines.map((text, i) => ({ ...fresh(kept.length + i + 1, 'Multi-line input'), text })))
    setFile(f.name)
    toast(`${lines.length} question${lines.length === 1 ? '' : 's'} read from ${f.name}${diary ? `, asked on every ${words.unit}` : ''}`)
  }

  /**
   * The frame opens the composer with its first questions already there,
   * empty. The survey (Create Survey_Study, 15 Oct 2026) draws five, one per
   * answer type: Single-select, Number input, Multi-line input, Slider,
   * Ranking. Empty questions are left out when the form is submitted.
   */
  useEffect(() => {
    // An older draft's questions are copied onto every entry once; after that, a question with no entry is asked on every one.
    if (diary) { if (!draft.perDay) { const started = startDays(draft.tasks, total, freshDay); if (started !== draft.tasks) set('tasks', started); set('perDay', true) } return }
    const kinds: QuestionKind[] = ['Single-select', 'Number input', 'Multi-line input', 'Slider', 'Ranking']
    if (draft.tasks.length === 0) set('tasks', kinds.map((k, i) => fresh(i + 1, k)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Generate writes questions from the client's description of the study.
   * There is no model: the text is read for its subject and for any question
   * the client wrote into it (lib/fromPrompt.ts). Empty questions are
   * replaced; anything already written is kept.
   */
  const generate = (text: string) => {
    const kept = questions.filter((q) => q.text.trim())
    const made = surveyFromPrompt(text, label, kept.length + 1, marksFor)
    if (made.length === 0) { toast('Your description does not say what the study is about, so nothing was written'); return }
    addMade(made)
    toast(`${made.length} questions written from your description${diary ? `, asked on every ${words.unit}` : ''}`)
  }

  const send = () => {
    const built = buildTasks(questions)
    if (!built.ok) { toast(built.why); return }
    if (built.tasks.length === 0) { toast('Write at least one question before submitting'); return }
    const dayFault = diary ? diaryDayFault({ ...draft, tasks: questions }) : undefined
    if (dayFault) { toast(dayFault); return }
    onSubmit()
  }

  return (
    <div className={cn('flex shrink-0 flex-col overflow-hidden rounded-lg border-1', diary ? 'w-[700px] border-stroke-1' : 'w-[628px] border-stroke-input')}>
      <div className={cn('flex items-center gap-3 border-b-1 bg-yellow-30 px-4 py-3', diary ? 'border-stroke-1' : 'border-stroke-input')}>
        <button type="button" aria-label="Back" onClick={onBack}
          className={cn('flex shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle', diary ? 'h-[38px] w-[38px]' : 'h-9 w-9')}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className={cn('text-text-title', diary ? 'text-body-medium' : 'text-title-s')}>{title}</span>
        <span className="flex-1" />
        <span className="text-text-regular text-text-subtitle">Auto-saved</span>
        {/* The form is submitted from the top bar's Save & Continue (15 Oct 2026); this is what that button presses. */}
        <button type="button" data-submit-form aria-label={submit} hidden onClick={send} />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-text-regular text-text-title">{lead}</p>

        <ComposerContext file={file} what={diary ? 'diary study' : 'survey'} onFile={(f) => { void upload(f) }} onGenerate={generate} compact={diary} />

        {diary ? (
          <>
            <DiarySetupCard onTotal={(n) => {
              const fit = fitDays(questions, n, words.Unit, freshDay)
              if (!fit.ok) { toast(fit.why); return false }
              set('tasks', fit.qs); return true
            }} />
            <DiaryDays questions={questions} total={total} unit={words.UNIT} write={write} fresh={freshDay} marksFor={marksFor}
              onDeleted={(what) => toast(`${what} deleted`)} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {questions.map((q, i) => (
                <QuestionBlock key={q.id} q={q} index={i} plain marksFor={marksFor} markWidth="w-[118px]"
                  write={(next) => write(questions.map((x) => (x.id === next.id ? next : x)))}
                  onDelete={() => { write(questions.filter((x) => x.id !== q.id)); toast(`${q.label} deleted`) }} />
              ))}
            </div>
            <Button variant="tertiary" size="row" className="w-full" leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => write([...questions, fresh(questions.length + 1)])}>Add Question</Button>
          </>
        )}
      </div>
    </div>
  )
}
