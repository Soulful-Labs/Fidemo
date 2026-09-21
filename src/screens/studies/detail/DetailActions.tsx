import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import { STATUS } from '../../../lib/studyState'
import type { Study } from '../../../mock/types'
import { resumeLabel } from '../complete/DiaryOverview'
import { ChevronRight } from '../../../components/ui/icons'

export interface DetailActionsProps {
  study: Study
  onPrimary: () => void
  onSecondary: () => void
}

/**
 * The bottom CTA bar (Figma 919:73900 and siblings). What appears is derived
 * from status through STATUS, so it always matches the state machine and the
 * card actions. Reject, Reschedule and Cancel live inside the state banner,
 * where Figma draws them.
 */
export default function DetailActions({ study, onPrimary, onSecondary }: DetailActionsProps) {
  const meta = STATUS[study.status]
  const scheduled = study.status === 'scheduled' || study.status === 'pin_confirmed'

  // Session types get directions rather than a call link.
  const inPerson = study.type === 'in_person' || study.type === 'in_person_group'
  const secondaryLabel = scheduled ? (inPerson ? 'Get Directions' : 'Join Call') : undefined

  const diary = study.type === 'diary' && study.diary
  const diaryOpen = diary && study.status === 'invited_to_complete'
  const primaryLabel =
    study.status === 'available' ? 'Apply'
      : diaryOpen && study.diary!.completedDays.length > 0 ? resumeLabel(study.diary!.completedDays, study.diary!.totalDays)
          // Rate Client lives in the Paid banner; the bar only repeats it until it is done.
          : (study.status === 'paid' || study.status === 'late_show') && study.userReview ? undefined
            : meta.primary

  if (!primaryLabel) return null

  return (
    <CtaBar>
      {secondaryLabel && (
        <Button variant="secondary" className="flex-1" onClick={onSecondary}>{secondaryLabel}</Button>
      )}
      <Button className="flex-1" onClick={onPrimary} rightIcon={diaryOpen ? <ChevronRight className="h-5 w-5" /> : undefined}>{primaryLabel}</Button>
    </CtaBar>
  )
}
