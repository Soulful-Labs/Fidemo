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
  required: number
  /** Drawn under the bar on a diary study: completed, screening, remaining. */
  breakdown?: { completed: number; screening: number; remaining: number }
}

/**
 * The ongoing-study card on the Dashboard (826:85021). One card for every
 * study type; only the type tag and the thumbnail change.
 */
export default function StudyCard({ study, onOpen, onMenu, className }: { study: Study; onOpen?: () => void; onMenu?: () => void; className?: string }) {
  const status = STUDY_STATUS[study.status]
  return (
    <article className={cn('flex flex-col gap-3 rounded-lg border-1 border-stroke-input bg-bg p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <StudyTypeTag type={study.type} />
        <div className="flex items-center gap-2">
          <Tag tone={status.tone}>{status.label}</Tag>
          <button type="button" aria-label="Study options" onClick={onMenu} className="text-text-subtitle hover:text-text-title">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="flex items-start gap-3 text-left">
        <span className="h-[70px] w-[100px] shrink-0 overflow-hidden rounded-sm bg-bg-2">
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
      {study.breakdown ? (
        <Progress max={study.required} segments={[
          { value: study.breakdown.completed, tone: 'green' },
          { value: study.breakdown.screening, tone: 'yellow' },
          { value: study.breakdown.remaining, tone: 'grey' },
        ]} />
      ) : (
        <Progress value={study.completedPct} />
      )}
      {study.breakdown && (
        <div className="flex items-center gap-4 text-label text-text-subtitle">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-secondary" />Completed: {study.breakdown.completed}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cta-primary" />Screening: {study.breakdown.screening}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bg-4" />Remaining: {study.breakdown.remaining}</span>
        </div>
      )}
    </article>
  )
}
