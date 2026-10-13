import type { ReactNode } from 'react'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import TierChip from './TierChip'
import { ChevronRight, TrustMark, VerifiedMark } from '../ui/icons'
import { cn } from '../../lib/cn'
import type { Tier } from '../../lib/studyTypes'

export interface Respondent {
  id: string
  name: string
  role: string
  score: number
  tier: Tier
  professionVerified?: boolean
  /** Their picture, only when they consented to share it (sharedPhoto); otherwise their initial is drawn. */
  photo?: string
}

/** A person's picture, or their initial when the platform holds none. */
export function Avatar({ name, size = 40, photo }: { name: string; size?: number; photo?: string }) {
  if (photo) return <img src={photo} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
  return (
    <span style={{ width: size, height: size }} aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-bg-2 text-text-medium text-text-subtitle">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

/** The score, tier and Profession-Verified row shared by the card and the profile panel. */
export function RespondentMeta({ r }: { r: Respondent }) {
  return (
    <div className="flex h-8 items-center gap-2 [&>span]:h-8">
      <span className="inline-flex items-center gap-1.5 text-body-medium text-text-title">
        <TrustMark className="h-5 w-5 text-brand-primary" />
        {r.score}%
      </span>
      <TierChip tier={r.tier} />
      {r.professionVerified && (
        <Tag tone="type" icon={<VerifiedMark className="h-4 w-4" />}>Profession-Verified</Tag>
      )}
    </div>
  )
}

/**
 * The respondent card drawn on the Dashboard ("Recommended Respondents"),
 * Matched, Invited, Recruited and the Pool. The buttons differ per surface,
 * so they are passed in; the card itself never changes.
 */
export default function RespondentCard({
  respondent, actions, onView, onInvite, viewButton, className,
}: { respondent: Respondent; actions?: ReactNode; onView?: () => void
  /** Invite To Study, the card's own button in the 13 Oct 2026 exports. */
  onInvite?: () => void
  /** The Pool with its filters open draws View Profile beside it. */
  viewButton?: boolean; className?: string }) {
  return (
    <article className={cn('flex flex-col gap-3 rounded-lg bg-bg-1 px-3 pb-3 pt-[14px]', className)}>
      <div className="flex items-center gap-2">
        <Avatar name={respondent.name} photo={respondent.photo} />
        <div className="flex min-w-0 flex-col">
          {/* When `actions` replaces the View Profile button, as the Pool does,
              the name is the way into the profile. Same text, same box. */}
          {onView ? (
            <button type="button" onClick={onView}
              className="truncate text-left text-text-regular text-text-subtitle hover:underline">{respondent.name}</button>
          ) : (
            <span className="truncate text-text-regular text-text-subtitle">{respondent.name}</span>
          )}
          <span className="truncate text-body-medium text-text-title">{respondent.role}</span>
        </div>
      </div>

      <RespondentMeta r={respondent} />

      <div className="flex items-center gap-2">
        {actions ?? (
          <>
            {/* The exports also draw a star here on one Pool frame. It saved a person into a micro-panel, which the design has switched off, so there is nothing for it to do and it is not drawn. */}
            <Button variant="tertiary" size="row" className="mt-0.5 flex-1" onClick={onInvite ?? onView} rightIcon={<ChevronRight className="h-4 w-4" />}>
              {onInvite ? 'Invite To Study' : 'View Profile'}
            </Button>
            {viewButton && <Button variant="tertiary" size="row" className="mt-0.5 flex-1 text-text-subtitle" onClick={onView}>View Profile</Button>}
          </>
        )}
      </div>
    </article>
  )
}
