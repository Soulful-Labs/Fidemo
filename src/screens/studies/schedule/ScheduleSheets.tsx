import { useState } from 'react'
import BottomSheet from '../../../components/ui/BottomSheet'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import { Calendar, Clock } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { Study } from '../../../mock/types'

/**
 * Agreement sheet (PRD 6.10 step 3, Figma 1433:48739). Conflict 20: the
 * recording wording needs legal review; it is shown as drawn until then.
 */
export function AgreementSheet({ open, onClose, onAgree }: { open: boolean; onClose: () => void; onAgree: () => void }) {
  const [agreed, setAgreed] = useState(false)
  return (
    <BottomSheet open={open} onClose={onClose} title="Agreement"
      footer={<Button fullWidth disabled={!agreed} onClick={onAgree}>Agree &amp; Join</Button>}>
      <div className="flex flex-col gap-3">
        <p className="text-body-medium text-text-title">Call Recording</p>
        <p className="text-text-regular text-text-subtitle">
          This sessions gets recorded for the quality and proof purposes to analyze and refer your valuable
          insights. And it is not shared to any third parties.
        </p>
        <span className="h-px w-full bg-stroke-3" />
        <Checkbox checked={agreed} onChange={setAgreed}
          label={<>I agree to this HumanLayer&apos;s <span className="text-body-medium text-text-title">Policy</span></>} />
      </div>
    </BottomSheet>
  )
}

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** "Select Session Location" (PRD 6.10 step 2, Figma 966:14461). */
export function LocationSheet({
  open, onClose, locations, value, onSave,
}: { open: boolean; onClose: () => void; locations: NonNullable<Study['locations']>; value?: string; onSave: (id: string) => void }) {
  const [draft, setDraft] = useState(value ?? locations[0]?.id)
  return (
    <BottomSheet open={open} onClose={onClose} title="Select Session Location"
      subtitle="You can choose any nearby location to do the interview session."
      footer={<Button fullWidth onClick={() => { if (draft) onSave(draft) }}>Save</Button>}>
      <div className="flex flex-col gap-2">
        {locations.map((location) => {
          const on = draft === location.id
          return (
            <button key={location.id} type="button" role="radio" aria-checked={on} onClick={() => setDraft(location.id)}
              className={cn('flex items-start gap-3 rounded-md border-1 p-3 text-left text-body-regular',
                on ? 'border-yellow-700 bg-yellow-1000/50 text-brand-primary' : 'border-transparent bg-bg-1 text-text-title')}>
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5', on ? 'border-brand-primary' : 'border-text-subtitle')}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
              </span>
              {location.address}
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}

/** "Review Schedule" (PRD 6.10 step 4, Figma 968:16719). */
export function ReviewSheet({
  open, onClose, date, slot, address, isReschedule, onConfirm,
}: { open: boolean; onClose: () => void; date: string; slot: string; address?: string; isReschedule: boolean; onConfirm: () => void }) {
  const d = new Date(date)
  const dateLabel = `${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
  const row = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-text-regular text-brand-secondary">{icon}{label}</p>
      <p className="text-body-medium text-text-title">{value}</p>
    </div>
  )
  return (
    <BottomSheet open={open} onClose={onClose} title="Review Schedule"
      footer={<Button fullWidth onClick={onConfirm}>{isReschedule ? 'Confirm Reschedule' : 'Confirm & Schedule'}</Button>}>
      <div className="flex flex-col gap-4">
        {row(<Calendar className="h-5 w-5" />, 'Date', dateLabel)}
        {row(<Clock className="h-5 w-5" />, 'Time', slot)}
        {address && row(<Pin />, 'Location Address', address)}
        <p className="text-text-regular text-text-body">Review these details carefully and confirm the session appointment</p>
        <p className="rounded-md bg-yellow-1000/40 px-3 py-2 text-text-regular text-text-subtitle">
          At the end of the session a code is shown to you and the moderator. You both enter it to confirm attendance. No code, no payment.
        </p>
      </div>
    </BottomSheet>
  )
}
