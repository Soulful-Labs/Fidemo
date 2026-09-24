import Tag from '../../components/ui/Tag'
import Button from '../../components/ui/Button'
import { Calendar, ChevronDown, ChevronRight, Clock, Close, MoneyMark, Star, SurveyIcon } from '../../components/ui/icons'

const FACTS: { label: string; value: string; extra?: string; Icon: typeof Clock; tint: string; tone?: string }[] = [
  { label: 'Reward', value: '$150', Icon: MoneyMark, tint: 'bg-yellow-30 text-brand-primary', tone: 'text-brand-secondary' },
  { label: 'Duration', value: '45 min', Icon: Clock, tint: 'bg-yellow-30 text-brand-primary' },
  { label: 'Rating', value: '4.5', extra: '(124)', Icon: Star, tint: 'bg-yellow-30 text-brand-primary' },
  { label: 'Ends', value: 'Sep 30, 2026', Icon: Calendar, tint: 'bg-yellow-30 text-brand-primary' },
]

/**
 * The right-hand column of the Screener step (1622:81771): the study as a
 * participant sees it. Static, seeded off the frame.
 */
export default function ScreenerPreview() {
  return (
    <aside className="sticky top-[88px] w-[488px] shrink-0 rounded-lg bg-bg-1 p-3">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <button type="button" aria-label="Refresh preview"
          className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg-0 text-text-subtitle">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20.5 3.5V9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-text-regular text-text-subtitle">This is how participants see your study</span>
        <button type="button" aria-label="Close preview"
          className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg-0 text-text-subtitle">
          <Close className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg bg-bg-0">
        <p className="border-b-1 border-stroke-1 px-4 py-4 text-title-s text-text-title">Human Layer</p>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <Tag tone="type" icon={<SurveyIcon className="h-4 w-4" />}>Survey</Tag>
            <span className="flex items-center gap-2">
              <Tag tone="neutral">Lifestyle</Tag>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-1 border-brand-secondary text-text-regular text-brand-secondary">96</span>
            </span>
          </div>

          <span className="h-[196px] w-full overflow-hidden rounded-md bg-bg-2">
            <img src="/img/goals.jpg" alt="" className="h-full w-full object-cover" />
          </span>

          <p className="text-title-s text-text-title">About goal-tracking methods</p>
          <p className="-mt-1 text-text-regular text-text-subtitle">
            Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.
          </p>
          <button type="button" className="-mt-1 flex items-center gap-1 self-start text-text-regular text-text-subtitle">
            View more <ChevronDown className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            {FACTS.map((f) => (
              <span key={f.label} className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${f.tint}`}>
                  <f.Icon className="h-5 w-5" />
                </span>
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

          <Button className="h-12 w-full text-body-large">Apply</Button>
        </div>
      </div>
    </aside>
  )
}
