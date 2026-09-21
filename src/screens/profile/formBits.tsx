import { useState } from 'react'
import type { ReactNode } from 'react'
import Picker from '../../components/ui/Picker'
import SelectField from '../../components/ui/SelectField'
import Tag from '../../components/ui/Tag'
import { ChevronDown } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

/** "My Profile 2/4 ^" section head with the helper line (Figma 979:74128). */
export function SectionHead({
  title, done, total, helper, open, onToggle,
}: { title: string; done: number; total: number; helper: string; open: boolean; onToggle: () => void }) {
  const complete = done >= total
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full flex-col gap-1 border-b-1 border-stroke-2 pb-3 text-left">
      <span className="flex items-center gap-2">
        <span className="text-title-s text-text-title">{title}</span>
        <Tag tone={complete ? 'green' : 'neutral'} className="ml-auto" icon={complete ? <VerifiedDot /> : undefined}>{done}/{total}</Tag>
        <ChevronDown className={cn('h-5 w-5 text-text-title transition-transform', open && 'rotate-180')} />
      </span>
      <span className="text-text-regular text-text-body">{helper}</span>
    </button>
  )
}

function VerifiedDot() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )
}

/** A select field backed by the shared Picker sheet (single value). */
export function PickField({
  label, value, placeholder, options, onChange, title, searchable,
}: { label: string; value: string; placeholder: string; options: string[]; onChange: (v: string) => void; title?: string; searchable?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SelectField label={label} value={value} placeholder={placeholder} onOpen={() => setOpen(true)} />
      <Picker open={open} onClose={() => setOpen(false)} title={title ?? label} options={options} value={value} onSelect={onChange} searchable={searchable} />
    </>
  )
}

/** A multi-select backed by the Picker, with removable chips underneath. */
export function MultiPickField({
  label, values, placeholder, options, onChange, title, max,
}: { label: string; values: string[]; placeholder: string; options: string[]; onChange: (v: string[]) => void; title?: string; max?: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <SelectField label={label} placeholder={placeholder} onOpen={() => setOpen(true)} />
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <Tag key={v} tone="neutral" size="md" onRemove={() => onChange(values.filter((x) => x !== v))}>{v}</Tag>
          ))}
        </div>
      )}
      <Picker open={open} onClose={() => setOpen(false)} title={title ?? label} subtitle={max ? `Select up to ${max}` : undefined}
        options={options} value={values} multiple onSelect={() => undefined}
        onApply={(next) => onChange(max ? next.slice(0, max) : next)} />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      {children}
    </div>
  )
}
