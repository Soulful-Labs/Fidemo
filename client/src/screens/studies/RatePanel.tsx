import { useState } from 'react'
import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import { Star } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { RATING_DELTA, starsFromDimensions } from '@shared/rules'
import type { ClientStudy as Study } from '../../platform'
import { useStudies } from '../../platform'
import { useToast } from '../../components/ui/Toast'
import { recruit } from '@shared/derive'
import { monthDayYear } from '@shared/format'

/**
 * Rate Ferry L. (1627:98286), as drawn and as the policy now says (section 6,
 * 13 October 2026): three dimensions, Expertise, Reliability and
 * Communication, at five stars each, plus an optional written review. The
 * Trust Score reads their rounded mean (shared/rules.ts starsFromDimensions),
 * exactly as the console's Rate panel does. The three-state control is gone.
 */
const DIMENSIONS = [
  { key: 'expertise', label: 'Expertise' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'communication', label: 'Communication' },
] as const
type Dims = Record<(typeof DIMENSIONS)[number]['key'], number>

function StarRow({ label, value, onPick, readOnly }: { label: string; value: number; onPick?: (n: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-regular text-text-title">{label}</span>
      <span className="flex gap-1" role={readOnly ? undefined : 'radiogroup'} aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" disabled={readOnly} onClick={() => onPick?.(n)} role={readOnly ? undefined : 'radio'}
            aria-checked={readOnly ? undefined : value === n} aria-label={`${label} ${n} star${n > 1 ? 's' : ''}`}
            className={cn('p-0.5', readOnly ? 'cursor-default' : 'hover:scale-110')}>
            <Star className={cn('h-6 w-6', n <= value ? 'fill-yellow-500 text-yellow-500' : 'text-text-body')} />
          </button>
        ))}
      </span>
    </div>
  )
}

export default function RatePanel({
  open, onClose, study, personId, rated,
}: { open: boolean; onClose: () => void; study: Study; personId?: string; rated?: boolean }) {
  const { rate, state: world } = useStudies()
  const toast = useToast()
  const [dims, setDims] = useState<Dims>({ expertise: 0, reliability: 0, communication: 0 })
  const stars = starsFromDimensions(dims)
  const [review, setReview] = useState('')

  const r = personId ? recruit(world, study, personId) : undefined
  const name = r?.name ?? 'Ferry L.'
  const role = r?.role ?? 'Physiology Therapist, Orthopedic'
  /** The rating already given, read back. Older ratings may carry only stars. */
  const given = r?.participation.rating

  const submit = () => {
    if (!stars || !personId) return
    const res = rate(study.id, personId, dims, review)
    if (!res.ok) { toast(res.why); return }
    /** The policy's own table, so the panel never invents a number. */
    toast(`Rated ${stars} stars, ${RATING_DELTA[stars] > 0 ? '+' : ''}${RATING_DELTA[stars]} to their Trust Score`)
    onClose()
  }

  return (
    <SidePanel open={open} onClose={onClose} headerClassName="h-[56px]"
      bodyClassName="flex flex-col gap-3 p-4"
      title={
        <h2 className="text-title-s text-text-subtitle">
          <span className="text-text-title">Rate {name}</span> for {study.breadcrumb}
        </h2>
      }
      footer={rated || given ? undefined : (
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={submit} disabled={!stars}>Submit</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      )}>
      <div className="flex items-center gap-3 pb-1">
        {r?.photo ? <img src={r.photo} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" /> : (
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-2 text-body-medium text-text-subtitle">
            {name.charAt(0)}
          </span>
        )}
        <span className="flex flex-col">
          <span className="text-text-regular text-text-subtitle">{name}</span>
          <span className="text-body-medium text-text-title">{role}</span>
        </span>
      </div>

      {given ? (
        /** RATED (1746:95917): the panel read back after submitting. */
        <div className="flex flex-col rounded-lg bg-bg-1 px-4">
          <p className="py-4 text-body-regular text-text-body">
            You rated on {monthDayYear(given.at)}
          </p>
          <div className="flex flex-col gap-3 border-t-1 border-bgAlt-2 py-3">
            {DIMENSIONS.map((d) => <StarRow key={d.key} label={d.label} value={given[d.key] ?? given.stars} readOnly />)}
          </div>
          <div className="flex flex-col gap-1 border-t-1 border-bgAlt-2 py-4">
            <p className="text-body-medium text-text-title">Review</p>
            <p className="text-body-regular text-text-title">{given.comment || 'No written review.'}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-body-regular text-text-body">Rate {name.split(' ')[0]} for this study</p>
          <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
            {DIMENSIONS.map((d) => <StarRow key={d.key} label={d.label} value={dims[d.key]} onPick={(n) => setDims((x) => ({ ...x, [d.key]: n }))} />)}
            <p className="text-text-regular text-text-subtitle">Ratings from the last 10 studies count towards a respondent&rsquo;s Trust Score.</p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
            <p className="text-body-medium text-text-title">
              Review <span className="text-text-regular text-text-subtitle">(optional)</span>
            </p>
            <textarea rows={3} value={review} onChange={(e) => setReview(e.target.value)}
              placeholder={`Describe your experience with ${name.split(' ')[0]} here..`}
              className="w-full resize-none rounded-sm border-1 border-stroke-input bg-bg-0 px-3 py-3 text-body-regular text-text-title placeholder:text-text-body focus:outline-none" />
          </div>
        </>
      )}
    </SidePanel>
  )
}
