import { Fragment } from 'react'
import { cn } from '../../../lib/cn'
import { QUESTION_PROMPT } from '../../../mock/review'
import type { Question, Verdict } from '../../../mock/review'
import { Pill, Rule } from './parts'

const VERDICT: Record<Verdict, string> = {
  Correct: 'text-state-success',
  'Must Select': 'text-state-success',
  Incorrect: 'text-state-danger',
  'May Select': 'text-text-body',
}

/**
 * One question as the client wrote it (Screener 1984:114217, Survey
 * 1984:122634, Diary 1984:134413): the number pill and the type pill, 12, the
 * prompt in Body 16, 8, then either the answers (a 38px box with an empty
 * radio, 4, the verdict box: 112 wide for single-select, 126 for
 * multi-select) or the placeholder the participant will see. Read only.
 */
export function QuestionBlock({ label, q }: { label: string; q: Question }) {
  const multi = (q.answers?.length ?? 0) > 2
  return (
    <div>
      <div className="flex gap-2">
        <Pill filled>{label}</Pill>
        <Pill muted>{q.kind}</Pill>
      </div>
      <p className="pt-3 text-body-medium leading-[22px] text-text-title">{QUESTION_PROMPT}</p>
      <div className="flex flex-col gap-2 pt-2">
        {q.answers?.map(([answer, verdict]) => (
          <div key={answer} className="flex gap-1">
            <div className="flex h-[38px] flex-1 items-center gap-2 rounded-sm border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title">
              <span aria-hidden="true" className="h-[18px] w-[18px] rounded-full border-1.5 border-text-subtitle" />
              {answer}
            </div>
            <div className={cn('flex h-[38px] items-center rounded-sm border-1 border-stroke-1 bg-bg-1 px-3 text-text-regular', multi ? 'w-[126px]' : 'w-[112px]', VERDICT[verdict])}>
              {verdict}
            </div>
          </div>
        ))}
        {q.placeholder && (
          <div className="flex h-[38px] items-center rounded-sm border-1 border-stroke-input bg-bg-0 px-3 text-text-medium text-text-body">{q.placeholder}</div>
        )}
      </div>
    </div>
  )
}

/** Questions one under another, a rule between them with 16 either side. */
export function QuestionList({ labels, questions, ruled = true }: { labels: string[]; questions: Question[]; ruled?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <Fragment key={labels[i]}>
          {ruled && i > 0 && <Rule />}
          <QuestionBlock label={labels[i]!} q={q} />
        </Fragment>
      ))}
    </div>
  )
}
