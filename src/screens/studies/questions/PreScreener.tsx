import { useState } from 'react'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import { ArrowLeft, ChevronRight, Close } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { PreScreenQuestion } from '../../../mock/types'

/**
 * Workflow 28: the three questions that decide eligibility are asked first,
 * with pre-set passing answers, so nothing is reviewed by hand at this
 * stage. Only those who pass see the full screener. Answers here are not
 * saved and never create a draft.
 */
export default function PreScreener({
  questions, onPass, onFail, onExit,
}: { questions: PreScreenQuestion[]; onPass: () => void; onFail: () => void; onExit: () => void }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const question = questions[index]
  const chosen = question ? answers[question.id] : undefined
  const last = index === questions.length - 1

  const next = () => {
    if (!question || !chosen) return
    if (!question.passing.includes(chosen)) { onFail(); return }
    if (last) onPass()
    else setIndex((i) => i + 1)
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b-1 border-stroke-1 bg-bg-0 px-4 pb-2 pt-3">
        <div className="flex h-8 items-center gap-2">
          <button type="button" onClick={onExit} aria-label="Close" className="-ml-1 flex h-8 w-8 items-center justify-center text-text-title">
            <Close className="h-6 w-6" />
          </button>
          <h1 className="text-title-s text-text-title">Quick Eligibility Check</h1>
        </div>
        <div className="flex items-center gap-2" role="progressbar" aria-valuenow={index + 1} aria-valuemax={questions.length}>
          {questions.map((q, i) => (
            <span key={q.id} className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-brand-secondary' : 'bg-green-900/60')} />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-6">
        <p className="text-text-regular text-text-body">
          {questions.length} questions decide if this study is a fit. Pass them and the full screener opens. This part is not paid.
        </p>
        {question && (
          <>
            <h2 className="text-title-s text-text-title">{question.prompt}</h2>
            <div className="flex flex-col gap-2">
              {question.options.map((option) => {
                const on = chosen === option
                return (
                  <button key={option} type="button" role="radio" aria-checked={on}
                    onClick={() => setAnswers((a) => ({ ...a, [question.id]: option }))}
                    className={cn('flex items-center gap-3 rounded-md border-1 p-3 text-left text-body-regular transition-colors',
                      on ? 'border-yellow-700 bg-yellow-1000/50 text-brand-primary' : 'border-transparent bg-bg-1 text-text-title')}>
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5', on ? 'border-brand-primary' : 'border-text-subtitle')}>
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <CtaBar>
        <Button variant="secondary" onClick={() => (index === 0 ? onExit() : setIndex((i) => i - 1))} aria-label={index === 0 ? 'Exit' : 'Back'} className="w-12 shrink-0 px-0">
          <ArrowLeft />
        </Button>
        <Button className="flex-1" disabled={!chosen} onClick={next} rightIcon={<ChevronRight className="h-5 w-5" />}>
          {last ? 'Check eligibility' : 'Continue'}
        </Button>
      </CtaBar>
    </div>
  )
}
