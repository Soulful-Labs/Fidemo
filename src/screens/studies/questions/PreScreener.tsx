import { useState } from 'react'
import type { Answers } from '../../../mock/storeTypes'
import type { PreScreenQuestion, Question } from '../../../mock/types'
import QuestionFlow from './QuestionFlow'

/**
 * Quick Eligibility Check (workflow 28): the three questions that decide
 * eligibility, asked before the full screener on the same question screen
 * as the screener itself (Figma 919:74274), with "1/3" progress. Answers
 * are checked against the pre-set passing answers when the last one is
 * submitted; nothing here is saved and no draft is created.
 */
export default function PreScreener({
  questions, onPass, onFail, onExit,
}: { questions: PreScreenQuestion[]; onPass: () => void; onFail: () => void; onExit: () => void }) {
  const [answers, setAnswers] = useState<Answers>({})
  const asQuestions: Question[] = questions.map((q) => ({ id: q.id, kind: 'single', prompt: q.prompt, options: q.options }))

  const check = () => {
    const passed = questions.every((q) => q.passing.includes(String(answers[q.id] ?? '')))
    if (passed) onPass()
    else onFail()
  }

  return (
    <QuestionFlow
      title="Quick Eligibility Check"
      questions={asQuestions}
      answers={answers}
      onAnswer={(id, value) => setAnswers((a) => ({ ...a, [id]: value }))}
      onSubmit={check}
      onExit={onExit}
      submitLabel="Check eligibility"
      header={
        <p className="rounded-md bg-bg-1 px-3 py-2 text-text-regular text-text-body">
          {questions.length} questions decide if this study is a fit. Pass them and the full screener opens. This part is not paid.
        </p>
      }
    />
  )
}
