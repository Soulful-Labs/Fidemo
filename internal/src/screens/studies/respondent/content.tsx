import { Fragment } from 'react'
import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { CalendarIcon, ClockIcon, CopyIcon, DownloadIcon, ExternalIcon, EyeIcon, ListIcon, PinIcon, PlayIcon, StarIcon, VerifiedIcon, VideoUserIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { PIN, SESSION_ADDRESS } from '../../../mock/results'
import type { ActivityItem, Answer } from '../../../mock/results'

const QTag = ({ children }: { children: string }) => <span className="flex h-7 shrink-0 items-center rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-title">{children}</span>

function AnswerBody({ a }: { a: Answer }) {
  if ('text' in a) return <p>{a.text}</p>
  if ('bullets' in a) return <ul className="list-disc pl-[17px]">{a.bullets.map((b) => <li key={b} className="pl-0.5">{b}</li>)}</ul>
  if ('ordered' in a) return <ol className="list-decimal pl-[21px]">{a.ordered.map((b) => <li key={b}>{b}</li>)}</ol>
  if ('file' in a) return (
    <div className="mt-1 flex h-[60px] w-[343px] items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 p-2">
      <span className="h-11 w-[66px] rounded-xs bg-bg-2" />
      <span className="flex-1"><span className="block text-text-title">{a.file[0]}</span><span className="block pt-0.5 text-text-subtitle">{a.file[1]}</span></span>
      <button type="button" aria-label="View file" className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke"><EyeIcon className="h-5 w-5" /></button>
    </div>
  )
  return (
    <div className="mt-1 rounded-md border-1 border-stroke-1 bg-bg-0 pb-3">
      <div className="grid grid-cols-[92px_repeat(5,1fr)] bg-bg-1 py-2 text-center">{['', ...a.matrix.cols].map((c, i) => <span key={i}>{c}</span>)}</div>
      {a.matrix.rows.map(([label, pick], r) => (
        <div key={r} className="grid grid-cols-[92px_repeat(5,1fr)] items-center gap-1 px-1 pt-2">
          <span className="whitespace-pre pl-2">{label}</span>
          {a.matrix.cols.map((_, c) => (
            <span key={c} className={cn('flex h-[38px] items-center justify-center rounded-sm', c === pick ? 'bg-yellow-200' : 'bg-bg-2')}>
              <span className={cn('h-4 w-4 rounded-full', c === pick ? 'border-4 border-brand-primary bg-brand-primary' : 'border-1 border-text-subtitle')} />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Answers as a respondent gave them (1952:78522): the question's number in a
 * 28px pill beside the question; "Ans." and the answer under it; a stroke-1
 * rule with 12 either side between questions. Read only.
 */
export function Answers({ answers }: { answers: Answer[] }) {
  return (
    <div className="flex flex-col gap-3 text-text-regular leading-5 text-text-title">
      {answers.map((a, i) => (
        <Fragment key={i}>
          {i > 0 && <hr className="border-0 border-t-1 border-stroke-1" />}
          <div>
            <p className="flex items-center gap-2"><QTag>{a.q}</QTag><span className="text-text-medium">{a.prompt}</span></p>
            <div className="flex gap-2 pt-0.5"><span className="w-[39px] shrink-0 pl-1.5 text-text-subtitle">Ans.</span><div className="min-w-0 flex-1"><AnswerBody a={a} /></div></div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/** "Study activity": each step with a green tick, its time under it, and for a completed session the two confirmations as sub-points. */
export function ActivityList({ items, inline }: { items: ActivityItem[]; inline?: boolean }) {
  return (
    <ul className={cn('flex flex-col text-text-regular leading-5 text-text-title', inline ? 'gap-3' : 'gap-2')}>
      {items.map((it) => (
        <li key={it.text} className="flex gap-2">
          <VerifiedIcon className="mt-0.5 h-4 w-4 shrink-0 text-state-success" />
          <div>
            <p className={cn(inline && 'flex gap-2')}>
              <span className={cn(it.strong && 'text-text-medium')}>{it.text}{it.bold && <strong className="font-semibold">{it.bold}</strong>}</span>
              {inline && it.when && <span className="text-text-body">•&nbsp; {it.when}</span>}
            </p>
            {!inline && it.when && <p className="text-text-body">{it.when}</p>}
            {it.sub && <ul className="list-disc pl-[22px] text-text-subtitle">{it.sub.map(([what, when]) => <li key={what}>{what} <span className="text-text-body">&nbsp;•&nbsp; {when}</span></li>)}</ul>}
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Verification PIN: the session code in a 48px box with a copy button. `wide` runs the full width with the code on the right. */
export function PinCard({ text, wide }: { text: string; wide?: boolean }) {
  const code = (
    <button type="button" aria-label="Copy PIN" onClick={() => { void navigator.clipboard?.writeText(PIN) }}
      className="flex h-12 w-[198px] shrink-0 items-center justify-between rounded-md border-1 border-stroke-1 bg-bg-0 px-4 text-title-m tracking-[0.04em] text-text-title">
      {PIN}<CopyIcon className="h-6 w-6" />
    </button>
  )
  return (
    <section className={cn('rounded-lg bg-bg-1 p-4', wide && 'flex items-center justify-between gap-4')}>
      <div>
        <h3 className="text-body-medium leading-[22px] text-text-title">Verification PIN</h3>
        <p className="pt-1 text-text-regular leading-5 text-text-title">{text}</p>
      </div>
      {wide ? code : <div className="pt-3">{code}</div>}
    </section>
  )
}

const Line = ({ Icon, muted, children }: { Icon: typeof CalendarIcon; muted?: boolean; children: string }) => (
  <p className={cn('flex items-center gap-2 text-text-regular leading-5', muted ? 'text-text-subtitle' : 'text-text-title')}><Icon className={cn('h-5 w-5 shrink-0', muted ? 'text-text-subtitle' : 'text-brand-primary')} />{children}</p>
)

/**
 * The yellow-30 card heading a session: when (and where), and what can be done
 * with it. "After Started state" (1961:184899) draws two more forms of the
 * in-person card: running, with Finish and a timer on the right, and
 * finished, greyed with a "Completed" tag. No frame shows what starts it.
 */
export function SessionCard({ title, date, time, address, aside, phase, children }: {
  title: string; date: string; time: string; address?: boolean; aside?: ReactNode; phase?: 'running' | 'finished'; children?: ReactNode
}) {
  const muted = phase === 'finished'
  return (
    <section className="relative rounded-lg border-1 border-yellow-50 bg-yellow-30 p-4">
      <div className="flex items-center justify-between"><h3 className="text-body-medium leading-[22px] text-text-title">{title}</h3>{aside}</div>
      {phase === 'running' && (
        <div className="absolute right-4 top-4 flex flex-col items-end gap-5">
          <Button className="w-[113px]">Finish</Button>
          <span className="flex h-12 items-center gap-1 rounded-md border-1 border-stroke-1 bg-bg-0 px-4 text-body-medium text-text-title"><ClockIcon className="h-5 w-5" />0:25:16</span>
        </div>
      )}
      {muted && <span className="absolute right-4 top-4 flex h-12 items-center rounded-md bg-cta-secondary px-5 text-body-regular text-cta-secondaryText">Completed</span>}
      <div className="flex flex-col gap-3 pt-3">
        <Line Icon={CalendarIcon} muted={muted}>{date}</Line>
        <Line Icon={ClockIcon} muted={muted}>{time}</Line>
        {address && <Line Icon={PinIcon} muted={muted}>{SESSION_ADDRESS}</Line>}
      </div>
      {children}
    </section>
  )
}

export const JoinNow = () => <Button fullWidth className="mt-3" leftIcon={<VideoUserIcon className="h-5 w-5" />}>Join Now</Button>

/** "Video Result": the recording's tile, its length and date, and links to the recording and the transcript. */
export function VideoResult({ title, who }: { title: string; who: string }) {
  return (
    <section className="rounded-lg border-1 border-yellow-50 bg-yellow-30 p-4">
      <h3 className="text-body-medium leading-[22px] text-text-title">Video Result</h3>
      <div className="flex gap-4 pt-2">
        <div className="flex h-[104px] w-[140px] flex-col items-center justify-center rounded-md border-1 border-stroke-1 bg-bg-0">
          <PlayIcon className="h-7 w-7 text-brand-primary" />
          <span className="pt-2 text-text-medium text-text-title">{who}</span><span className="text-label text-text-subtitle">You</span>
        </div>
        <div>
          <p className="pt-1 text-body-regular leading-[22px] text-text-title">{title}</p>
          <p className="flex items-center gap-1 pt-1.5 text-text-regular leading-5 text-text-subtitle"><ClockIcon className="h-4 w-4 text-state-success" />42:16<CalendarIcon className="ml-3 h-4 w-4 text-state-success" />Aug 12, 2026, 10:00 AM</p>
          <div className="flex gap-4 pt-3">
            <Button variant="secondary" size="md" className="px-3" rightIcon={<ExternalIcon className="h-4 w-4" />}>View Video Recording</Button>
            <Button variant="tertiary" size="md" className="px-3" rightIcon={<ExternalIcon className="h-4 w-4" />}>Transcript</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Interview notes: a bg-2 head ("Notes" or "Add Notes", "Auto-saved", download), an optional formatting row, and the notes as written. */
export function Notes({ editor, download = true, tall }: { editor?: boolean; download?: boolean; tall: string }) {
  return (
    <section className={cn('overflow-hidden rounded-lg border-1 border-stroke-1', tall)}>
      <header className="flex h-[52px] items-center justify-between bg-bg-2 px-4">
        <p className="text-body-medium text-text-title">{editor ? 'Add Notes' : 'Notes'} <span className="text-text-regular text-text-subtitle">&nbsp;•&nbsp; Auto-saved</span></p>
        {download && <button type="button" aria-label="Download notes" className="flex h-7 w-7 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke bg-bg-0"><DownloadIcon className="h-4 w-4" /></button>}
      </header>
      {editor && (
        <div className="flex h-11 items-center gap-6 border-b-1 border-stroke-1 px-4 text-body-medium text-text-title">
          <span>B</span><span className="italic">I</span><span className="underline">U</span><span className="line-through">S</span>
          <span>H<sub>1</sub></span><span>H<sub>2</sub></span><span>H<sub>3</sub></span><span>H<sub>4</sub></span><ListIcon className="h-5 w-5" /><span className="h-4 w-4 rounded-full border-1.5 border-text-title" />
        </div>
      )}
      <div className="p-4 text-text-regular leading-5 text-text-title">
        <p className="text-body-medium leading-[22px]">Interview Notes</p>
        <p className="pt-1.5">This is how to be written notes</p>
        <ul className="list-disc pl-[22px] pt-1.5"><li>Point 1</li></ul>
      </div>
    </section>
  )
}

/** The green banner asking for a rating, on a finished respondent's Activity tab. */
export function RateBanner({ title, action, onRate }: { title: string; action: string; onRate: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-bgAlt-2 px-4 py-3.5">
      <div>
        <p className="flex items-center gap-1 text-body-medium leading-[22px] text-text-title"><StarIcon className="h-5 w-5 text-brand-secondary" />{title}</p>
        <p className="pt-1 text-text-regular leading-5 text-text-subtitle">Rating your experience helps you and other clients find better matching respondents.</p>
      </div>
      <Button size="md" className="h-11 px-4 text-body-medium" onClick={onRate}>{action}</Button>
    </div>
  )
}
