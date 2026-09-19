import { cn } from '../../../lib/cn'
import { bookingLong, dateTime, money } from '../../../lib/format'
import { POINTS, TRUST } from '../../../lib/rules'
import type { Study } from '../../../mock/types'

/** The attendance PIN used throughout the prototype (PRD 6.11). */
export const ATTENDANCE_PIN = '407060'

type Tone = 'yellow' | 'green' | 'blue' | 'danger'

const TONES: Record<Tone, string> = {
  yellow: 'border-yellow-700 bg-yellow-1000 text-brand-primary',
  green: 'border-green-700 bg-green-900 text-brand-secondary',
  blue: 'border-stroke-3 bg-bg-2 text-accent-blue',
  danger: 'border-state-danger bg-state-dangerBg text-state-danger',
}

/** When did a given step happen, for the banners that quote a time. */
const when = (study: Study, label: string) =>
  study.timeline.find((t) => t.label === label)?.at

export interface BannerContent {
  title: string
  body?: string
  tone: Tone
}

/**
 * PRD 6.7, quoted exactly, with the figures filled in from the study.
 *
 * One deviation: the Paid banner is drawn as "+50 Reward points", but a
 * completed study is worth 25 (PRD 8.1 and the CLAUDE.md rules table, which
 * says to use those values rather than the ones drawn). Same conflict as the
 * Points History row that shows a study at +50.
 */
export function bannerFor(study: Study): BannerContent | null {
  switch (study.status) {
    case 'invited_to_apply':
      return { tone: 'yellow', title: 'Invited To Apply', body: 'You are invited to apply for this study!' }
    case 'draft':
      return { tone: 'yellow', title: 'In Draft', body: "We've got you, your progress was saved! Resume right from where you left." }
    case 'invited_to_schedule':
      return { tone: 'yellow', title: 'Invited To Schedule', body: "Congratulation, you are qualified for this study!! You're invited to book your session on your preferred time to complete and earn reward." }
    case 'invited_to_complete':
      return { tone: 'yellow', title: 'Invited To Complete', body: "Congratulation, you are qualified!! You're invited to complete your study asap and earn reward." }
    case 'scheduled':
      return {
        tone: 'green',
        title: study.booking ? `Scheduled. For ${bookingLong(study.booking.date, study.booking.slot)}` : 'Scheduled',
        body: 'Can be rescheduled twice only before at least 24 hours. Cancellation may impact your profile score.',
      }
    case 'pin_confirmed':
      return { tone: 'green', title: `Confirmed PIN successfully! #${ATTENDANCE_PIN}` }
    case 'in_process':
      return { tone: 'blue', title: 'In Process', body: 'Your study response is under process and will be updated within 3-5 days.' }
    case 'paid':
      return {
        tone: 'green',
        title: `Paid, ${dateTime(when(study, 'Paid') ?? study.endsAt)}`,
        body: `Earned ${money(study.reward)}! +${TRUST.STUDY_COMPLETION} Trust score + ${POINTS.STUDY_COMPLETION} Reward points`,
      }
    case 'rejected':
      return {
        tone: 'danger',
        title: `Rejected, ${dateTime(when(study, 'Rejected') ?? study.endsAt)}`,
        body: 'Your application did not qualified due to unmatched answers in the screener. Thanks for taking time to apply. Better luck next time.',
      }
    case 'no_show':
      return {
        tone: 'danger',
        title: `No Show, ${dateTime(when(study, 'No Show') ?? study.endsAt)}`,
        body: `${TRUST.NO_SHOW} Trust score. You did not appear for the study, hence marked No-show as uncompleted which is not eligible for reward incentive.`,
      }
    default:
      return null
  }
}

/** Diary studies show their own progress banner alongside the state one. */
export function diaryBannerFor(study: Study): BannerContent | null {
  if (!study.diary || study.status === 'paid' || study.status === 'rejected') return null
  const { completedDays, totalDays, minDays } = study.diary
  return {
    tone: 'yellow',
    title: `${completedDays.length}/${totalDays} days completed`,
    body: `At least ${minDays} days needs to be filled out of ${totalDays} to complete this study and get reward.`,
  }
}

export default function StateBanner({ content }: { content: BannerContent }) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-md border-1 p-3', TONES[content.tone])}>
      <p className="text-text-large">{content.title}</p>
      {content.body && <p className="text-label opacity-90">{content.body}</p>}
    </div>
  )
}
