import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import BottomSheet from './BottomSheet'
import Button from './Button'
import { ChevronDown } from './icons'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const pad = (n: number) => String(n).padStart(2, '0')

/** "DD / MM / YYYY" as the forms hold it. */
export const formatDob = (d: Date) => `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`
export function parseDob(value: string): Date | undefined {
  const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(value.trim())
  if (!m) return undefined
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? undefined : d
}

export interface DatePickerProps {
  open: boolean
  onClose: () => void
  value: string
  onSelect: (value: string) => void
  title?: string
  /** Latest selectable date, e.g. 18 years ago for a date of birth. */
  max?: Date
  min?: Date
}

/** A calendar sheet for dates of birth: month and year steppers, then a day grid. */
export default function DatePicker({ open, onClose, value, onSelect, title = 'Date of Birth', max, min }: DatePickerProps) {
  const start = parseDob(value) ?? max ?? new Date()
  const [year, setYear] = useState(start.getFullYear())
  const [month, setMonth] = useState(start.getMonth())
  const [picked, setPicked] = useState<Date | undefined>(parseDob(value))

  useEffect(() => {
    if (!open) return
    const d = parseDob(value) ?? max ?? new Date()
    setYear(d.getFullYear()); setMonth(d.getMonth()); setPicked(parseDob(value))
  }, [open, value, max])

  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(offset).fill(undefined), ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))] as (Date | undefined)[]
  const outside = (d: Date) => (max ? d > max : false) || (min ? d < min : false)
  const same = (a?: Date, b?: Date) => Boolean(a && b) && a!.toDateString() === b!.toDateString()

  const step = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear()); setMonth(d.getMonth())
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}
      footer={<Button fullWidth disabled={!picked} onClick={() => { if (picked) { onSelect(formatDob(picked)); onClose() } }}>Save</Button>}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-2 text-text-title"><ChevronDown className="h-5 w-5 rotate-90" /></button>
          <span className="flex-1 text-center text-body-medium text-text-title">{MONTHS[month]}</span>
          <button type="button" aria-label="Next month" onClick={() => step(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-2 text-text-title"><ChevronDown className="h-5 w-5 -rotate-90" /></button>
          <select aria-label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="h-8 rounded-sm border-1 border-stroke-3 bg-bg-1 px-2 text-text-medium text-text-title outline-none">
            {Array.from({ length: 100 }, (_, i) => (max ?? new Date()).getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-label text-text-body">
          {DAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          {cells.map((d, i) => d ? (
            <button key={d.toISOString()} type="button" disabled={outside(d)} onClick={() => setPicked(d)} aria-pressed={same(d, picked)}
              className={cn('h-9 rounded-sm text-text-regular transition-colors',
                same(d, picked) ? 'bg-brand-primary text-cta-primaryText' : outside(d) ? 'text-text-disabled' : 'text-text-title hover:bg-bg-2')}>
              {d.getDate()}
            </button>
          ) : <span key={`e${i}`} />)}
        </div>
        {picked && <p className="text-center text-text-regular text-text-subtitle">{formatDob(picked)}</p>}
      </div>
    </BottomSheet>
  )
}
