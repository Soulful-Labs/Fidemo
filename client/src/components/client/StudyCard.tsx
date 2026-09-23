import type { ReactNode } from 'react'
import Progress from '../ui/Progress'
import Tag from '../ui/Tag'
import StudyTypeTag from './StudyTypeTag'
import { Calendar, MoreVertical } from '../ui/icons'
import { cn } from '../../lib/cn'
import { STUDY_STATUS } from '../../lib/studyTypes'
import type { StudyStatus, StudyType } from '../../lib/studyTypes'

export interface Study {
  id: string
  title: string
  type: StudyType
  status: StudyStatus
  image?: string
  dates: string
  daysLeft: string
  completedPct: number
  /**
   * The three bar segments as the frame draws them: completed, screening and
   * remaining, in percent. The frame's bar is drawn rather than computed from
   * the counts, so these come straight off the frame.
   */
  segments: [number, number, number]
  required: number
  /** Drawn under the bar on a diary study: completed, screening, remaining. */
  breakdown?: { completed: number; screening: number; remaining: number }
}

/**
 * The ongoing-study card on the Dashboard (826:85021). One card for every
 * study type; only the type tag and the thumbnail change.
 */
export default function StudyCard({ study, onOpen, onMenu, menu, className }: { study: Study; onOpen?: () => void; onMenu?: () => void; menu?: ReactNode; className?: string }) {
  const status = STUDY_STATUS[study.status]
  return (
    <article className={cn('relative flex flex-col gap-3 rounded-lg bg-bgAlt-1 px-4 pb-5 pt-4', className)}>
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
        <span className="flex min-w-0 flex-col gap-2">
          <span className="text-body-medium text-text-title">{study.title}</span>
          <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
            <Calendar className="h-4 w-4" />
            {study.dates}
            <span className="text-text-body">•</span>
            {study.daysLeft}
          </span>
        </span>
      </button>

      <div className="flex items-center justify-between text-text-regular">
        <span className="text-text-title"><span className="text-body-medium">{study.completedPct}%</span> <span className="text-text-subtitle">completed</span></span>
        <span className="text-text-title"><span className="text-body-medium">{study.required}</span> <span className="text-text-subtitle">required</span></span>
      </div>
      <Progress max={100} segments={[
        { value: study.segments[0], tone: 'green' },
        { value: study.segments[1], tone: 'yellow' },
        { value: study.segments[2], tone: 'grey' },
      ]} />
      {study.breakdown && (
        <div className="absolute -bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-sm bg-bg px-4 py-2.5 text-text-regular text-text-subtitle shadow-[0_2px_8px_rgba(32,30,25,0.08)]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-secondary" />Completed: <span className="text-text-title">{study.breakdown.completed}</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cta-primary" />Screening: <span className="text-text-title">{study.breakdown.screening}</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bg-4" />Remaining: <span className="text-text-title">{study.breakdown.remaining}</span></span>
        </div>
      )}
    </article>
  )
}
