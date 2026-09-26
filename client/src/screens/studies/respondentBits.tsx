import Button from '../../components/ui/Button'
import { Calendar, CheckCircle, Clock, Copy, Download, Eye, MapPin } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { copyText } from '../../lib/copy'
import type { Answer, QA } from '../../mock/respondent'
import { ACTIVITY, NOTES, SESSION, VERIFICATION_PIN } from '../../mock/respondent'
import { useToast } from '../../components/ui/Toast'

/** The scale answer: a column per star, the chosen cell filled. */
function Matrix({ a }: { a: Extract<Answer, { kind: 'matrix' }> }) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-3">
      <div className="mb-[7px] flex items-center gap-2">
        <span className="w-[83px] shrink-0" />
        <span className="grid flex-1 grid-cols-5 gap-[5px]">
          {a.columns.map((c) => (
            <span key={c} className="text-center text-text-regular text-text-title">{c}</span>
          ))}
        </span>
      </div>
      {a.rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-[83px] shrink-0 text-text-regular text-text-title">{r.label}</span>
          <span className="grid flex-1 grid-cols-5 gap-[5px]">
            {a.columns.map((_, c) => (
              <span key={c} className={cn('flex h-[38px] items-center justify-center rounded-sm',
                c === r.choice ? 'bg-yellow-100' : 'bg-bg-2')}>
                <span className={cn('h-4 w-4 rounded-full',
                  c === r.choice ? 'bg-brand-primary' : 'border-1 border-cta-tertiaryStroke bg-bg-0')} />
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

/** One answer, in whichever of the five shapes the screener collected it. */
function Ans({ a }: { a: Answer }) {
  const toast = useToast()
  if (a.kind === 'text') return <p className="text-text-regular leading-5 text-text-title">{a.value}</p>
  if (a.kind === 'bullets') {
    return (
      <ul className="flex flex-col">
        {a.values.map((v) => (
          <li key={v} className="flex gap-2 text-text-regular leading-5 text-text-title"><span>&bull;</span>{v}</li>
        ))}
      </ul>
    )
  }
  if (a.kind === 'ordered') {
    return (
      <ol className="flex flex-col">
        {a.values.map((v, i) => (
          <li key={v} className="flex gap-2 text-text-regular leading-5 text-text-title"><span>{i + 1}.</span>{v}</li>
        ))}
      </ol>
    )
  }
  if (a.kind === 'file') {
    return (
      <div className="flex w-[350px] items-center gap-[9px] rounded-md border-1 border-stroke-input p-2">
        <span className="h-12 w-[66px] shrink-0 rounded-sm bg-bg-2" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-text-regular text-text-title">{a.name}</span>
          <span className="text-text-regular text-text-subtitle">{a.size}</span>
        </span>
        <button type="button" aria-label="Preview" onClick={() => toast('Opening the file')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-1 border-stroke-input text-text-subtitle hover:text-text-title">
          <Eye className="h-5 w-5" />
        </button>
      </div>
    )
  }
  return <Matrix a={a} />
}

/** A question and its answer, under the hairline that separates it from the one above. */
export function QARow({ n, qa, first }: { n: number; qa: QA; first?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-[3px] px-4 pb-[11px]', first ? 'pt-4' : 'border-t-1 border-bgAlt-2 pt-3')}>
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-sm bg-bgAlt-2 text-text-regular text-text-subtitle">
          Q{n}
        </span>
        <p className="pt-1 text-text-large text-text-title">{qa.prompt}</p>
      </div>
      <div className="flex items-start gap-2">
        <span className="w-9 shrink-0 text-text-regular leading-5 text-text-subtitle">Ans.</span>
        <div className="min-w-0 flex-1"><Ans a={qa.answer} /></div>
      </div>
    </div>
  )
}

/** The day bar the diary result groups its questions under. */
export function DayBar({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4">
      <p className="flex h-7 items-center justify-center rounded-full bg-bgAlt-1 text-text-regular text-text-subtitle">{label}</p>
    </div>
  )
}

/** The verification PIN, wide on the Activity tab and boxed beside the session. */
export function PinCard({ variant, pin, name, onShared }: {
  variant: 'activity' | 'session'
  /**
   * The code on this participation. The frame prints one PIN for its seeded
   * respondent; the code the store checks is per person, so showing the
   * frame's string meant copying a PIN that verifies nobody.
   */
  pin?: string
  name?: string
  /** The client has used the code, which is their half of step 42. */
  onShared?: (code: string) => void
}) {
  const wide = variant === 'activity'
  const toast = useToast()
  const code = pin ?? VERIFICATION_PIN.pin
  const first = name?.split(' ')[0]
  const body = (wide ? VERIFICATION_PIN.activityBody : VERIFICATION_PIN.sessionBody)
    .replace('John M.', first ? `${first}.` : 'John M.')

  /** The frame draws a copy glyph, so it copies, and records that it was used. */
  const share = async () => {
    const ok = await copyText(code)
    onShared?.(code)
    toast(ok ? 'PIN copied, share it to verify their session' : 'Could not reach the clipboard')
  }

  return (
    <div className={cn('rounded-lg bg-bg-1 p-4', wide ? 'flex items-center justify-between gap-4' : 'flex flex-col gap-3')}>
      <div className="flex flex-col gap-1">
        <p className="text-body-large text-text-title">{VERIFICATION_PIN.title}</p>
        <p className={cn('text-text-regular text-text-subtitle', !wide && 'max-w-[344px]')}>{body}</p>
      </div>
      <button type="button" onClick={share} aria-label={`Copy the verification PIN for ${name ?? 'this respondent'}`}
        className="flex h-12 w-[198px] items-center justify-between rounded-sm border-1 border-stroke-input bg-bg-0 px-4 hover:border-cta-primary">
        <span className="text-title-s text-text-title">{code}</span>
        <Copy className="h-5 w-5 text-text-subtitle" />
      </button>
    </div>
  )
}

/** The booked session, in the three states the frames draw it in. */
export function SessionCard({ state }: { state: 'booked' | 'running' | 'done' }) {
  const toast = useToast()
  /** Once it is over the frame greys the slot out and leaves a Completed chip. */
  const meta = state === 'done' ? 'text-text-subtitle' : 'text-text-title'
  const glyph = state === 'done' ? 'text-text-body' : 'text-brand-primary'
  return (
    <div className={cn('flex justify-between gap-4 rounded-lg bg-yellow-30 p-4', state === 'booked' && 'flex-col')}>
      <div className="flex flex-col gap-2">
        <p className="text-body-large text-text-title">{SESSION.title}</p>
        <p className={cn('flex h-5 items-center gap-2 text-text-regular', meta)}>
          <Calendar className={cn('h-4 w-4', glyph)} />{SESSION.date}
        </p>
        <p className={cn('flex h-5 items-center gap-2 text-text-regular', meta)}>
          <Clock className={cn('h-4 w-4', glyph)} />{SESSION.time}
        </p>
        {state !== 'booked' && (
          <p className={cn('flex h-5 items-center gap-2 text-text-regular', meta)}>
            <MapPin className={cn('h-4 w-4', glyph)} />{SESSION.address}
          </p>
        )}
        {state === 'booked' && <Button size="none" className="mt-2 h-12 w-full" onClick={() => toast('Interview started')}>{SESSION.cta}</Button>}
      </div>
      {state === 'running' && (
        <div className="flex flex-col items-end gap-3">
          <Button size="none" className="h-12 w-[110px]" onClick={() => toast('Interview finished')}>Finish</Button>
          <span className="flex h-12 items-center gap-2 rounded-sm border-1 border-stroke-input bg-bg-0 px-4 text-title-s text-text-title">
            <Clock className="h-5 w-5 text-text-subtitle" />{SESSION.running}
          </span>
        </div>
      )}
      {state === 'done' && (
        <span className="flex h-12 items-center rounded-sm bg-cta-secondary px-5 text-body-medium text-text-title">Completed</span>
      )}
    </div>
  )
}

/** The notes the client types during a session. */
export function NotesCard({ download, className }: { download?: boolean; className?: string }) {
  const toast = useToast()
  const marks = ['B', 'I', 'U', 'S', 'H1', 'H2', 'H3', 'H4']
  return (
    <div className={cn('flex flex-col rounded-lg border-1 border-stroke-input', className)}>
      <div className="flex h-12 items-center justify-between gap-3 rounded-t-lg bg-bg-1 px-4">
        <span className="text-text-large text-text-title">
          {NOTES.title} <span className="text-text-regular text-text-subtitle">&bull; {NOTES.saved}</span>
        </span>
        {download && (
          <button type="button" aria-label="Download notes" onClick={() => toast('Notes downloaded')} className="text-text-subtitle hover:text-text-title">
            <Download className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex h-12 items-center gap-6 border-b-1 border-stroke-1 px-4 text-text-subtitle">
        {marks.map((m) => <span key={m} className="text-body-regular">{m}</span>)}
        <span className="text-body-regular">&#9776;</span>
        <span className="text-body-regular">&#9711;</span>
      </div>
      <div className="flex flex-col gap-2 px-4 py-4">
        <p className="text-body-medium text-text-title">{NOTES.heading}</p>
        <p className="text-text-regular text-text-title">{NOTES.body}</p>
        <p className="flex gap-2 pl-2 text-text-regular text-text-title"><span>&bull;</span>{NOTES.bullet}</p>
      </div>
    </div>
  )
}

/** Study activity: a checked list, some entries with their own bullets. */
export function ActivityList() {
  return (
    <>
      <h2 className="pt-[18px] text-title-s leading-[22px] text-text-title">Study activity</h2>
      <ol className="flex flex-col gap-4 pt-[9px]">
        {ACTIVITY.map((a, i) => (
          <li key={i} className="flex gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" />
            <div className="flex flex-col">
              <p className="text-text-regular leading-5 text-text-title">
                {a.label}{a.strong && <span className="text-text-large">{a.strong}</span>}
              </p>
              {a.at && <p className="text-text-regular leading-5 text-text-body">{a.at}</p>}
              {a.bullets?.map((b) => (
                <p key={b.text} className="flex gap-2 pl-2 text-text-regular leading-5 text-text-title">
                  <span>&bull;</span>{b.text}
                  <span className="text-text-body">&bull;</span>
                  <span className="text-text-body">{b.at}</span>
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
