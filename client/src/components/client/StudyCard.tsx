import type { ReactNode } from 'react'
import Tag from '../ui/Tag'
import StudyTypeTag from './StudyTypeTag'
import { Calendar, MoreVertical } from '../ui/icons'
import { cn } from '../../lib/cn'
import type { ClientStudy as Study } from '../../platform'
import { counts, progressPct, segments, statusTag } from '@shared/derive'

/**
 * The bar and the figures used to be drawn off the frame and sat beside
 * counts that contradicted them. Both now come from the same participant
 * list, so the bar, the percentage and the breakdown always agree.
 */

/**
 * The ongoing-study card on the Dashboard (826:85021). One card for every
 * study type; only the type tag and the thumbnail change.
 */
export default function StudyCard({ study, onOpen, onMenu, menu, className }: { study: Study; onOpen?: () => void; onMenu?: () => void; menu?: ReactNode; className?: string }) {
  const status = statusTag(study)
  const c = counts(study)
  const bar = segments(study)
  const remaining = Math.max(0, study.required - c.completed - c.recruited - c.scheduled - c.qualified - c.applied)
  return (
    <article className={cn('relative flex flex-col rounded-lg bg-bgAlt-1 p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <StudyTypeTag type={study.type} />
        <div className="flex items-center gap-2">
          <Tag tone={status.tone}>{status.label}</Tag>
          <span className="relative flex">
            <button type="button" aria-label="Study options" onClick={onMenu} className="text-text-title hover:text-text-subtitle">
              <MoreVertical className="h-5 w-5" />
            </button>
            {menu}
          </span>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-3 flex items-start gap-3 text-left">
        <span className="h-[76px] w-[101px] shrink-0 overflow-hidden rounded-sm bg-bg-2">
          {study.image && <img src={study.image} alt="" className="h-full w-full object-cover" />}
        </span>
        {/* The title is one or two lines depending on its length, so it is
            held at two. Without it the date row and everything under it rides
            up and down from card to card. */}
        <span className="flex min-w-0 flex-1 flex-col justify-between gap-[9px] pt-0.5">
          <span className="line-clamp-2 min-h-[44px] text-body-medium leading-[22px] text-text-title">{study.title}</span>
          <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
            <Calendar className="h-[18px] w-[18px] text-text-title" />
            {study.dates ?? ''}
            <span className="text-text-body">•</span>
            {study.daysRemaining} days left
          </span>
        </span>
      </button>

      <div className="mt-[17px] flex items-center justify-between text-text-regular">
        <span className="text-text-title"><span className="text-body-medium">{progressPct(study)}%</span> <span className="text-text-subtitle">completed</span></span>
        <span className="text-text-title"><span className="text-body-medium">{study.required}</span> <span className="text-text-subtitle">required</span></span>
      </div>
      {/* The bar sits in its own ringed track (13 Oct 2026 export), and the three figures under it are the counts it is drawn from. */}
      <div className="mt-1.5 flex h-[15px] items-center gap-1 rounded-full border-1 border-stroke-input bg-bg-0 px-1">
        {bar[0] > 0 && <span className="h-1.5 rounded-full bg-brand-secondary" style={{ flexGrow: bar[0], flexBasis: 0 }} />}
        {bar[1] > 0 && <span className="h-1.5 rounded-full bg-cta-primary" style={{ flexGrow: bar[1], flexBasis: 0 }} />}
        {bar[2] > 0 && <span className="h-1.5 rounded-full bg-bg-4" style={{ flexGrow: bar[2], flexBasis: 0 }} />}
      </div>
      <dl className="mt-3 flex">
        {([['Completed', c.completed, 'text-brand-secondary'], ['Screening', c.applied + c.qualified + c.recruited + c.scheduled, 'text-brand-primary'], ['Remaining', remaining, 'text-text-body']] as const).map(([label, n, tone]) => (
          <div key={label} className="flex w-[120px] flex-col-reverse">
            <dt className="text-text-regular text-text-body">{label}</dt>
            <dd className={cn('text-body-medium', tone)}>{n}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
