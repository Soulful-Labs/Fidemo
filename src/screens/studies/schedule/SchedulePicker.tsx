import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { ArrowLeft, Calendar, ChevronRight, Clock } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { Study } from '../../../mock/types'

/** The slot grid drawn in Figma; a study's availability enables a subset. */
export const SLOT_GRID = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:30 PM', '04:00 PM']

const DAY = 86_400_000
const dayKey = (iso: string) => new Date(iso).toDateString()

export interface Selection {
  date?: string
  slot?: string
  locationId?: string
}

export function SectionHeading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-body-medium text-brand-secondary">{icon}{title}</p>
      <p className="text-text-regular text-text-body">{sub}</p>
    </div>
  )
}

/**
 * "Pick a date" week strip and "Pick a time slot" grid (PRD 6.10, Figma
 * 919:75357). Only dates in the study's availability are enabled, and only
 * the slots open on the chosen date.
 */
export default function SchedulePicker({
  study, value, onChange, onBlocked,
}: { study: Study; value: Selection; onChange: (next: Selection) => void; onBlocked: (reason: string) => void }) {
  const availability = study.availability ?? []
  const first = availability[0]?.date ?? new Date().toISOString()
  const [weekStart, setWeekStart] = useState(() => new Date(first).setHours(0, 0, 0, 0))

  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart + i * DAY))
  const byDay = new Map(availability.map((a) => [dayKey(a.date), a]))
  const chosenDay = value.date ? byDay.get(dayKey(value.date)) : undefined
  const monthLabel = days[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <section className="flex flex-col gap-4">
        <SectionHeading icon={<Calendar className="h-5 w-5" />} title="Pick a date" sub="Only available dates are shown" />
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous week" onClick={() => setWeekStart((w) => w - 7 * DAY)}
            className="flex h-10 w-10 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-body-medium text-text-title">{monthLabel}</span>
          <button type="button" aria-label="Next week" onClick={() => setWeekStart((w) => w + 7 * DAY)}
            className="flex h-10 w-10 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const slot = byDay.get(day.toDateString())
            const on = Boolean(slot && value.date && dayKey(value.date) === day.toDateString())
            return (
              <button
                key={day.toISOString()}
                type="button"
                aria-disabled={!slot}
                aria-pressed={on}
                onClick={() => (slot ? onChange({ ...value, date: slot.date, slot: undefined }) : onBlocked('No sessions on this day'))}
                className={cn(
                  'flex h-btn flex-col items-center justify-center rounded-md text-text-medium',
                  on ? 'bg-cta-primary text-cta-primaryText' : slot ? 'text-text-title hover:bg-bg-1' : 'text-text-disabled',
                )}
              >
                <span className="text-body-medium">{day.getDate()}</span>
                <span className="text-label">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </button>
            )
          })}
        </div>
      </section>

      <span className="h-px w-full bg-stroke-2" />

      <section className="flex flex-col gap-4">
        <SectionHeading icon={<Clock className="h-5 w-5" />} title="Pick a time slot" sub="All times in US Eastern" />
        <div className="grid grid-cols-2 gap-2">
          {SLOT_GRID.map((slot) => {
            const open = Boolean(chosenDay?.slots.includes(slot))
            const on = value.slot === slot
            return (
              <Button
                key={slot}
                variant={on ? 'secondary' : 'tertiary'}
                disabled={!open}
                onBlocked={() => onBlocked(chosenDay ? 'This slot is already taken' : 'Pick a date first')}
                onClick={() => onChange({ ...value, slot })}
                aria-pressed={on}
              >
                {slot}
              </Button>
            )
          })}
        </div>
      </section>
    </>
  )
}
