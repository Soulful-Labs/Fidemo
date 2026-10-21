import type { AuthoredKind } from '@shared/questions'
import { formId } from '@shared/studyForm'
import type { FormQuestion } from '@shared/studyForm'
import { IconButton } from '../../../components/ui/Button'
import Input, { Select } from '../../../components/ui/Input'
import { Toggle } from '../../../components/ui/controls'
import { GripIcon, PlusIcon, TrashIcon } from '../../../components/ui/icons'

/** Kinds answered by picking from options. */
export const PICKED: AuthoredKind[] = ['Single-select', 'Multi-select', 'Ranking']
const TYPED: Partial<Record<AuthoredKind, string>> = {
  'Single-line input': 'Participants will enter a short text response',
  'Number input': 'Participants will enter a number in text response',
  'Multi-line input': 'Participants will enter a long text response',
}
const FORMATS = ['PDF', 'PNG or JPG', 'CSV', 'Any file']
/** The verdict's colour, as drawn: a pass in green, a screen-out in red. */
const TONE: Record<string, string> = { Correct: '[&_select]:text-state-success', 'Must Select': '[&_select]:text-state-success', Qualify: '[&_select]:text-state-success', Incorrect: '[&_select]:text-state-danger', Disqualify: '[&_select]:text-state-danger' }
const Note = ({ children }: { children: string }) => <p className="flex h-[38px] items-center rounded-sm bg-bg-1 px-3 text-text-regular italic text-text-subtitle">{children}</p>

/**
 * What a question needs below its words, by kind, as the Screener
 * (2325:214502) and Create Survey (2325:214997) frames draw it: options with
 * their marks, a typed-answer note, the slider's range, a ranking's items, a
 * file's formats and count, or a matrix's columns and rows.
 */
export default function QuestionBody({ q, put, marks }: { q: FormQuestion; put: (q: FormQuestion) => void; marks: string[] }) {
  if (TYPED[q.kind]) return <Note>{TYPED[q.kind]!}</Note>
  if (q.kind === 'Slider') {
    return (
      <div className="flex items-end gap-3">
        <Input size="sm" className="flex-1" label="Min Value" placeholder="0" inputMode="numeric" value={q.min ?? ''} onChange={(e) => put({ ...q, min: e.target.value })} />
        <Input size="sm" className="flex-1" label="Max Value" placeholder="0" inputMode="numeric" value={q.max ?? ''} onChange={(e) => put({ ...q, max: e.target.value })} />
        <Input size="sm" className="flex-1" label="Gap" placeholder="0" inputMode="numeric" value={q.gap ?? ''} onChange={(e) => put({ ...q, gap: e.target.value })} />
        <span className="flex h-[38px] items-center"><Toggle checked={q.showGap ?? true} onChange={(v) => put({ ...q, showGap: v })} label="Show Gap" /></span>
      </div>
    )
  }
  if (q.kind === 'File Upload') {
    return (
      <>
        <div className="flex items-end gap-3">
          <Select size="sm" className="flex-1" label="File formats" placeholder="Select formats" value={q.formats} options={FORMATS} onChange={(v) => put({ ...q, formats: v })} />
          <Input size="sm" className="flex-1" label="Max number of files" inputMode="numeric" value={q.maxFiles ?? '1'} onChange={(e) => put({ ...q, maxFiles: e.target.value })} />
        </div>
        <Note>Participants will upload a file</Note>
      </>
    )
  }
  if (q.kind === 'Mattrix') {
    const columns = q.columns ?? [''], rows = q.rows ?? ['']
    return (
      <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-3">
        <div className="flex items-center gap-2 pl-[148px]">
          {columns.map((c, i) => <Input key={i} size="sm" className="w-[120px]" aria-label={`Column ${i + 1}`} placeholder="Enter column item..." value={c} onChange={(e) => put({ ...q, columns: columns.map((x, k) => (k === i ? e.target.value : x)) })} />)}
          <IconButton label="Add column" size={32} onClick={() => put({ ...q, columns: [...columns, ''] })}><PlusIcon className="h-4 w-4" /></IconButton>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input size="sm" className="w-[140px]" aria-label={`Row ${i + 1}`} placeholder="Enter row item..." value={r} onChange={(e) => put({ ...q, rows: rows.map((x, k) => (k === i ? e.target.value : x)) })} />
            {columns.map((_, k) => <span key={k} className="flex h-[38px] w-[120px] items-center justify-center rounded-sm border-1 border-stroke-input bg-bg-0"><span className="h-4 w-4 rounded-full border-1 border-text-body" /></span>)}
            <IconButton label="Add row" size={32} onClick={() => put({ ...q, rows: [...rows.slice(0, i + 1), '', ...rows.slice(i + 1)] })}><PlusIcon className="h-4 w-4" /></IconButton>
            <IconButton label="Delete row" size={32} disabled={rows.length <= 1} onClick={() => put({ ...q, rows: rows.filter((_, k) => k !== i) })}><TrashIcon className="h-4 w-4" /></IconButton>
          </div>
        ))}
      </div>
    )
  }
  // Single-select, Multi-select, Ranking: options, each with its mark (not for Ranking), add and remove.
  return (
    <>
      {q.options.map((o, k) => (
        <div key={o.id} className="flex items-center gap-2">
          <GripIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-text-body" />
          {q.kind === 'Ranking'
            ? <span className="w-5 shrink-0 text-center text-text-regular text-text-subtitle">{k + 1}</span>
            : <span aria-hidden="true" className={`h-4 w-4 shrink-0 border-1 border-text-body ${q.kind === 'Multi-select' ? 'rounded-xs' : 'rounded-full'}`} />}
          <Input size="sm" className="flex-1" placeholder="Enter option" aria-label={`Option ${k + 1}`} value={o.text}
            onChange={(e) => put({ ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
          {q.kind !== 'Ranking' && marks.length > 0 && (
            <Select size="sm" className="w-[150px]" boxClassName={TONE[o.mark || marks[0]!]} value={o.mark || marks[0]} options={marks}
              onChange={(m) => put({ ...q, options: q.options.map((x) => (x.id === o.id ? { ...x, mark: m } : x)) })} />
          )}
          <IconButton label="Add option" size={32} onClick={() => put({ ...q, options: [...q.options.slice(0, k + 1), { id: formId('o'), text: '', mark: q.kind === 'Ranking' ? '' : marks.at(-1) ?? '' }, ...q.options.slice(k + 1)] })}><PlusIcon className="h-4 w-4" /></IconButton>
          <IconButton label="Delete option" size={32} disabled={q.options.length <= 2} onClick={() => put({ ...q, options: q.options.filter((x) => x.id !== o.id) })}><TrashIcon className="h-4 w-4" /></IconButton>
        </div>
      ))}
    </>
  )
}
