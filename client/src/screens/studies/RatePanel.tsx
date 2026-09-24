import { useState } from 'react'
import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import { Star } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

/** The three things a client rates a respondent on. */
const DIMENSIONS = ['Expertise', 'Reliability', 'Communication']

/** One dimension: a heading and five stars. */
function Stars({ label, value, onPick }: { label: string; value: number; onPick: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      <p className="text-body-medium text-text-title">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${label} ${n} of 5`} onClick={() => onPick(n)}>
            <Star className={cn('h-6 w-6', n <= value ? 'fill-brand-primary text-brand-primary' : 'text-text-disabled')} />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Rate Ferry L. (1627:98286): the 600px panel the client rates a respondent
 * in. Three dimensions of five stars and an optional written review; the
 * frame shows no score, no weighting and no effect on the Trust Score.
 */
export default function RatePanel({
  open, onClose, study,
}: { open: boolean; onClose: () => void; study: { breadcrumb: string } }) {
  const [scores, setScores] = useState<Record<string, number>>({ Expertise: 4 })

  return (
    <SidePanel open={open} onClose={onClose} headerClassName="h-[56px]"
      bodyClassName="flex flex-col gap-3 p-4"
      title={
        <h2 className="text-title-s text-text-subtitle">
          <span className="text-text-title">Rate Ferry L.</span> for {study.breadcrumb}
        </h2>
      }
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={onClose}>Submit</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      }>
      <div className="flex items-center gap-3 pb-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-2 text-body-medium text-text-subtitle">F</span>
        <span className="flex flex-col">
          <span className="text-text-regular text-text-subtitle">Ferry L.</span>
          <span className="text-body-medium text-text-title">Physiology Therapist, Orthopedic</span>
        </span>
      </div>
      <p className="text-body-regular text-text-body">Rate Ferry for this study</p>

      {DIMENSIONS.map((d) => (
        <Stars key={d} label={d} value={scores[d] ?? 0} onPick={(n) => setScores((s) => ({ ...s, [d]: n }))} />
      ))}

      <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
        <p className="text-body-medium text-text-title">
          Review <span className="text-text-regular text-text-subtitle">(optional)</span>
        </p>
        <textarea rows={3} placeholder="Describe your experience with Ferry here.."
          className="w-full resize-none rounded-sm border-1 border-stroke-input bg-bg-0 px-3 py-3 text-body-regular text-text-title placeholder:text-text-body focus:outline-none" />
      </div>
    </SidePanel>
  )
}
