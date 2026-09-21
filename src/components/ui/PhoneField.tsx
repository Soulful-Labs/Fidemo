import { useState } from 'react'
import Input from './Input'
import Picker from './Picker'
import { ChevronDown } from './icons'

/** Dialling codes offered by the picker; the label is what the picker shows. */
export const COUNTRY_CODES = [
  { code: '+1', label: 'United States (+1)' },
  { code: '+1', label: 'Canada (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+34', label: 'Spain (+34)' },
  { code: '+353', label: 'Ireland (+353)' },
  { code: '+64', label: 'New Zealand (+64)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+971', label: 'United Arab Emirates (+971)' },
]

/** Splits a stored "+44 7700 900123" into its code and the rest. */
export function splitPhone(full: string): { code: string; number: string } {
  const m = /^(\+\d{1,3})\s*(.*)$/.exec(full.trim())
  return m ? { code: m[1], number: m[2] } : { code: '+1', number: full.trim() }
}

export default function PhoneField({
  code, number, onChange, label = 'Phone',
}: { code: string; number: string; onChange: (next: { code: string; number: string }) => void; label?: string }) {
  const [open, setOpen] = useState(false)
  const current = COUNTRY_CODES.find((c) => c.code === code)?.label
  return (
    <>
      <Input label={label} inputMode="tel" value={number} placeholder="Enter Phone Number"
        onChange={(e) => onChange({ code, number: e.target.value.replace(/[^\d\s]/g, '') })}
        leftIcon={
          <button type="button" aria-label={`Country code ${code}`} onClick={() => setOpen(true)} className="flex items-center gap-0.5 text-body-regular text-text-title">
            {code}<ChevronDown className="h-4 w-4 text-text-body" />
          </button>
        } />
      <Picker open={open} onClose={() => setOpen(false)} title="Country code" searchable searchPlaceholder="Search country..."
        options={COUNTRY_CODES.map((c) => c.label)} value={current}
        onSelect={(label) => { const c = COUNTRY_CODES.find((x) => x.label === label); if (c) onChange({ code: c.code, number }) }} />
    </>
  )
}
