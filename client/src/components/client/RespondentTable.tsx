import { cn } from '../../lib/cn'
import { SortIcon } from '../ui/icons'
import TierChip from './TierChip'
import type { Tier } from '../../lib/studyTypes'

/**
 * The Recruited table draws three statuses (1627:96535), and they line up
 * with workflow step 34's red, yellow and green: Applied is still under
 * consideration, Qualified is through, Disqualified is not.
 *
 * The lifecycle has three more states that reach this table and no frame
 * draws a pill for — Recruited, Scheduled and No-show — so they borrow the
 * tone of the light they carry. Flagged in docs/Stage-Two-Conflicts.md.
 */
export const STATUS_TONE: Record<string, string> = {
  Applied: 'bg-yellow-30 text-brand-primary',
  Qualified: 'bg-green-50 text-brand-secondary',
  Disqualified: 'bg-[#ffeade] text-[#d97706]',
  Recruited: 'bg-green-50 text-brand-secondary',
  Scheduled: 'bg-green-50 text-brand-secondary',
  Completed: 'bg-green-50 text-brand-secondary',
  Rated: 'bg-green-50 text-brand-secondary',
  'No-show': 'bg-[#ffeade] text-[#d97706]',
}

/**
 * A sortable column heading. Both respondent tables put their cells on 18px
 * of side padding, narrower than the 22 the Studies list uses.
 */
export function Th({ label, sortable, className }: { label: string; sortable?: boolean; className?: string }) {
  return (
    <th className={cn('h-row px-[18px] text-left text-text-regular font-normal text-text-subtitle', className)}>
      <span className="inline-flex items-center gap-1.5">
        {label}
        {sortable && <SortIcon className="h-4 w-4 text-text-body" />}
      </span>
    </th>
  )
}

/** The score and tier a respondent row ends with. */
export function ScoreCell({ score, tier }: { score: number; tier: Tier }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-text-regular text-text-title">{score}</span>
      <TierChip tier={tier} />
    </span>
  )
}

/** The pill in the Status column. */
export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex h-7 items-center rounded-full px-[14px] text-text-regular', STATUS_TONE[status])}>
      {status}
    </span>
  )
}
