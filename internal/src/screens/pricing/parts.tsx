import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { VerifiedIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

/** The clock-with-arrow glyph on Version History. */
export const HistoryGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4v4h4M12 7.5V12l3 2" /></svg>
)

export const Pencil = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4M17.500 4.500l2 2L12 14l-2.500.500L10 12l7.500-7.500Z" /></svg>
)

/** A section of the overview: Title-S, a grey line under it, and its Edit button on the right. */
export function Head({ title, note, action, onEdit, extra }: { title: string; note: string; action?: string; onEdit?: () => void; extra?: ReactNode }) {
  return (
    <div className="flex items-start justify-between pb-3">
      <div><h2 className="text-title-s leading-[25px] text-text-title">{title}</h2><p className="pt-0.5 text-text-regular leading-5 text-text-body">{note}</p></div>
      <div className="flex items-center gap-3">
        {extra}
        {action && <Button size="md" className="h-[46px] px-5 text-body-medium" leftIcon={<Pencil />} onClick={onEdit}>{action}</Button>}
      </div>
    </div>
  )
}

/** A value tile on bg-1: the label, the value in Title-L, a line of what it applies to. */
export function Value({ label, value, note, className, children }: { label: string; value?: string; note?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn('rounded-lg border-1 border-stroke-1 bg-bg-1 p-4', className)}>
      <p className="text-body-regular leading-[22px] text-text-title">{label}</p>
      {value && <p className="pt-1.5 text-title-l leading-[31px] text-text-title">{value}</p>}
      {children}
      {note && <p className="pt-2.5 text-text-regular leading-5 text-text-subtitle">{note}</p>}
    </div>
  )
}

/** A field tile on an edit screen: the label, a 48px (or 38px) box with an optional unit on the right, the note. */
export function Edit({ label, value, unit, note, size = 'md', plain, onValue, readOnly }: { label: string; value: string; unit?: string; note?: string; size?: 'md' | 'sm'; plain?: boolean
  /** Typing changes the form's own value (22 Oct 2026: the screens save). Without it the field shows a fixed value. */
  onValue?: (v: string) => void; readOnly?: boolean }) {
  return (
    <div className={plain ? undefined : 'rounded-lg border-1 border-stroke-1 bg-bg-1 p-4'}>
      <label className="block text-body-regular leading-[22px] text-text-title">{label}
        <span className={cn('mt-2 flex items-center rounded-md border-1 border-stroke-input bg-bg-0 px-3', size === 'md' ? 'h-12' : 'h-[38px] rounded-sm')}>
          <input value={value} readOnly={readOnly || !onValue} onChange={(e) => onValue?.(e.target.value)} inputMode="decimal"
            className={cn('min-w-0 flex-1 bg-transparent text-text-title outline-none', size === 'md' ? 'text-body-regular' : 'text-text-regular', (readOnly || !onValue) && 'text-text-subtitle')} />
          {unit && <span className="text-label text-text-subtitle">{unit}</span>}
        </span>
      </label>
      {note && <p className="pt-3 text-text-regular leading-5 text-text-subtitle">{note}</p>}
    </div>
  )
}

export function Notes({ items }: { items: string[] }) {
  return (
    <section className="rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
      <h3 className="border-b-1 border-stroke-input pb-3 text-body-medium text-text-title">Important to know</h3>
      <ul className="flex flex-col gap-2.5 pt-4 text-text-regular text-text-title">{items.map((i) => <li key={i} className="flex items-center gap-2"><VerifiedIcon className="h-4 w-4 text-brand-secondary" />{i}</li>)}</ul>
    </section>
  )
}

/**
 * The shell of every edit screen: a two-part breadcrumb, the title and its
 * note, Cancel and Save Changes. Save asks first, then saves (22 Oct 2026).
 */
export function EditShell({ crumb, last, title, note, back, onSave, children }: { crumb: string; last: string; title: string; note: string; back: string; onSave: () => void; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <AppShell className="pb-8" crumbs={[{ label: crumb, to: back }, { label: last }]}>
      <div className="flex items-start justify-between pb-3">
        <div><h1 className="text-title-s leading-[25px] text-text-title">{title}</h1><p className="pt-0.5 text-text-regular leading-5 text-text-body">{note}</p></div>
        <div className="flex gap-4"><Button variant="tertiary" className="px-5" onClick={() => navigate(back)}>Cancel</Button><Button className="px-5" onClick={onSave}>Save Changes</Button></div>
      </div>
      {children}
    </AppShell>
  )
}
