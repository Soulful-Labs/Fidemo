import { clientRating } from '@shared/derive'
import { money, monthDayYear } from '@shared/format'
import { studyTypeOf } from '@shared/studyForm'
import type { FormQuestion, StudyForm } from '@shared/studyForm'
import type { Study } from '@shared/types'
import type { ReactNode } from 'react'
import { useState } from 'react'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import { IconButton } from '../../../components/ui/Button'
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ClockIcon, CloseIcon, CoinIcon, RefreshIcon, StarIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { consoleType, usePlatform } from '../../../platform'

/**
 * "This is how participants see your study" (About and Screener, 2325:214086,
 * 2325:214502): the respondent app's own card, drawn from the form as it is
 * being edited. Refresh starts it again from the top; the cross hides it and
 * Preview on the step brings it back.
 */
export function PreviewPanel({ onClose, children }: { onClose: () => void; children: (key: number) => ReactNode }) {
  const [key, setKey] = useState(0)
  return (
    <aside className="sticky top-[94px] w-[488px] shrink-0 self-start rounded-xl border-1 border-stroke-input bg-bg-1 p-4" aria-label="Participant preview">
      <div className="flex items-center justify-between pb-4">
        <IconButton label="Start the preview again" onClick={() => setKey((k) => k + 1)}><RefreshIcon className="h-5 w-5" /></IconButton>
        <span className="text-body-regular text-text-subtitle">This is how participants see your study</span>
        <IconButton label="Hide the preview" onClick={onClose}><CloseIcon className="h-5 w-5" /></IconButton>
      </div>
      <div className="overflow-hidden rounded-lg border-1 border-stroke-input bg-bg-0">
        <p className="border-b-1 border-stroke-input px-4 py-4 text-title-s text-text-title">HumanLayer</p>
        {children(key)}
      </div>
    </aside>
  )
}

/** One figure of the card: an icon tile, its name and its value. */
function Figure({ icon, name, children }: { icon: ReactNode; name: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-30 text-brand-primary [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      <span className="flex flex-col"><span className="text-text-regular text-text-subtitle">{name}</span>{children}</span>
    </div>
  )
}

/** The study card on About. The reward is the study's incentive, which a live edit cannot change. */
export function StudyPreview({ study, form }: { study: Study; form: StudyForm }) {
  const state = usePlatform()
  const [more, setMore] = useState(false)
  const { rating, reviewCount } = clientRating(state, study.clientId)
  const industry = form.industries.split(',').map((x) => x.trim()).find(Boolean)
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <StudyTypeTag type={consoleType(studyTypeOf(form))} filled />
        <span className="flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-title">
          {industry ?? <>Industry <i className="pl-1 text-text-subtitle">(To be set)</i></>}
        </span>
      </div>
      {(form.image || study.image) && <img src={form.image || study.image} alt="" className="h-[230px] w-full rounded-lg object-cover" />}
      <div className="flex flex-col gap-2">
        <h3 className="text-title-m text-text-title">{form.title || 'Title of your study'}</h3>
        <p className={cn('text-text-regular text-text-subtitle', !more && 'line-clamp-2')}>{form.description || 'What this study is about'}</p>
        <button type="button" onClick={() => setMore((v) => !v)} className="flex items-center gap-1 self-start text-text-regular text-text-body">
          {more ? 'View less' : 'View more'}<ChevronDown className={cn('h-4 w-4 transition-transform duration-150', more && 'rotate-180')} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Figure icon={<CoinIcon />} name="Reward"><span className="text-body-medium text-state-success">{money(study.rates.incentivePer)}</span></Figure>
        <Figure icon={<ClockIcon />} name="Duration"><span className="text-body-medium text-text-title">{form.duration} min</span></Figure>
        <Figure icon={<StarIcon />} name="Rating">
          <span className="text-body-medium text-text-title">{reviewCount ? rating.toFixed(1) : 'New'}{reviewCount > 0 && <span className="pl-1 text-text-regular text-text-subtitle">({reviewCount})</span>}</span>
        </Figure>
        <Figure icon={<CalendarIcon />} name="Ends"><span className="text-body-medium text-text-title">{form.endDate.trim() || monthDayYear(study.endsAt)}</span></Figure>
      </div>
      <span aria-hidden="true" className="flex h-12 items-center justify-center rounded-md bg-cta-primary text-body-medium text-cta-primaryText">Apply</span>
    </div>
  )
}

const PICKS = ['Single-select', 'Multi-select', 'Ranking']
const ANSWER: Record<string, string> = {
  'Single-line input': 'Type your answer', 'Number input': 'Enter a number', 'Multi-line input': 'Type your answer in detail',
  Slider: 'Move the slider', 'File Upload': 'Upload a file', Mattrix: 'Pick one per row',
}

/** The screener as a respondent steps through it, one question a page, from the questions being edited. */
export function ScreenerPreview({ questions }: { questions: FormQuestion[] }) {
  const asked = questions.filter((q) => q.text.trim())
  const [at, setAt] = useState(0)
  const [ticked, setTicked] = useState<string[]>([])
  const q = asked[Math.min(at, asked.length - 1)]
  if (!q) return <p className="p-4 text-text-regular text-text-subtitle">Questions appear here as they are written.</p>
  const multi = q.kind === 'Multi-select' || q.kind === 'Ranking'
  const go = (n: number) => { setAt(Math.max(0, Math.min(asked.length - 1, n))); setTicked([]) }
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2"><CloseIcon aria-hidden="true" className="h-5 w-5 text-text-subtitle" /><span className="text-body-medium text-text-title">Screener</span></div>
      <div className="flex gap-1">{asked.map((x, i) => <span key={x.id} className={cn('h-1 flex-1 rounded-full', i <= at ? 'bg-brand-secondary' : 'bg-stroke-input')} />)}</div>
      <p className="text-body-medium text-text-title">{q.text}</p>
      {PICKS.includes(q.kind) ? (
        <>
          {multi && <span className="text-text-regular text-text-subtitle">Select as many applies</span>}
          {q.options.filter((o) => o.text.trim()).map((o) => {
            const on = ticked.includes(o.id)
            return (
              <button key={o.id} type="button" aria-pressed={on} onClick={() => setTicked(multi ? (on ? ticked.filter((x) => x !== o.id) : [...ticked, o.id]) : [o.id])}
                className={cn('flex h-11 items-center gap-3 rounded-md border-1 px-3 text-left text-text-regular text-text-title', on ? 'border-brand-primary bg-yellow-30' : 'border-stroke-input bg-bg-1')}>
                <span className={cn('h-4 w-4 shrink-0 border-1', multi ? 'rounded-xs' : 'rounded-full', on ? 'border-brand-primary bg-brand-primary' : 'border-text-body')} />{o.text}
              </button>
            )
          })}
        </>
      ) : <p className="rounded-md border-1 border-stroke-input bg-bg-1 px-3 py-3 text-text-regular text-text-body">{ANSWER[q.kind] ?? 'Type your answer'}</p>}
      <div className="flex gap-3">
        <IconButton label="Previous question" disabled={at === 0} onClick={() => go(at - 1)}><ChevronLeft className="h-5 w-5" /></IconButton>
        <button type="button" disabled={at >= asked.length - 1} onClick={() => go(at + 1)}
          className="flex h-[38px] flex-1 items-center justify-center gap-1 rounded-md bg-yellow-100 text-text-medium text-cta-primaryText disabled:opacity-60">Continue<ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
