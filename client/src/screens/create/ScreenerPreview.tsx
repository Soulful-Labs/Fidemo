import { useState } from 'react'
import type { ReactNode } from 'react'
import Tag from '../../components/ui/Tag'
import Button from '../../components/ui/Button'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Close, DiaryBookIcon, InPersonIcon, MoneyMark, Star, SurveyIcon, VideoIcon } from '../../components/ui/icons'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'
import { clientRating } from '@shared/derive'
import { MAX_RUN_DAYS } from '@shared/studyForm'
import { useDraft } from '../../mock/createStore'
import { useClient, usePlatform } from '../../platform'

const REFRESH = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20.5 3.5V9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** The Preview button that opens the panel, top right of the About and Screener steps. */
export function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="tertiary" size="row" onClick={onClick} aria-expanded={false} leftIcon={
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="m10 8.5 6 3.5-6 3.5v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>}>Preview</Button>
  )
}

/**
 * "This is how participants see your study" (2.1.0 About and 2.1.2 Screener,
 * 15 Oct 2026): collapsible, and closed until the client opens it. It opens
 * with Tier 1 motion (index.css `.preview-in`: 150ms ease-out, no bounce).
 * Refresh starts the preview over; the cross closes it.
 */
export function PreviewPanel({ onClose, onRefresh, children }: { onClose: () => void; onRefresh: () => void; children: ReactNode }) {
  return (
    <aside aria-label="Participant preview" className="preview-in sticky top-[88px] w-[488px] shrink-0 overflow-hidden rounded-xl border-1 border-stroke-input bg-bg-1">
      <div className="flex items-center justify-between gap-3 border-b-1 border-stroke-input bg-bg-0 px-3 py-3">
        <button type="button" aria-label="Refresh preview" onClick={onRefresh}
          className="flex h-9 w-9 items-center justify-center rounded-md border-1 border-stroke-input bg-bg-0 text-text-title hover:bg-bg-1">{REFRESH}</button>
        <span className="text-body-regular text-text-subtitle">This is how participants see your study</span>
        <button type="button" aria-label="Close preview" onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md border-1 border-stroke-input bg-bg-0 text-text-title hover:bg-bg-1">
          <Close className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-lg bg-bg-0">
          <p className="border-b-1 border-stroke-1 px-4 py-4 text-title-s text-text-title">Human Layer</p>
          {children}
        </div>
      </div>
    </aside>
  )
}

const TYPE_TAG = { survey: ['Survey', SurveyIcon], video_call: ['Video Call', VideoIcon], in_person: ['In-Person', InPersonIcon], diary: ['Diary Study', DiaryBookIcon] } as const

/**
 * About's preview: the study card a participant opens, from what has been
 * entered so far. Reward is "To Be Set" until the Pricing step; the
 * participant's match score is left out, since nothing about a participant is
 * known while the study is being built.
 */
export function AboutPreview() {
  const { draft } = useDraft()
  const toast = useToast()
  const world = usePlatform()
  const client = useClient()
  const [more, setMore] = useState(false)
  const rating = clientRating(world, client?.id ?? '')
  const [label, Icon] = TYPE_TAG[draft.type]
  const m = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(draft.endDate.trim())
  const ends = m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date(Date.now() + MAX_RUN_DAYS * 86_400_000)
  const industry = draft.industries.split(',').map((x) => x.trim()).filter(Boolean)[0]
  const facts: { label: string; value: string; extra?: string; Icon: typeof Clock; tone?: string }[] = [
    { label: 'Reward', value: 'To Be Set', Icon: MoneyMark, tone: 'text-brand-secondary' },
    { label: 'Time to complete', value: `About ${draft.duration} min`, Icon: Clock },
    { label: 'Rating', value: rating.reviewCount ? rating.rating.toFixed(1) : '—', extra: rating.reviewCount ? `(${rating.reviewCount})` : undefined, Icon: Star },
    { label: 'Ends', value: ends.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), Icon: Calendar },
  ]
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <Tag tone="type" icon={<Icon className="h-4 w-4" />}>{label}</Tag>
        <Tag tone="neutral">Industry{industry ? `: ${industry}` : ''}{!industry && <span className="pl-1 italic text-text-body">(To be set)</span>}</Tag>
      </div>
      <span className="h-[196px] w-full overflow-hidden rounded-md bg-bg-2">
        {draft.image && <img src={draft.image} alt="" className="h-full w-full object-cover" />}
      </span>
      <p className="text-title-s text-text-title">{draft.title.trim() || <span className="text-text-body">Title of your study</span>}</p>
      <p className={cn('-mt-1 text-text-regular text-text-subtitle', !more && 'line-clamp-2')}>{draft.description.trim() || 'Your study description shows here.'}</p>
      <button type="button" onClick={() => setMore((x) => !x)}
        className="-mt-1 flex items-center gap-1 self-start text-text-regular text-text-subtitle hover:text-text-title">
        {more ? 'View less' : 'View more'} <ChevronDown className={cn('h-4 w-4', more && 'rotate-180')} />
      </button>
      <div className="grid grid-cols-2 gap-3">
        {facts.map((f) => (
          <span key={f.label} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-yellow-30 text-brand-primary"><f.Icon className="h-5 w-5" /></span>
            <span className="flex flex-col">
              <span className="text-text-regular text-text-subtitle">{f.label}</span>
              <span className={`flex items-center gap-1 text-body-medium ${f.tone ?? 'text-text-title'}`}>
                {f.value}
                {f.extra && <span className="text-text-regular text-text-subtitle">{f.extra}</span>}
                {f.extra && <ChevronRight className="h-4 w-4 text-text-subtitle" />}
              </span>
            </span>
          </span>
        ))}
      </div>
      <Button size="none" className="h-12 w-full text-body-large" onClick={() => toast('This is a preview: participants apply from here')}>Apply</Button>
    </div>
  )
}

/**
 * Screener's preview: the questions written so far, one at a time, as the
 * participant answers them, with the progress segments across the top.
 * Answers given here are not kept: it is a preview.
 */
export function ScreenerQuestionsPreview({ at, setAt }: { at: number; setAt: (n: number) => void }) {
  const { draft } = useDraft()
  const [picked, setPicked] = useState<Record<string, string[]>>({})
  const qs = draft.questions.filter((q) => q.text.trim())
  const i = Math.min(at, Math.max(0, qs.length - 1))
  const q = qs[i]
  const toggle = (id: string, v: string, many: boolean) => setPicked((p) => ({ ...p, [id]: many ? (p[id]?.includes(v) ? p[id]!.filter((x) => x !== v) : [...(p[id] ?? []), v]) : [v] }))
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 pt-3">
        <span className="flex items-center gap-3 text-title-s text-text-title"><Close className="h-5 w-5 text-text-subtitle" />Screener</span>
        <span className="flex gap-1.5" aria-hidden="true">
          {(qs.length ? qs : [null]).map((_, n) => <span key={n} className={cn('h-1 flex-1 rounded-full', n <= i && qs.length ? 'bg-brand-secondary' : 'bg-bg-2')} />)}
        </span>
      </div>
      <div className="flex min-h-[260px] flex-col gap-3 border-t-1 border-stroke-1 px-4 py-5">
        {!q ? (
          <p className="text-text-regular text-text-subtitle">Your screening questions show here, one at a time, as you write them.</p>
        ) : (
          <>
            <p className="text-body-medium text-text-title">{q.text}</p>
            {(q.kind === 'Single-select' || q.kind === 'Multi-select') ? (
              <>
                {q.kind === 'Multi-select' && <p className="text-text-regular text-text-subtitle">Select as many applies</p>}
                {q.options.filter((o) => o.text.trim()).map((o) => {
                  const on = picked[q.id]?.includes(o.text) ?? false
                  return (
                    <button key={o.id} type="button" onClick={() => toggle(q.id, o.text, q.kind === 'Multi-select')}
                      className="flex h-12 items-center gap-3 rounded-md bg-bg-1 px-4 text-left text-body-regular text-text-title">
                      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center border-1.5', q.kind === 'Multi-select' ? 'rounded-[5px]' : 'rounded-full',
                        on ? 'border-cta-primary bg-cta-primary' : 'border-neutral-700')} />
                      {o.text}
                    </button>
                  )
                })}
              </>
            ) : (
              <span className="flex h-12 items-center rounded-md border-1 border-stroke-input px-4 text-body-regular text-text-body">
                {q.kind === 'Number input' ? 'Enter a number' : q.kind === 'File Upload' ? 'Upload a file' : 'Type your answer'}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex gap-3 border-t-1 border-stroke-1 p-4">
        <button type="button" aria-label="Previous question" disabled={i === 0} onClick={() => setAt(Math.max(0, i - 1))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-1 border-stroke-input bg-bg-0 text-text-title disabled:text-text-disabled">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Button size="none" className="h-12 flex-1 text-body-medium" disabled={!q || i >= qs.length - 1} onClick={() => setAt(i + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
      </div>
    </div>
  )
}

export default ScreenerQuestionsPreview
