import Button from '../../../components/ui/Button'
import { canReschedule } from '../../../lib/rules'
import { STATUS } from '../../../lib/studyState'
import type { Study } from '../../../mock/types'

export interface DetailActionsProps {
  study: Study
  onPrimary: () => void
  onSecondary: () => void
  onReject: () => void
  onReschedule: () => void
  onCancel: () => void
  onBlockedReschedule: (reason: string) => void
}

/**
 * The bottom CTA bar. What appears is derived from status through STATUS, so
 * it always matches the state machine and the card actions.
 */
export default function DetailActions({
  study, onPrimary, onSecondary, onReject, onReschedule, onCancel, onBlockedReschedule,
}: DetailActionsProps) {
  const meta = STATUS[study.status]
  const scheduled = study.status === 'scheduled' || study.status === 'pin_confirmed'

  // Session types get directions rather than a call link.
  const inPerson = study.type === 'in_person' || study.type === 'in_person_group'
  const secondaryLabel = scheduled ? (inPerson ? 'Get Directions' : 'Join Call') : meta.secondary

  const reschedule = study.booking
    ? canReschedule(study.booking.rescheduleCount, study.booking.date)
    : { ok: false, reason: 'This study has no session booked' }

  if (!meta.primary && !scheduled) return null

  return (
    <div className="sticky bottom-0 flex flex-col gap-2 border-t-1 border-stroke-2 bg-bg-0 px-4 pb-6 pt-3">
      <div className="flex gap-2">
        {secondaryLabel && (
          <Button size="lg" variant="tertiary" className="flex-1" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
        {meta.primary && (
          <Button size="lg" className="flex-1" onClick={onPrimary}>
            {meta.primary}
          </Button>
        )}
      </div>

      {meta.rejectable && (
        <Button size="md" variant="ghost" fullWidth onClick={onReject}>Reject</Button>
      )}

      {scheduled && (
        <div className="flex gap-2">
          <Button
            size="md" variant="ghost" className="flex-1"
            disabled={!reschedule.ok}
            onClick={onReschedule}
            onBlocked={() => onBlockedReschedule(reschedule.reason ?? 'Cannot reschedule')}
          >
            Reschedule
          </Button>
          <Button size="md" variant="ghost" className="flex-1" onClick={onCancel}>Cancel Study</Button>
        </div>
      )}
    </div>
  )
}
