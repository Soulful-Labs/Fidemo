import Button from '../../../components/ui/Button'
import { canReschedule } from '../../../lib/rules'
import type { Study } from '../../../mock/types'
import { WarningIcon } from './bannerIcons'

export interface BannerActionsProps {
  study: Study
  onSchedule: () => void
  onReject: () => void
  onReschedule: () => void
  onCancel: () => void
  onBlockedReschedule: (reason: string) => void
}

/**
 * The buttons Figma draws inside the state banner: Schedule + Reject on an
 * invitation (919:75267), Reschedule + Cancel and the PIN note on a booked
 * session (919:75540). A disabled Reschedule explains itself on tap.
 */
export default function BannerActions({
  study, onSchedule, onReject, onReschedule, onCancel, onBlockedReschedule,
}: BannerActionsProps) {
  if (study.status === 'invited_to_apply' || study.status === 'invited_to_schedule') {
    return (
      <div className="flex gap-3">
        <Button className="flex-1" onClick={onSchedule}>
          {study.status === 'invited_to_schedule' ? 'Schedule' : 'Accept & Apply'}
        </Button>
        <Button variant="tertiary" className="flex-1" onClick={onReject}>Reject</Button>
      </div>
    )
  }

  if (study.status === 'scheduled') {
    const reschedule = study.booking
      ? canReschedule(study.booking.rescheduleCount, study.booking.date)
      : { ok: false, reason: 'This study has no session booked' }
    return (
      <>
        <div className="flex gap-3">
          <Button
            variant="secondary" className="flex-1"
            disabled={!reschedule.ok}
            onClick={onReschedule}
            onBlocked={() => onBlockedReschedule(reschedule.reason ?? 'Cannot reschedule')}
          >
            Reschedule
          </Button>
          <Button variant="tertiary" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </>
    )
  }

  return null
}

/**
 * The session code note under the Scheduled banner. Workflow 42: a code is
 * generated at the end of the session and shown to both sides; the
 * participant enters it and so does the moderator. No code, no payment. The
 * PRD 6.11 "Submit Confirmation PIN" screens are kept; the timing and copy
 * follow the workflow.
 */
export function PinNote() {
  return (
    <div className="flex flex-col gap-1 border-t-1 border-stroke-3 pt-3">
      <p className="flex items-center gap-2 text-body-medium text-brand-primary">
        <WarningIcon />
        Submit Confirmation PIN
      </p>
      <p className="text-text-regular text-text-subtitle">
        Join the call and get this code from the interviewer to submit for confirming your joining and get reward
        after successful completion.
      </p>
    </div>
  )
}
