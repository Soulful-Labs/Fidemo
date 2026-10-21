import { AUTHORED_KINDS } from '@shared/questions'
import type { AuthoredKind } from '@shared/questions'
import { MARKS, blankQuestion, formId } from '@shared/studyForm'
import type { FormQuestion } from '@shared/studyForm'
import { useState } from 'react'
import Button, { IconButton } from '../../../components/ui/Button'
import Input, { Select } from '../../../components/ui/Input'
import { GripIcon, PlusIcon, TrashIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import QuestionBody, { PICKED } from './QuestionBody'

/** What a question becomes when its kind changes: options kept for the picked kinds, a matrix's grid started, nothing else carried over. */
function asKind(q: FormQuestion, kind: AuthoredKind, marks: string[]): FormQuestion {
  if (PICKED.includes(kind)) return { ...q, kind, options: q.options.length ? q.options : (marks.length ? marks.slice(0, 2) : ['', '']).map((m) => ({ id: formId('o'), text: '', mark: kind === 'Ranking' ? '' : m })) }
  if (kind === 'Mattrix') return { ...q, kind, options: [], columns: q.columns ?? [''], rows: q.rows ?? [''], matrixKind: q.matrixKind ?? 'Single-select/row' }
  return { ...q, kind, options: [] }
}

/**
 * The question builder of Edit Study (2325:214502 Screener, 2325:214997
 * survey): each question's label, kind, words and what its kind needs.
 * Questions are dragged by the grip to change their order, added at the
 * foot, and deleted with the bin (the earlier decision over the drawn
 * kebab). `label` names a question by position ("Pre-screener - Q1",
 * "SQ 1"); `marks` is the verdict list for a kind.
 */
export default function QuestionsEditor({ questions, onChange, label, marks }: {
  questions: FormQuestion[]; onChange: (next: FormQuestion[]) => void
  label: (i: number) => string; marks: (kind: AuthoredKind) => string[]
}) {
  const [dragging, setDragging] = useState<number | null>(null)
  const relabel = (qs: FormQuestion[]) => qs.map((q, i) => ({ ...q, label: label(i) }))
  const put = (i: number, q: FormQuestion) => onChange(questions.map((x, j) => (j === i ? q : x)))
  const move = (from: number, to: number) => {
    if (from === to) return
    const next = [...questions]; const [q] = next.splice(from, 1); next.splice(to, 0, q!)
    onChange(relabel(next))
  }
  return (
    <div className="flex flex-col">
      {questions.map((q, i) => (
        <div key={q.id} onDragOver={(e) => { if (dragging !== null) e.preventDefault() }} onDrop={() => { if (dragging !== null) move(dragging, i); setDragging(null) }}
          className={cn('flex gap-3 border-b-1 border-stroke-1 py-4', dragging === i && 'opacity-50')}>
          <span draggable onDragStart={() => setDragging(i)} onDragEnd={() => setDragging(null)} title="Drag to reorder" aria-label={`Drag ${label(i)} to reorder`}
            className="mt-2 cursor-grab text-text-body"><GripIcon className="h-5 w-5" /></span>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 items-center rounded-full bg-bg-2 px-3 text-text-regular text-text-title">{label(i)}</span>
              <span className="flex-1" />
              {q.kind === 'Mattrix' && <Select size="sm" className="w-[170px]" value={q.matrixKind ?? 'Single-select/row'} options={['Single-select/row', 'Multi-select/row']} onChange={(v) => put(i, { ...q, matrixKind: v })} />}
              <Select size="sm" className="w-[170px]" value={q.kind} options={[...AUTHORED_KINDS]} onChange={(k) => put(i, asKind(q, k as AuthoredKind, marks(k as AuthoredKind)))} />
              <IconButton label={`Delete ${label(i)}`} size={32} onClick={() => onChange(relabel(questions.filter((_, j) => j !== i)))}><TrashIcon className="h-4 w-4" /></IconButton>
            </div>
            <Input size="sm" placeholder="Enter question text..." aria-label={`${label(i)} question`} value={q.text} onChange={(e) => put(i, { ...q, text: e.target.value })} />
            <QuestionBody q={q} put={(x) => put(i, x)} marks={marks(q.kind) ?? MARKS[q.kind] ?? []} />
          </div>
        </div>
      ))}
      <Button className="mt-4" variant="secondary" size="md" leftIcon={<PlusIcon className="h-4 w-4" />}
        onClick={() => onChange(relabel([...questions, blankQuestion(label(questions.length))]))}>Add Question</Button>
    </div>
  )
}
