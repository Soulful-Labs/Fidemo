import { useState } from 'react'
import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import { ArrowLeft, ChevronRight, Close, Info } from '../../../components/ui/icons'
import type { Question } from '../../../mock/types'
import type { Answers } from '../../../mock/storeTypes'
import QuestionInput, { isAnswered } from './QuestionInput'
import { cn } from '../../../lib/cn'
import { useStore } from '../../../mock/store'

export interface QuestionFlowProps {
  title: string
  questions: Question[]
  answers: Answers
  onAnswer: (id: string, value: Answers[string]) => void
  /** Called on Submit from the last question. */
  onSubmit: () => void
  /** Close, or Back from the first question. */
  onExit: () => void
  onInfo?: () => void
  submitLabel?: string
  /** Extra content above the question, e.g. the diary day heading. */
  header?: ReactNode
  /** Surveys draw one segment per question instead of the bar and counter. */
  progress?: 'bar' | 'segments'
}

/**
 * One question per screen with the 84px title bar (close, title, info icon,
 * green progress line and "1/10"), and the back circle + Continue pair in
 * the CTA bar (Figma 919:74274). Shared by the screener, survey and diary.
 */
export default function QuestionFlow({
  title, questions, answers, onAnswer, onSubmit, onExit, onInfo, submitLabel = 'Submit', header, progress = 'bar',
}: QuestionFlowProps) {
  const { toast } = useStore()
  const [index, setIndex] = useState(0)
  const question = questions[index]
  const last = index === questions.length - 1
  const answered = question ? isAnswered(question, answers[question.id]) : false
  const pct = ((index + 1) / Math.max(1, questions.length)) * 100

  const back = () => (index === 0 ? onExit() : setIndex((i) => i - 1))
  const next = () => (last ? onSubmit() : setIndex((i) => i + 1))

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b-1 border-stroke-1 bg-bg-0 px-4 pb-2 pt-3">
        <div className="flex h-8 items-center gap-2">
          <button type="button" onClick={onExit} aria-label="Close" className="-ml-1 flex h-8 w-8 items-center justify-center text-text-title">
            <Close className="h-6 w-6" />
          </button>
          <h1 className="text-title-s text-text-title">{title}</h1>
          {onInfo && (
            <button type="button" onClick={onInfo} aria-label="Why Screener?" className="ml-auto flex h-8 w-8 items-center justify-center text-text-title">
              <Info className="h-6 w-6" />
            </button>
          )}
        </div>
        {progress === 'segments' ? (
          <div className="flex items-center gap-2" role="progressbar" aria-valuenow={index + 1} aria-valuemax={questions.length}>
            {questions.map((q, i) => (
              <span key={q.id} className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-brand-secondary' : 'bg-green-900/60')} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-green-900/60" role="progressbar" aria-valuenow={index + 1} aria-valuemax={questions.length}>
              <div className="h-full rounded-full bg-brand-secondary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-text-regular text-text-subtitle">{index + 1}/{questions.length}</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-6">
        {header}
        {question ? (
          <>
            <h2 className="text-title-s text-text-title">{question.prompt}</h2>
            <QuestionInput
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => onAnswer(question.id, value)}
            />
          </>
        ) : (
          <p className="text-body-regular text-text-body">There are no questions for this step.</p>
        )}
      </div>

      <CtaBar>
        <Button variant="secondary" onClick={back} aria-label={index === 0 ? 'Exit' : 'Back'} className="w-12 shrink-0 px-0">
          <ArrowLeft />
        </Button>
        <Button
          className="flex-1"
          disabled={!answered && Boolean(question)}
          onBlocked={() => toast('Answer this question to continue')}
          onClick={next}
          rightIcon={last ? undefined : <ChevronRight className="h-5 w-5" />}
        >
          {last ? submitLabel : 'Continue'}
        </Button>
      </CtaBar>
    </div>
  )
}
