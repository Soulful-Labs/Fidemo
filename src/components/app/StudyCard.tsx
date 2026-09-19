import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { Bookmark, Clock } from '../ui/icons'
import { cn } from '../../lib/cn'
import { daysLeft, duration, reward } from '../../lib/format'
import { STATUS } from '../../lib/studyState'
import type { Study } from '../../mock/types'
import ScoreDial from './ScoreDial'
import StudyTypeTag from './StudyTypeTag'

export interface StudyCardProps {
  study: Study
  /** `compact` is the horizontal Recommended rail; everything else is `list`. */
  variant?: 'list' | 'compact'
  onOpen?: () => void
  onToggleSave?: () => void
  onPrimary?: () => void
  onSecondary?: () => void
  onReject?: () => void
  onMatchScore?: () => void
  showActions?: boolean
  /** Status tag, used in Applied and History. */
  showStatus?: boolean
  /** e.g. "Applied on Wed, Mar 5" or the booked session time. */
  footnote?: string
}

/**
 * The single study card. Every list uses this with different props — never fork
 * it per screen (hard rule 3). Actions derive from status via STATUS.
 */
export default function StudyCard({
  study,
  variant = 'list',
  onOpen,
  onToggleSave,
  onPrimary,
  onSecondary,
  onReject,
  onMatchScore,
  showActions = true,
  showStatus = false,
  footnote,
}: StudyCardProps) {
  const meta = STATUS[study.status]
  const compact = variant === 'compact'

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border-1 border-stroke-2 bg-bg-1',
        compact && 'w-64 shrink-0',
      )}
    >
      {meta.flag && (
        <p className="bg-yellow-1000 px-4 py-2 text-label text-brand-primary">{meta.flag}</p>
      )}

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <StudyTypeTag type={study.type} />
          <span className="flex items-center gap-1 text-label text-text-body">
            <Clock />
            {duration(study.durationMins)}
          </span>
          <button
            type="button"
            onClick={onMatchScore}
            aria-label={`Match score ${study.matchScore}`}
            className="ml-auto"
          >
            <ScoreDial score={study.matchScore} compact />
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={study.saved ? 'Remove from saved' : 'Save study'}
            aria-pressed={study.saved}
            className={cn(study.saved ? 'text-brand-primary' : 'text-text-disabled hover:text-text-body')}
          >
            <Bookmark filled={study.saved} />
          </button>
        </div>

        <button type="button" onClick={onOpen} className="flex gap-3 text-left">
          {study.image && (
            <img
              src={study.image}
              alt=""
              className="h-16 w-16 shrink-0 rounded-md border-1 border-stroke-2 object-cover"
            />
          )}
          <span className="flex min-w-0 flex-col gap-1">
            <span className="line-clamp-2 text-body-medium text-text-title">{study.title}</span>
            <span className="line-clamp-3 text-label text-text-body">{study.description}</span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-large text-brand-primary">{reward(study.reward)}</span>
          <span className="text-label text-text-body">{daysLeft(study.daysLeft)}</span>
          {showStatus && (
            <Tag tone={meta.tone} className="ml-auto">
              {meta.label}
            </Tag>
          )}
        </div>

        {footnote && <p className="text-label text-text-body">{footnote}</p>}

        {showActions && (meta.primary || meta.secondary) && (
          <div className="flex items-center gap-2">
            {meta.secondary && (
              <Button size="md" variant="tertiary" onClick={onSecondary} className="flex-1">
                {meta.secondary}
              </Button>
            )}
            {meta.primary && (
              <Button size="md" onClick={onPrimary} className="flex-1">
                {meta.primary}
              </Button>
            )}
            {meta.rejectable && onReject && (
              <Button size="md" variant="tertiary" onClick={onReject}>
                Reject
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
