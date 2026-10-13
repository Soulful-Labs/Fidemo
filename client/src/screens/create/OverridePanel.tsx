import Button from '../../components/ui/Button'
import { useEffect, useState } from 'react'
import { BLANK_WINDOW, dayOf, formId } from '@shared/studyForm'
import type { TimeWindow } from '@shared/studyForm'
import SidePanel from '../../components/ui/SidePanel'
import Toggle from '../../components/ui/Toggle'
import { Close, Plus } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'
import { useToast } from '../../components/ui/Toast'
import { DayPick, TimePick } from './TimeBits'

const DAY = 86_400_000

/**
 * Add an override (1518:93557) and Edit override (1749:143926): the 600px
 * panel the Date Overrides card in the availability composer opens, for dates
 * whose hours differ from the weekly ones. The frame draws the dates and the
 * hours as fixed text; here they are the client's to set, and what is saved
 * is what the study is built from (shared/studyForm.ts).
 */
export default function OverridePanel({ open, onClose, editId }: { open: boolean; onClose: () => void; editId?: string }) {
  const { draft, set } = useDraft()
  const toast = useToast()
  const editing = draft.overrides.find((o) => o.id === editId)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rows, setRows] = useState<TimeWindow[]>([{ ...BLANK_WINDOW }])
  const [allDay, setAllDay] = useState(false)

  useEffect(() => {
    if (!open) return
    setFrom(editing?.from ?? ''); setTo(editing?.to ?? '')
    setRows(editing?.windows.length ? editing.windows.map((w) => ({ ...w })) : [{ ...BLANK_WINDOW }])
    setAllDay(editing ? editing.windows.length === 0 : false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId])

  const a = dayOf(from), b = dayOf(to || from)
  const days = a && b && b >= a ? Math.round((b.getTime() - a.getTime()) / DAY) + 1 : 0

  const save = () => {
    if (!a || !b) { toast('Choose the dates to override'); return }
    if (b < a) { toast('The last date is before the first'); return }
    const next = { id: editing?.id ?? formId('v'), from, to: to || from, windows: allDay ? [] : rows }
    set('overrides', editing ? draft.overrides.map((o) => (o.id === editing.id ? next : o)) : [...draft.overrides, next])
    toast(allDay ? 'Marked unavailable for those dates' : 'Override saved')
    onClose()
  }

  return (
    <SidePanel open={open} onClose={onClose} title={editing ? 'Edit override' : 'Add an override'} headerClassName="h-[56px]"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={save}>Save override</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      }>
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-title">Select dates to override</p>
        <span className="flex items-center gap-3">
          <DayPick label="Override from" value={from} onChange={setFrom} className="h-12 flex-1" />
          <span className="text-text-regular text-text-subtitle">TO</span>
          <DayPick label="Override to" value={to} onChange={setTo} className="h-12 flex-1" />
        </span>
        <p className="text-text-regular text-text-subtitle">{days} day{days === 1 ? '' : 's'} selected</p>
      </div>

      <span className="-mx-4 border-t-1 border-stroke-1" />

      <div className="flex flex-col gap-3">
        <p className="text-body-medium text-text-title">Which hours are you available?</p>
        {!allDay && rows.map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <TimePick label="Override hours from" value={w.from} className="h-12" onPick={(v) => setRows((r) => r.map((x, k) => (k === i ? { ...x, from: v } : x)))} />
            <span className="text-text-regular text-text-subtitle">TO</span>
            <TimePick label="Override hours to" value={w.to} className="h-12" onPick={(v) => setRows((r) => r.map((x, k) => (k === i ? { ...x, to: v } : x)))} />
            <button type="button" aria-label="Remove hours" onClick={() => setRows((r) => (r.length > 1 ? r.filter((_, k) => k !== i) : r))}
              className="text-text-subtitle hover:text-text-title">
              <Close className="h-4 w-4" />
            </button>
            <span className="flex-1" />
            {i === 0 && (
              <button type="button" aria-label="Add hours" onClick={() => setRows((r) => [...r, { ...BLANK_WINDOW }])}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <span className="-mx-4 border-t-1 border-stroke-1" />

      <div className="flex items-center gap-3">
        <Toggle checked={allDay} onChange={setAllDay} label="Mark Unavailable For Full Day" />
        <span className="text-body-regular text-text-title">Mark Unavailable For Full Day</span>
      </div>
    </SidePanel>
  )
}
