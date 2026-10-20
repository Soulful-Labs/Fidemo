import { AUTHORED_KINDS } from '@shared/questions'
import type { AuthoredKind } from '@shared/questions'
import { MARKS, blankQuestion, formId } from '@shared/studyForm'
import type { FormQuestion } from '@shared/studyForm'
import Button from '../../../components/ui/Button'
import Input, { Select } from '../../../components/ui/Input'
import { IconButton } from '../../../components/ui/Button'
import { PlusIcon, TrashIcon } from '../../../components/ui/icons'

/** Kinds answered by picking from options: their options are edited here. The others take a typed or uploaded answer. */
const PICKED: AuthoredKind[] = ['Single-select', 'Multi-select', 'Ranking']

/**
 * The question builder of Edit Study (2325:214502 Screener, 2325:214997
 * survey): each question's kind, its words, and for the picked kinds its
 * options with the mark each carries. Questions can be added and removed.
 * `label` names a question by position ("Pre-screener - Q1", "SQ 1");
 * `marks` is the verdict list for a kind (screener) or one list (survey).
 */
export default function QuestionsEditor({ questions, onChange, label, marks }: {
  questions: FormQuestion[]; onChange: (next: FormQuestion[]) => void
  label: (i: number) => string; marks: (kind: AuthoredKind) => string[]
}) {
  const put = (i: number, q: FormQuestion) => onChange(questions.map((x, j) => (j === i ? q : x)))
  const relabel = (qs: FormQuestion[]) => qs.map((q, i) => ({ ...q, label: label(i) }))
  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <div key={q.id} className="flex flex-col gap-2 border-b-1 border-stroke-1 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 items-center rounded-full bg-bg-2 px-3 text-text-regular text-text-title">{label(i)}</span>
            <span className="flex-1" />
            <Select size="sm" className="w-[180px]" value={q.kind} options={[...AUTHORED_KINDS]}
              onChange={(k) => { const kind = k as AuthoredKind; put(i, { ...q, kind, options: PICKED.includes(kind) ? (q.options.length ? q.options : (MARKS[kind] ?? ['', '']).map((m) => ({ id: formId('o'), text: '', mark: m }))) : [] }) }} />
            <IconButton label={`Delete ${label(i)}`} size={32} onClick={() => onChange(relabel(questions.filter((_, j) => j !== i)))}><TrashIcon className="h-4 w-4" /></IconButton>
          </div>
          <Input size="sm" placeholder="Enter question text..." value={q.text} onChange={(e) => put(i, { ...q, text: e.target.value })} />
          {PICKED.includes(q.kind) ? q.options.map((o, k) => (
            <div key={o.id} className="flex items-center gap-2 pl-4">
              <Input size="sm" className="flex-1" placeholder="Enter option" value={o.text}
                onChange={(e) => put(i, { ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
              {marks(q.kind).length > 0 && (
                <Select size="sm" className="w-[150px]" value={o.mark || marks(q.kind)[0]} options={marks(q.kind)}
                  onChange={(m) => put(i, { ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, mark: m } : x)) })} />
              )}
              <IconButton label="Add option" size={32} onClick={() => put(i, { ...q, options: [...q.options.slice(0, k + 1), { id: formId('o'), text: '', mark: marks(q.kind).at(-1) ?? '' }, ...q.options.slice(k + 1)] })}><PlusIcon className="h-4 w-4" /></IconButton>
              <IconButton label="Delete option" size={32} disabled={q.options.length <= 2} onClick={() => put(i, { ...q, options: q.options.filter((x) => x.id !== o.id) })}><TrashIcon className="h-4 w-4" /></IconButton>
            </div>
          )) : (
            <p className="ml-4 flex h-[38px] items-center rounded-sm bg-bg-1 px-3 text-text-regular italic text-text-body">Participants will answer this in their own words or with a file.</p>
          )}
        </div>
      ))}
      <Button variant="secondary" size="md" leftIcon={<PlusIcon className="h-4 w-4" />}
        onClick={() => onChange(relabel([...questions, blankQuestion(label(questions.length))]))}>Add Question</Button>
    </div>
  )
}
