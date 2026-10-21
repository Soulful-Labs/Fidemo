import Button from '../../components/ui/Button'
import { Plus } from '../../components/ui/icons'
import type { Question, QuestionKind } from '../../mock/createStore'
import { QuestionBlock } from './Screener'

/** Each question numbered within its own entry, the entries in order (Q1, Q2 on DAY 1, Q1 on DAY 2). */
export function relabelDays(qs: Question[]): Question[] {
  const seen: Record<number, number> = {}
  return [...qs].sort((a, b) => (a.day ?? 0) - (b.day ?? 0)).map((q) => {
    const d = q.day ?? 0
    seen[d] = (seen[d] ?? 0) + 1
    return { ...q, label: `Q${seen[d]}` }
  })
}

/**
 * The form a diary opens with (1518:94904): two empty questions on the first
 * entry and one on each of the others. A draft from before 21 Oct 2026 has
 * questions with no entry, asked every time: each is copied onto every entry,
 * so nothing it asked is lost and each entry can now differ.
 */
export function startDays(qs: Question[], total: number, fresh: (day: number) => Question): Question[] {
  if (qs.length === 0) return relabelDays(Array.from({ length: total }, (_, i) => i + 1).flatMap((d) => (d === 1 ? [fresh(1), fresh(1)] : [fresh(d)])))
  if (qs.every((q) => q.day)) return qs
  const everyDay = qs.filter((q) => !q.day)
  const copies = Array.from({ length: total }, (_, i) => i + 1).flatMap((d) => everyDay.map((q) => ({ ...q, id: `${q.id}-d${d}`, day: d })))
  return relabelDays([...qs.filter((q) => q.day), ...copies])
}

/**
 * A new number of entries: a longer diary gets an empty question on each new
 * entry, a shorter one drops the entries it no longer has. It is refused,
 * with the reason, while a dropped entry still holds a written question.
 */
export function fitDays(qs: Question[], total: number, unit: string, fresh: (day: number) => Question): { ok: true; qs: Question[] } | { ok: false; why: string } {
  const lost = qs.find((q) => (q.day ?? 0) > total && q.text.trim())
  if (lost) return { ok: false, why: `${unit} ${lost.day} has questions. Delete them before making the study shorter` }
  const kept = qs.filter((q) => (q.day ?? 0) <= total)
  const added = Array.from({ length: total }, (_, i) => i + 1).filter((d) => !kept.some((q) => q.day === d)).map(fresh)
  return { ok: true, qs: relabelDays([...kept, ...added]) }
}

/** One card per entry (DAY 1 to DAY 5 in 1518:94904), each with its own questions and its own Add Question. */
export function DiaryDays({ questions, total, unit, write, fresh, marksFor, onDeleted }: {
  questions: Question[]; total: number; unit: string
  write: (next: Question[]) => void; fresh: (day: number) => Question
  marksFor: (kind: QuestionKind) => string[]; onDeleted: (label: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
        <section key={day} aria-label={`${unit} ${day}`} className="flex flex-col gap-4 rounded-lg border-1 border-stroke-1 bg-bg-0 p-4">
          <p className="flex h-7 items-center justify-center rounded-full bg-bgAlt-2 text-text-regular uppercase text-text-title">{unit} {day}</p>
          {questions.filter((q) => q.day === day).map((q, i) => (
            <QuestionBlock key={q.id} q={q} index={i} plain marksFor={marksFor} markWidth="w-[118px]" labelClass="h-8 bg-bgAlt-2 px-3.5" largePreview
              write={(next) => write(questions.map((x) => (x.id === next.id ? next : x)))}
              onDelete={() => { write(questions.filter((x) => x.id !== q.id)); onDeleted(`${unit} ${day} ${q.label}`) }} />
          ))}
          <Button variant="tertiary" size="row" className="w-full" leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => write([...questions, fresh(day)])}>Add Question</Button>
        </section>
      ))}
    </div>
  )
}
