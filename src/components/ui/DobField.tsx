import { useState } from 'react'
import DatePicker from './DatePicker'
import Input from './Input'
import { Calendar } from './icons'

/** The adult cut-off: eighteen years ago today. */
export function eighteenYearsAgo(now: Date = new Date()) {
  return new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
}

/**
 * Date of Birth input as drawn (915:50231): typed as DD / MM / YYYY, or
 * picked from the calendar sheet behind the trailing icon.
 */
export default function DobField({
  value, onChange, onBlur, error,
}: { value: string; onChange: (v: string) => void; onBlur?: () => void; error?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Input
        label="Date of Birth" placeholder="DD  /  MM  /  YYYY" value={value} inputMode="numeric"
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={error}
        rightSlot={
          <button type="button" aria-label="Pick a date" onClick={() => setOpen(true)} className="text-text-title">
            <Calendar />
          </button>
        }
      />
      <DatePicker open={open} onClose={() => setOpen(false)} value={value} max={eighteenYearsAgo()}
        onSelect={(v) => { onChange(v); onBlur?.() }} />
    </>
  )
}
