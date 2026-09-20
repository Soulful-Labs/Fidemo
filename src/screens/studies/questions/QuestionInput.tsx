import FileField from '../../../components/app/FileField'
import Input from '../../../components/ui/Input'
import { Check } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { Question } from '../../../mock/types'

export type Answer = string | string[]

const OTHER = 'Other'
const OPTION = 'flex w-full flex-col gap-3 rounded-md border-1 p-3 text-left text-body-regular transition-colors'
const ON = 'border-yellow-700 bg-yellow-1000/50 text-brand-primary'
const OFF = 'border-transparent bg-bg-1 text-text-title'

function Radio({ on }: { on: boolean }) {
  return (
    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5', on ? 'border-brand-primary' : 'border-text-subtitle')}>
      {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
    </span>
  )
}

function Box({ on }: { on: boolean }) {
  return (
    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-none border-1.5', on ? 'border-brand-primary bg-brand-primary text-cta-primaryText' : 'border-text-subtitle')}>
      {on && <Check className="h-3.5 w-3.5" />}
    </span>
  )
}

/** Splits a multi answer into ticked options and the free "Other" text. */
function splitMulti(value: string[]) {
  const other = value.find((v) => v.startsWith(`${OTHER}:`))
  return { ticked: value.filter((v) => !v.startsWith(`${OTHER}:`)), otherText: other ? other.slice(OTHER.length + 1) : '' }
}

/**
 * One question in any of the five drawn kinds (PRD 6.8, Figma 919:74274 and
 * siblings): radio cards, checkbox cards with a free "Other", multi-line text
 * with a count, picture upload, and the Easy/Neutral/Hard scale.
 */
export default function QuestionInput({
  question, value, onChange,
}: { question: Question; value?: Answer; onChange: (next: Answer) => void }) {
  if (question.kind === 'single' || question.kind === 'scale') {
    const chosen = typeof value === 'string' ? value : ''
    return (
      <div className={cn(question.kind === 'scale' ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2')}>
        {question.options.map((option) => {
          const on = chosen === option
          return (
            <button key={option} type="button" role="radio" aria-checked={on} onClick={() => onChange(option)}
              className={cn(OPTION, question.kind === 'scale' ? 'items-center justify-center' : 'flex-row items-center', on ? ON : OFF)}>
              {question.kind === 'single' && <Radio on={on} />}
              {option}
            </button>
          )
        })}
      </div>
    )
  }

  if (question.kind === 'multi') {
    const list = Array.isArray(value) ? value : []
    const { ticked, otherText } = splitMulti(list)
    const set = (nextTicked: string[], nextOther: string) =>
      onChange(nextTicked.includes(OTHER) && nextOther ? [...nextTicked, `${OTHER}:${nextOther}`] : nextTicked)
    return (
      <div className="flex flex-col gap-3">
        {question.helper && <p className="text-text-regular text-text-subtitle">{question.helper}</p>}
        {question.options.map((option) => {
          const on = ticked.includes(option)
          return (
            <div key={option} role="checkbox" aria-checked={on} tabIndex={0}
              onClick={() => set(on ? ticked.filter((t) => t !== option) : [...ticked, option], otherText)}
              onKeyDown={(e) => e.key === 'Enter' && set(on ? ticked.filter((t) => t !== option) : [...ticked, option], otherText)}
              className={cn(OPTION, 'cursor-pointer', on ? ON : OFF)}>
              <span className="flex items-center gap-3"><Box on={on} />{option}</span>
              {option === OTHER && on && (
                <div onClick={(e) => e.stopPropagation()} className="rounded-md bg-bg-0">
                  <Input value={otherText} placeholder="Write answer" aria-label="Other answer"
                    onChange={(e) => set(ticked, e.target.value)} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (question.kind === 'text') {
    const text = typeof value === 'string' ? value : ''
    return (
      <Input multiline rows={4} maxLength={500} showCount value={text} placeholder={question.placeholder ?? 'Type your answer here..'}
        onChange={(e) => onChange(e.target.value)} aria-label={question.prompt} />
    )
  }

  return (
    <FileField label="Upload Picture" hint=".jpg or .png" accept="image/jpeg,image/png"
      fileName={typeof value === 'string' && value ? value : undefined} onPick={(name) => onChange(name)} />
  )
}

/** A question counts as answered when it has any content. */
export function isAnswered(question: Question, value?: Answer): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.length > 0 && !(value.includes(OTHER) && value.length === 1 && question.kind === 'multi' && !value.some((v) => v.startsWith('Other:')))
  return value.trim().length > 0
}
