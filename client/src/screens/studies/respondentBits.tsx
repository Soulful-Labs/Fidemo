import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import { Calendar, CheckCircle, Clock, Copy, Download, Eye, MapPin, VideoIcon } from '../../components/ui/icons'
import { fileName, save, text as textFile } from '@shared/files'
import { cn } from '../../lib/cn'
import { copyText } from '../../lib/copy'
import type { Answer, QA } from '../../mock/respondent'
import { NOTES, SESSION, VERIFICATION_PIN } from '../../mock/respondent'
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
    <div className={cn('mx-4 flex flex-col gap-[5px] pb-[17px]', first ? 'pt-[18px]' : 'border-t-1 border-stroke-1 pt-[17px]')}>
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
export function PinCard({ variant, pin, name, onShared, text }: {
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
  /** A group session's own wording: one PIN for everyone in it. */
  text?: string
}) {
  const wide = variant === 'activity'
  const toast = useToast()
  /** The code on this participation, from the platform. There is none until a session is booked. */
  const code = pin ?? '——'
  const first = name?.split(' ')[0]
  // Without a person to name, the frame's "John M." is not printed (23 Oct 2026): the line says "the participant".
  const body = text ?? (wide ? VERIFICATION_PIN.activityBody : VERIFICATION_PIN.sessionBody)
    .replace('John M.', first ? `${first}.` : 'the participant')

  /** The frame draws a copy glyph, so it copies, and records that it was used. */
  const share = async () => {
    const ok = await copyText(code)
    onShared?.(code)
    toast(ok ? 'PIN copied, share it to verify their session' : 'Could not reach the clipboard')
  }

  return (
    <div className={cn('rounded-lg bg-bg-1 p-4', wide ? 'flex items-center justify-between gap-4' : 'flex flex-col gap-3')}>
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-title">{VERIFICATION_PIN.title}</p>
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

/** "0:25:16": how long the session has been running. */
function useElapsed(since?: Date, on = true): string {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!on) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [on])
  const secs = Math.max(0, Math.floor((now - (since?.getTime() ?? now)) / 1000))
  return `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}

/** The booked session, in the three states the frames draw it in. */
export function SessionCard({ state, session, onStart, onFinish, since, cta, onCta, aside }: {
  state: 'booked' | 'running' | 'done'
  onStart?: () => void
  onFinish?: () => void
  /** When the session began, for the running clock (it was the frame's fixed "0:25:16"). */
  since?: Date
  /** The booked card's button: Start Interview in person, Join Now on a video call (1627:100096). */
  cta?: string
  onCta?: () => void
  /** Beside the title, a group session's seats (1627:105750). */
  aside?: React.ReactNode
  /** The booking: who, when and where. */
  session?: { title: string; date: string; time: string; address?: string }
}) {
  const toast = useToast()
  const elapsed = useElapsed(since, state === 'running')
  /** Once it is over the frame greys the slot out and leaves a Completed chip. */
  const meta = state === 'done' ? 'text-text-subtitle' : 'text-text-title'
  const glyph = state === 'done' ? 'text-text-body' : 'text-brand-primary'
  return (
    <div className={cn('flex justify-between gap-4 rounded-lg bg-yellow-30 p-4', state === 'booked' && 'flex-col')}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-body-medium text-text-title">{session?.title ?? ''}</p>
          {aside}
        </div>
        <p className={cn('flex h-5 items-center gap-2 text-text-regular', meta)}>
          <Calendar className={cn('h-4 w-4', glyph)} />{session?.date ?? ''}
        </p>
        <p className={cn('flex h-5 items-center gap-2 text-text-regular', meta)}>
          <Clock className={cn('h-4 w-4', glyph)} />{session?.time ?? ''}
        </p>
        {/* The address shows in every state (1627:102694 draws it on the booked card too). */}
        {session?.address && (
          <p className={cn('flex items-start gap-2 text-text-regular', meta)}>
            <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', glyph)} />{session.address}
          </p>
        )}
        {state === 'booked' && (
          <Button size="none" className="mt-2 h-12 w-full" leftIcon={onCta ? <VideoIcon className="h-4 w-4" /> : undefined}
            onClick={() => { if (onCta) onCta(); else { onStart?.(); toast('Interview started') } }}>{cta ?? SESSION.cta}</Button>
        )}
      </div>
      {state === 'running' && (
        <div className="flex flex-col items-end gap-3">
          <Button size="none" className="h-12 w-[110px]" onClick={() => { onFinish?.(); toast('Interview finished') }}>Finish</Button>
          <span className="flex h-12 items-center gap-2 rounded-sm border-1 border-stroke-input bg-bg-0 px-4 text-title-s tabular-nums text-text-title">
            <Clock className="h-5 w-5 text-text-subtitle" />{elapsed}
          </span>
        </div>
      )}
      {state === 'done' && (
        <span className="flex h-12 items-center rounded-sm bg-cta-secondary px-5 text-body-medium text-text-title">Completed</span>
      )}
    </div>
  )
}

/**
 * Video Result (1627:100279, 1627:106074): the recording and transcript of a video session. The platform holds
 * no recordings until a video provider is connected, so both buttons say so rather than opening nothing.
 */
export function VideoResult({ title, who, when, length }: { title: string; who: string; when: string; length: string }) {
  const toast = useToast()
  const notYet = () => toast('The recording and transcript appear here once the video provider is connected')
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-yellow-30 p-4">
      <p className="text-body-medium text-text-title">Video Result</p>
      <div className="flex gap-4">
        <div className="flex h-[104px] w-[140px] shrink-0 flex-col items-center justify-center rounded-md border-1 border-stroke-1 bg-bg-0">
          <VideoIcon className="h-6 w-6 text-brand-primary" />
          <span className="pt-2 text-text-medium text-text-title">{who}</span>
          <span className="text-label text-text-subtitle">You</span>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-body-regular text-text-title">{title}</p>
          <p className="flex items-center gap-3 text-text-regular text-text-subtitle">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-brand-secondary" />{length}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-brand-secondary" />{when}</span>
          </p>
          <span className="flex gap-3 pt-1">
            <Button variant="secondary" size="none" className="h-[38px] px-3" onClick={notYet}>View Video Recording</Button>
            <Button variant="tertiary" size="none" className="h-[38px] px-3" onClick={notYet}>Transcript</Button>
          </span>
        </div>
      </div>
    </div>
  )
}

/** The formatting row (1627:102694). Each mark wraps the selected words, or starts the line, in plain text. */
const MARKS: { label: string; wrap?: [string, string]; line?: string }[] = [
  { label: 'B', wrap: ['**', '**'] }, { label: 'I', wrap: ['_', '_'] }, { label: 'U', wrap: ['<u>', '</u>'] }, { label: 'S', wrap: ['~~', '~~'] },
  { label: 'H1', line: '# ' }, { label: 'H2', line: '## ' }, { label: 'H3', line: '### ' }, { label: 'H4', line: '#### ' },
  { label: '☰', line: '• ' }, { label: '◯', line: '○ ' },
]

/**
 * The interview notes, as typed (22 Oct 2026). They were the frame's sample text and saved nothing while
 * the card said "Auto-saved"; now they are kept on the booking or the group session (shared/store.ts
 * setSessionNotes), saved as they are typed, and the download gives them as a text file.
 */
export function NotesCard({ className, value, onSave, file }: {
  download?: boolean; className?: string
  value: string; onSave: (text: string) => void
  /** The download's name; no download when there is nothing to name it after. */
  file?: string
}) {
  const toast = useToast()
  const [text, setText] = useState(value)
  const box = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { setText(value) }, [value])
  useEffect(() => {
    if (text === value) return
    const t = window.setTimeout(() => onSave(text), 400)
    return () => window.clearTimeout(t)
  }, [text, value, onSave])
  const mark = (m: (typeof MARKS)[number]) => {
    const el = box.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b } = el
    let next = text
    if (m.wrap) next = text.slice(0, a) + m.wrap[0] + text.slice(a, b) + m.wrap[1] + text.slice(b)
    else { const start = text.lastIndexOf('\n', a - 1) + 1; next = text.slice(0, start) + m.line + text.slice(start) }
    setText(next)
    requestAnimationFrame(() => el.focus())
  }
  return (
    <div className={cn('flex flex-col rounded-lg border-1 border-stroke-input', className)}>
      <div className="flex h-12 items-center justify-between gap-3 rounded-t-lg bg-bg-1 px-4">
        <span className="text-text-large text-text-title">
          {NOTES.title} <span className="text-text-regular text-text-subtitle">&bull; {text === value ? NOTES.saved : 'Saving...'}</span>
        </span>
        {file && (
          <button type="button" aria-label="Download notes" title="Download notes"
            onClick={() => toast(text.trim() ? `Saved ${save(fileName(`${file} notes`, 'txt'), textFile(text))}` : 'There are no notes to download yet')}
            className="flex h-7 w-7 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke bg-bg-0 text-text-title">
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex h-12 items-center gap-6 border-b-1 border-stroke-1 px-4 text-text-subtitle">
        {MARKS.map((m) => (
          <button key={m.label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => mark(m)}
            aria-label={`Format: ${m.label}`} className="text-body-regular hover:text-text-title">{m.label}</button>
        ))}
      </div>
      <textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} aria-label="Interview notes"
        placeholder={NOTES.prompt}
        className="min-h-[180px] flex-1 resize-none bg-transparent px-4 py-4 text-text-regular text-text-title outline-none placeholder:text-text-body" />
    </div>
  )
}

/** Study activity: a checked list, some entries with their own bullets. */
export function ActivityList({ events }: {
  /** What has happened on this participation, oldest first, from the platform. */
  events: { label: string; at?: string; strong?: string; bullets?: { text: string; at: string }[] }[]
}) {
  return (
    <>
      <h2 className="pt-[18px] text-title-s text-text-title">Study activity</h2>
      <ol className="flex flex-col gap-4 pt-[9px]">
        {events.map((a, i) => (
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
