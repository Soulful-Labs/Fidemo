import type { ReactNode } from 'react'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import TierChip from './TierChip'
import { ChevronRight, Star, TrustMark, VerifiedMark } from '../ui/icons'
import { cn } from '../../lib/cn'
import type { Tier } from '../../lib/studyTypes'
import { useToast } from '../ui/Toast'

export interface Respondent {
  id: string
  name: string
  role: string
  score: number
  tier: Tier
  professionVerified?: boolean
}

/** Initials avatar, as drawn on every respondent card and row. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size }}
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
  respondent, actions, onView, saveable, onSave, className,
}: { respondent: Respondent; actions?: ReactNode; onView?: () => void; saveable?: boolean
  /** The star saves them into a micro-panel; without it the card just confirms. */
  onSave?: () => void; className?: string }) {
  const toast = useToast()
  return (
    <article className={cn('flex flex-col gap-3.5 rounded-lg bg-bg-1 p-3', className)}>
      <div className="flex items-center gap-2">
        <Avatar name={respondent.name} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-text-regular text-text-subtitle">{respondent.name}</span>
          <span className="truncate text-body-medium text-text-title">{respondent.role}</span>
        </div>
      </div>

      <RespondentMeta r={respondent} />

      <div className="flex items-center gap-2">
        {actions ?? (
          <Button variant="tertiary" className="flex-1" onClick={onView} rightIcon={<ChevronRight className="h-4 w-4" />}>
            View Profile
          </Button>
        )}
        {(saveable || onSave) && (
          <button type="button" aria-label="Save to micro-panel" onClick={() => (onSave ? onSave() : toast('Saved to micro-panel'))}
            className="flex h-btn w-btn shrink-0 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-text-subtitle hover:text-text-title">
            <Star className="h-5 w-5" />
          </button>
        )}
      </div>
    </article>
  )
}
