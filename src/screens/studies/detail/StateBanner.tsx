import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { bookingLong, dateTime, money } from '../../../lib/format'
import { POINTS, TRUST } from '../../../lib/rules'
import type { Study } from '../../../mock/types'
import { BannerIcon } from './bannerIcons'
import { outcomeFor } from '../../../lib/studyState'

/** The attendance PIN used throughout the prototype (PRD 6.11). */
export const ATTENDANCE_PIN = '407060'

export type BannerTone = 'yellow' | 'green' | 'blue' | 'danger'

const CARD: Record<BannerTone, string> = {
  yellow: 'bg-yellow-fade',
  green: 'bg-green-fade',
  blue: 'bg-blue-fade',
  danger: 'bg-state-dangerBg/60',
}
const TEXT: Record<BannerTone, string> = {
  yellow: 'text-brand-primary',
  green: 'text-brand-secondary',
  blue: 'text-accent-blue',
  danger: 'text-state-danger',
}

/** When did a given step happen, for the banners that quote a time. */
const when = (study: Study, label: string) =>
  study.timeline.find((t) => t.label === label)?.at

export interface BannerContent {
  title: string
  body?: string
  tone: BannerTone
  /** Right-hand slot: "In Review" chip or the timestamp. */
  aside?: string
  /** Title drawn as a pill (Paid, Rejected, No Show). */
  pill?: boolean
  /** Second line under the title, e.g. "Earned $150!". */
  headline?: string
  subline?: string
  /** Workflow 34: red, yellow or green outcome shown with the banner. */
  outcome?: ReturnType<typeof outcomeFor>
}

/**
 * PRD 6.7, quoted exactly, with the figures filled in from the study.
 *
 * One deviation: the Paid banner is drawn as "+50 Reward points", but a
 * completed study is worth 25 (PRD 8.1 and the CLAUDE.md rules table, which
 * says to use those values rather than the ones drawn).
 */
export function bannerFor(study: Study): BannerContent | null {
  const content = bannerContent(study)
  return content ? { ...content, outcome: outcomeFor(study.status) } : null
}

function bannerContent(study: Study): BannerContent | null {
  switch (study.status) {
    case 'invited_to_apply':
      return { tone: 'yellow', title: 'Invited To Apply', body: 'You are invited to apply for this study!' }
    case 'draft':
      return { tone: 'yellow', title: 'In Draft', body: "We've got you, your progress was saved! Resume right from where you left." }
    case 'applied':
      return { tone: 'yellow', title: 'Applied', aside: 'In Review', body: 'Your application for this study has been submitted to be reviewed. It is still under consideration, so check back here for the outcome. It will be shown in scheduled if you will be selected.' }
    case 'invited_to_schedule':
      return { tone: 'yellow', title: 'Invited To Schedule', body: "Congratulation, you are qualified for this study!! You're invited to book your session on your preferred time to complete and earn reward." }
    case 'invited_to_complete':
      return { tone: 'yellow', title: 'Invited To Complete', body: "Congratulation, you are qualified!! You're invited to complete your study asap and earn reward." }
    case 'scheduled':
      return {
        tone: 'yellow', title: 'Scheduled',
        headline: study.booking ? `For ${bookingLong(study.booking.date, study.booking.slot).replace(' At ', ' • At ')}` : undefined,
        body: 'Can be rescheduled twice only before at least 24 hours. Cancellation may impact your profile score.',
      }
    case 'pin_confirmed':
      return { tone: 'green', title: `Session code confirmed! #${ATTENDANCE_PIN}`, body: 'Both sides entered the code, so your attendance is on record. Complete the study to have your earnings credited.' }
    case 'in_process':
      return {
        tone: 'blue', title: 'In Process', headline: `${money(study.reward)} credited, awaiting client approval`,
        body: 'Your study response is under process. The client approves the payout list against the people they approved into the study, usually within 3-5 days, and the reward then lands in your wallet.',
      }
    case 'not_needed':
      return {
        tone: 'green', title: 'Turned up, not needed', pill: true, aside: dateTime(when(study, 'Paid') ?? study.endsAt),
        headline: `Paid in full, ${money(study.reward)}`,
        body: 'You turned up but the session was over-recruited and you were not needed this time. You are paid in full and your Trust Score is unaffected.',
      }
    case 'paid':
      return {
        tone: 'green', title: 'Paid', pill: true, aside: dateTime(when(study, 'Paid') ?? study.endsAt),
        headline: `Earned ${money(study.reward)}!`,
        subline: `+${TRUST.STUDY_COMPLETION} Trust score + ${POINTS.STUDY_COMPLETION} Reward points`,
      }
    case 'rejected':
      return {
        tone: 'danger', title: 'Rejected', pill: true, aside: dateTime(when(study, 'Rejected') ?? study.endsAt),
        body: 'Your application did not qualified due to unmatched answers in the screener. Thanks for taking time to apply. Better luck next time.',
      }
    case 'late_show':
      return {
        tone: 'yellow', title: 'Late Show Up', pill: true, aside: dateTime(when(study, 'Late show up') ?? study.endsAt),
        headline: `Paid ${money(study.reward)}, ${TRUST.LATE_SHOW_UP} Trust score`,
        body: 'You took part but arrived late, so the session was marked as a late show up. You are paid in full; the policy deducts 2 from your Trust Score. Reward points are never deducted.',
      }
    case 'no_show':
      return {
        tone: 'danger', title: 'No Show', pill: true, aside: dateTime(when(study, 'No Show') ?? study.endsAt),
        headline: `${TRUST.NO_SHOW} Trust score`,
        body: 'You did not appear for the study, hence marked No-show as uncompleted which is not eligible for reward incentive.',
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

/** The tinted status card at the top of Study Details (Figma 919:74597 and siblings). */
export default function StateBanner({ content, children }: { content: BannerContent; children?: ReactNode }) {
  const { tone } = content
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg bg-bg-1 p-4', CARD[tone])}>
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            'flex items-center gap-2 text-body-medium',
            TEXT[tone],
            content.pill && cn('rounded-full px-3 py-1', tone === 'green' ? 'bg-green-900/60' : 'bg-state-dangerBg'),
          )}
        >
          <BannerIcon tone={tone} title={content.title} />
          {content.title}
        </span>
        {content.aside && (
          <span className={cn('text-text-regular', content.pill ? 'text-text-body' : cn('rounded-full bg-yellow-1000/70 px-3 py-1', TEXT[tone]))}>
            {content.aside}
          </span>
        )}
      </div>
      {content.outcome && (content.outcome.colour === 'yellow' || content.outcome.colour === 'red') && (
        <p className="flex items-center gap-2 text-text-regular text-text-subtitle">
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', content.outcome.colour === 'yellow' ? 'bg-brand-primary' : 'bg-state-danger')} aria-hidden="true" />
          {content.outcome.label}{content.outcome.label === 'Under consideration' ? ', check back for the outcome' : ''}
        </p>
      )}
      {content.headline && (
        <p className={cn('text-body-medium', content.tone === 'yellow' ? 'rounded-md bg-yellow-1000/50 px-3 py-2 text-text-title' : TEXT[tone])}>
          {content.headline}
        </p>
      )}
      {content.subline && <p className={cn('text-text-regular', TEXT[tone])}>{content.subline}</p>}
      {children}
      {content.body && <p className="text-text-regular text-text-subtitle">{content.body}</p>}
    </div>
  )
}
