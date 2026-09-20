import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { Bookmark, Calendar, Clock, InviteIcon } from '../ui/icons'
import { cn } from '../../lib/cn'
import { bookingWhen, daysLeft, duration, money } from '../../lib/format'
import { STATUS } from '../../lib/studyState'
import type { Study } from '../../mock/types'
import ScoreDial from './ScoreDial'
import StudyTypeTag from './StudyTypeTag'

export interface StudyCardProps {
  study: Study
  /** `compact` is the 320px card in the horizontal Recommended rail. */
  variant?: 'list' | 'compact'
  onOpen?: () => void
  onToggleSave?: () => void
  onPrimary?: () => void
  onSecondary?: () => void
  /** When given, the second button is Reject instead of View Details. */
  onReject?: () => void
  onMatchScore?: () => void
  showActions?: boolean
  /** Status tag, used in Applied and History. */
  showStatus?: boolean
  /** e.g. "Applied on Wed, Mar 5". */
  footnote?: string
}

/**
 * The single study card, as drawn in Figma (1279:89999). Every list uses this
 * with different props — never fork it per screen (hard rule 3). Actions
 * derive from status via STATUS.
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
  const booked = Boolean(study.booking) && (study.status === 'scheduled' || study.status === 'pin_confirmed')
  const flagGreen = study.status !== 'invited_to_apply'

  const bookmark = (
    <button
      type="button"
      onClick={onToggleSave}
      aria-label={study.saved ? 'Remove from saved' : 'Save study'}
      aria-pressed={study.saved}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3',
        study.saved ? 'text-brand-primary' : 'text-text-title hover:text-text-body',
      )}
    >
      <Bookmark filled={study.saved} />
    </button>
  )

  return (
    <article className={cn('flex flex-col gap-4 rounded-lg bg-bg-1 p-4', compact && 'w-card shrink-0')}>
      {meta.flag && !showStatus && (
        <p className={cn('flex items-center gap-2 text-body-medium', flagGreen ? 'text-brand-secondary' : 'text-brand-primary')}>
          <InviteIcon />
          {meta.flag}
        </p>
      )}

      <div className="flex items-center gap-3">
        <StudyTypeTag type={study.type} />
        {!booked && (
          <>
            <span className="ml-auto flex items-center gap-1.5 text-body-regular text-text-subtitle">
              <Clock className="h-5 w-5" />
              {duration(study.durationMins)}
            </span>
            <button type="button" onClick={onMatchScore} aria-label={`Match score ${study.matchScore}`}>
              <ScoreDial score={study.matchScore} compact />
            </button>
          </>
        )}
        {showStatus && <Tag tone={meta.tone} size="md" className="ml-auto">{meta.label}</Tag>}
      </div>

      <button type="button" onClick={onOpen} className="flex gap-3 text-left">
        {study.image && (
          <img src={study.image} alt="" className="h-thumb w-thumb shrink-0 rounded-md object-cover" />
        )}
        <span className="flex min-w-0 flex-col gap-2">
          <span className="line-clamp-2 text-title-s leading-snug text-text-title">{study.title}</span>
          {booked ? (
            <span className="flex items-center gap-2 text-title-s text-text-title">
              {money(study.reward)}
              <span className="text-text-body">•</span>
              <span className="text-body-regular text-text-body">{duration(study.durationMins)}</span>
            </span>
          ) : (
            <span className="line-clamp-2 text-body-regular text-text-body">{study.description}</span>
          )}
        </span>
      </button>

      {booked && study.booking ? (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-primary" />
          <span className="text-body-medium text-brand-primary">
            {bookingWhen(study.booking.date, study.booking.slot).replace(' ', ' • ')}
          </span>
          <span className="ml-auto">{bookmark}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex items-baseline gap-1 text-title-l text-brand-primary">
            {money(study.reward)}
            {compact && <span className="text-text-medium">USD</span>}
          </span>
          <Tag tone="outline" size="md" icon={<Calendar className="h-4 w-4" />} className="ml-auto">
            {daysLeft(study.daysLeft)}
          </Tag>
          {!compact && bookmark}
        </div>
      )}

      {footnote && <p className="text-text-regular text-text-body">{footnote}</p>}

      {showActions && !booked && meta.primary && (
        <div className="flex items-center gap-3">
          <Button size="lg" onClick={onPrimary} className="flex-1">{meta.primary}</Button>
          {onReject ? (
            <Button size="lg" variant="secondary" onClick={onReject} className="flex-1">Reject</Button>
          ) : meta.secondary && onSecondary ? (
            <Button size="lg" variant="secondary" onClick={onSecondary} className="flex-1">{meta.secondary}</Button>
          ) : null}
        </div>
      )}
      {showActions && booked && (meta.primary || meta.secondary) && (
        <div className="flex items-center gap-3">
          {meta.secondary && <Button size="lg" variant="secondary" onClick={onSecondary} className="flex-1">{meta.secondary}</Button>}
          {meta.primary && <Button size="lg" onClick={onPrimary} className="flex-1">{meta.primary}</Button>}
        </div>
      )}
    </article>
  )
}
