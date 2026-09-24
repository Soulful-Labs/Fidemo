import Button from '../../components/ui/Button'
import SidePanel from '../../components/ui/SidePanel'
import Toggle from '../../components/ui/Toggle'
import { Calendar, Close, Plus } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'

function Time({ value }: { value: string }) {
  return (
    <span className="flex h-12 w-[100px] items-center rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular text-text-title">
      {value}
    </span>
  )
}

/**
 * Add an override (1518:93557): the 600px panel the Date Overrides card in
 * the availability composer opens, for a date whose hours differ from the
 * weekly ones.
 */
export default function OverridePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { draft, set } = useDraft()

  return (
    <SidePanel open={open} onClose={onClose} title="Add an override" headerClassName="h-[56px]"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={onClose}>Save override</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      }>
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-title">Select dates to override</p>
        <span className="relative flex">
          <span className="flex h-12 w-full items-center rounded-sm border-1 border-stroke-input bg-bg px-4 pr-11 text-text-regular text-text-title">
            Aug 20 - Aug 30
          </span>
          <Calendar className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-text-subtitle" />
        </span>
        <p className="text-text-regular text-text-subtitle">11 days selected</p>
      </div>

      <span className="-mx-4 border-t-1 border-stroke-1" />

      <div className="flex flex-col gap-3">
        <p className="text-body-medium text-text-title">Which hours are you available?</p>
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Time value="12:00 AM" />
            <span className="text-text-regular text-text-subtitle">TO</span>
            <Time value="12:00 AM" />
            <button type="button" aria-label="Remove hours" className="text-text-subtitle hover:text-text-title">
              <Close className="h-4 w-4" />
            </button>
            <span className="flex-1" />
            {i === 0 && (
              <button type="button" aria-label="Add hours"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <span className="-mx-4 border-t-1 border-stroke-1" />

      <div className="flex items-center gap-3">
        <Toggle checked={draft.unavailableAllDay} onChange={(v) => set('unavailableAllDay', v)} label="Mark Unavailable For Full Day" />
        <span className="text-body-regular text-text-title">Mark Unavailable For Full Day</span>
      </div>
    </SidePanel>
  )
}
