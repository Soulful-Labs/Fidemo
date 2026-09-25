import type { ReactNode } from 'react'
import Progress from '../ui/Progress'
import Tag from '../ui/Tag'
import StudyTypeTag from './StudyTypeTag'
import { Calendar, MoreVertical } from '../ui/icons'
import { cn } from '../../lib/cn'
import type { Study } from '../../mock/db'
import { counts, progressPct, segments, statusTag } from '../../lib/derive'

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
    <article className={cn('group relative flex flex-col gap-3 rounded-lg bg-bgAlt-1 px-4 pb-5 pt-4', className)}>
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

      <button type="button" onClick={onOpen} className="flex items-start gap-3 text-left">
        <span className="h-[75px] w-[100px] shrink-0 overflow-hidden rounded-sm bg-bg-2">
          {study.image && <img src={study.image} alt="" className="h-full w-full object-cover" />}
        </span>
        {/* The title is one or two lines depending on its length, so it is
            held at two. Without it the date row and everything under it rides
            up and down from card to card. */}
        <span className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <span className="line-clamp-2 min-h-[44px] text-body-medium text-text-title">{study.title}</span>
          <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
            <Calendar className="h-4 w-4" />
            {study.dates ?? ''}
            <span className="text-text-body">•</span>
            {study.daysRemaining} days left
          </span>
        </span>
      </button>

      <div className="flex items-center justify-between text-text-regular">
        <span className="text-text-title"><span className="text-body-medium">{progressPct(study)}%</span> <span className="text-text-subtitle">completed</span></span>
        <span className="text-text-title"><span className="text-body-medium">{study.required}</span> <span className="text-text-subtitle">required</span></span>
      </div>
      <Progress max={100} segments={[
        { value: bar[0], tone: 'green' },
        { value: bar[1], tone: 'yellow' },
        { value: bar[2], tone: 'grey' },
      ]} />
      {/* The frame draws this row open on one card of three to show what it
          is; it is the bar's tooltip, so it is on hover for every card and
          the three figures are the same counts the bar is drawn from. */}
      <div className="pointer-events-none absolute -bottom-8 left-2 right-2 flex items-center justify-between gap-3 rounded-sm bg-bg px-4 py-2.5 text-text-regular text-text-subtitle opacity-0 shadow-[0_2px_8px_rgba(32,30,25,0.08)] transition-opacity group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-secondary" />Completed: <span className="text-text-title">{c.completed}</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cta-primary" />Screening: <span className="text-text-title">{c.applied + c.qualified + c.recruited + c.scheduled}</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bg-4" />Remaining: <span className="text-text-title">{remaining}</span></span>
      </div>
    </article>
  )
}
