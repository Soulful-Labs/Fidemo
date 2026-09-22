import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { Bookmark, Calendar, Clock, InviteIcon } from '../ui/icons'
import { cn } from '../../lib/cn'
import { bookingShort, dateLong, daysLeft, duration, money } from '../../lib/format'
import { STATUS, outcomeFor } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import type { Study } from '../../mock/types'
import ScoreDial from './ScoreDial'
import StudyTypeTag, { STUDY_TYPE_LABEL } from './StudyTypeTag'
import StatusIcon from './StatusIcon'

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

const HISTORY = ['in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed']

/**
 * The single study card, as drawn in Figma (1279:89999 and the Saved list,
 * 1215:15020). Every list uses this with different props — never fork it per
 * screen (hard rule 3). Layout and actions derive from status via STATUS.
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
  const { user } = useStore()
  const locked = Boolean(study.premium) && !user.verified.license
  const outcome = outcomeFor(study.status)
  const compact = variant === 'compact'
  const booked = Boolean(study.booking) && (study.status === 'scheduled' || study.status === 'pin_confirmed')
  const history = HISTORY.includes(study.status)
  const applied = study.status === 'applied'
  // Booked and closed studies swap the description for "$150 • 45 min" / type.
  const brief = booked || history
  const lastAt = study.timeline.at(-1)?.at

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

  const statusTag = (
    <Tag tone={meta.tone} size="md" icon={<StatusIcon status={study.status} />}>
      {meta.label}
      {outcome && (
        <span className={cn('ml-1 h-2 w-2 rounded-full', outcome.colour === 'green' ? 'bg-state-success' : outcome.colour === 'yellow' ? 'bg-brand-primary' : 'bg-state-danger')} aria-label={outcome.label} />
      )}
    </Tag>
  )

  return (
    <article className={cn('flex flex-col gap-4 rounded-lg bg-bg-1 p-4', compact && 'w-card shrink-0')}>
      {meta.flag && (
        <p className={cn('flex items-center gap-2 text-body-medium', study.status === 'invited_to_apply' ? 'text-brand-primary' : 'text-brand-secondary')}>
          <InviteIcon />
          {meta.flag}
        </p>
      )}

      {study.premium && (
        <p className={cn('flex items-center gap-2 text-text-medium', locked ? 'text-text-body' : 'text-tier-gold')}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="shrink-0"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d={locked ? 'M8 10V7a4 4 0 0 1 8 0v3' : 'M8 10V7a4 4 0 0 1 7.5-2'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          {locked ? 'Premium, needs a verified credential' : 'Premium study'}
        </p>
      )}

      {!history && (
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
        </div>
      )}

      <button type="button" onClick={onOpen} className="flex gap-3 text-left">
        {study.image && (
          <img src={study.image} alt="" className="h-thumb w-thumb shrink-0 rounded-md object-cover" />
        )}
        <span className="flex min-w-0 flex-col gap-2">
          <span className="line-clamp-2 text-title-s leading-snug text-text-title">{study.title}</span>
          {brief ? (
            <span className="flex items-center gap-2 text-title-s text-text-title">
              {money(study.reward)}
              <span className="text-text-body">•</span>
              <span className="text-body-regular text-text-body">
                {booked ? duration(study.durationMins) : STUDY_TYPE_LABEL[study.type]}
              </span>
            </span>
          ) : (
            <span className="line-clamp-2 text-body-regular text-text-body">{study.description}</span>
          )}
        </span>
      </button>

      {booked && study.booking ? (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-primary" />
          <span className="text-body-medium text-brand-primary">{bookingShort(study.booking.date, study.booking.slot)}</span>
          <span className="ml-auto">{bookmark}</span>
        </div>
      ) : history ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-text-subtitle" />
          <span className="text-text-regular text-text-subtitle">{lastAt ? dateLong(lastAt) : dateLong(study.endsAt)}</span>
          <span className="ml-auto flex items-center gap-2">
            {statusTag}
            {bookmark}
          </span>
        </div>
      ) : applied && showStatus ? (
        <div className="flex items-center gap-2">
          <span className="text-text-regular text-text-subtitle">{footnote}</span>
          <span className="ml-auto flex items-center gap-2">
            {statusTag}
            {bookmark}
          </span>
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

      {footnote && !(applied && showStatus) && <p className="text-text-regular text-text-body">{footnote}</p>}

      {showActions && meta.primary && (
        <div className="flex items-center gap-3">
          {booked && meta.secondary && (
            <Button variant="secondary" onClick={onSecondary} className="flex-1">
              {study.type === 'in_person' || study.type === 'in_person_group' ? 'Get Directions' : meta.secondary}
            </Button>
          )}
          <Button onClick={onPrimary} className="flex-1">{meta.primary}</Button>
          {!booked && onReject && (
            <Button variant="secondary" onClick={onReject} className="flex-1">Reject</Button>
          )}
          {!booked && !onReject && meta.secondary && onSecondary && (
            <Button variant="secondary" onClick={onSecondary} className="flex-1">{meta.secondary}</Button>
          )}
        </div>
      )}
    </article>
  )
}
