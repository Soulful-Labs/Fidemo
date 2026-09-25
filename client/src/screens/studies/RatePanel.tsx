import { useState } from 'react'
import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import { CheckCircle } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import type { RatingState } from '../../lib/policy'
import { RATING_STATE_STARS, TRUST_BY_STARS } from '../../lib/policy'
import type { Study } from '../../mock/db'
import { useStudies } from '../../mock/store'
import { useToast } from '../../components/ui/Toast'
import { recruit } from '../../lib/derive'

/**
 * Rate Ferry L. (1627:98286).
 *
 * **Rule 7 conflict, and the policy wins.** The frame draws three dimensions
 * — Expertise, Reliability, Communication — of five stars each. The signed
 * Trust and Rewards policy closes the question in its sign-off: "Client
 * ratings are confirmed as part of this build... They are the three states
 * already in the workflow: poor, good or excellent." Workflow step 52 says
 * the same. The policy outranks Figma on ratings, so this panel records one
 * rating in three states. The frame's card, heading, review box and footer
 * are unchanged. Flagged in docs/Stage-Two-Conflicts.md.
 */
const STATES: { key: RatingState; label: string; help: string }[] = [
  { key: 'excellent', label: 'Excellent', help: 'Prepared, engaged and on time' },
  { key: 'good', label: 'Good', help: 'Took part as asked' },
  { key: 'poor', label: 'Poor', help: 'Late, disengaged or unprepared' },
]

function StatePicker({ value, onPick }: { value: RatingState | null; onPick: (r: RatingState) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-1 p-4">
      <p className="text-body-medium text-text-title">Overall rating</p>
      <div className="flex gap-2">
        {STATES.map((st) => (
          <button key={st.key} type="button" onClick={() => onPick(st.key)}
            aria-pressed={value === st.key}
            className={cn('flex flex-1 flex-col items-start gap-1 rounded-sm border-1 px-3 py-3 text-left transition-colors',
              value === st.key
                ? 'border-cta-primary bg-yellow-30 text-text-title'
                : 'border-stroke-input bg-bg-0 text-text-subtitle hover:border-cta-tertiaryStroke')}>
            <span className="flex w-full items-center justify-between text-body-medium text-text-title">
              {st.label}
              {value === st.key && <CheckCircle className="h-4 w-4 text-brand-primary" />}
            </span>
            <span className="text-text-regular text-text-subtitle">{st.help}</span>
          </button>
        ))}
      </div>
      <p className="text-text-regular text-text-subtitle">
        Ratings from the last 10 studies count towards a respondent&rsquo;s Trust Score.
      </p>
    </div>
  )
}

export default function RatePanel({
  open, onClose, study, personId, rated,
}: { open: boolean; onClose: () => void; study: Study; personId?: string; rated?: boolean }) {
  const { rate } = useStudies()
  const toast = useToast()
  const [value, setValue] = useState<RatingState | null>(null)
  const [review, setReview] = useState('')

  const r = personId ? recruit(study, personId) : undefined
  const name = r?.name ?? 'Ferry L.'
  const role = r?.role ?? 'Physiology Therapist, Orthopedic'
  const given = r?.participation.rating

  const submit = () => {
    if (!value || !personId) return
    const res = rate(study.id, personId, value)
    if (!res.ok) { toast(res.why); return }
    /** The policy's own table, so the panel never invents a number. */
    toast(`Rated ${STATES.find((s) => s.key === value)!.label}, ${TRUST_BY_STARS[RATING_STATE_STARS[value]] > 0 ? '+' : ''}${TRUST_BY_STARS[RATING_STATE_STARS[value]]} to their Trust Score`)
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
          <Button onClick={submit} disabled={!value}>Submit</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      )}>
      <div className="flex items-center gap-3 pb-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-2 text-body-medium text-text-subtitle">
          {name.charAt(0)}
        </span>
        <span className="flex flex-col">
          <span className="text-text-regular text-text-subtitle">{name}</span>
          <span className="text-body-medium text-text-title">{role}</span>
        </span>
      </div>

      {given ? (
        /** RATED (1746:95917): the panel read back after submitting. */
        <div className="flex flex-col rounded-lg bg-bg-1 px-4">
          <p className="py-4 text-body-regular text-text-body">
            You have rated on {r?.participation.completedAt ?? 'Aug 24, 20206'}
          </p>
          <div className="flex flex-col gap-2 border-t-1 border-bgAlt-2 py-3">
            <p className="text-body-medium text-text-title">Overall rating</p>
            <span className="inline-flex h-7 w-fit items-center rounded-full bg-green-50 px-[14px] text-text-regular text-brand-secondary">
              {STATES.find((s) => s.key === given)?.label}
            </span>
          </div>
          <div className="flex flex-col gap-1 border-t-1 border-bgAlt-2 py-4">
            <p className="text-body-medium text-text-title">Review</p>
            <p className="text-body-regular text-text-title">
              Was an really insightful session with {name}! would highly recommend her.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-body-regular text-text-body">Rate {name.split(' ')[0]} for this study</p>
          <StatePicker value={value} onPick={setValue} />
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
