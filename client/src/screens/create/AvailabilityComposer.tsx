import Button from '../../components/ui/Button'
import { useState } from 'react'
import Toggle from '../../components/ui/Toggle'
import { ChevronLeft, Close, Copy, Edit, MoreVertical, Plus, Trash } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'
import { useToast } from '../../components/ui/Toast'
import Picker from '../../components/ui/Picker'
import { dayHeading } from '@shared/format'
import { BLANK_WINDOW, WEEKDAYS, availabilityFault, clockLabel, clockMinutes, dayOf, formId } from '@shared/studyForm'
import type { TimeWindow, Weekday } from '@shared/studyForm'
import { DayPick, TimePick } from './TimeBits'

const DAYS = WEEKDAYS

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-1 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-title-s text-text-title">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

/** A box in the address form. Bound, so what is typed into it is kept. */
function Field({ placeholder, value, onChange }: {
  placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      className="h-[38px] w-full rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title placeholder:text-text-body" />
  )
}

function IconBtn({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
      {children}
    </button>
  )
}

/**
 * Set Availability (1518:93042 individual video, 1518:93335 focus group video,
 * 1518:93678 in-person, 1518:94316 in-person focus group): the composer that
 * opens beside the study settings on a session study. The group flavour swaps
 * Weekly Hours for scheduled sessions and the meeting buffer for seats.
 */
export default function AvailabilityComposer({ group, address, title = 'Set Availability', onOverride, onBack, onSubmit }: {
  group: boolean; address?: boolean; title?: string; onOverride?: (editId?: string) => void; onBack: () => void; onSubmit: () => void
}) {
  const toast = useToast()
  const { draft, set, form } = useDraft()
  /**
   * The addresses on this study are the draft's own (shared/studyForm.ts), so
   * they are saved with it. The frame draws one already there; a new study has
   * none until the client adds one in the form below.
   */
  const list = draft.addresses
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const clearAddress = () => { setStreet(''); setCity(''); setZip('') }
  const addAddress = () => {
    if (!street.trim() || !city.trim()) { toast('An address needs a street and a city'); return }
    set('addresses', [...list, { id: formId('a'), title: city.trim(), detail: [street.trim(), city.trim(), zip.trim()].filter(Boolean).join(', ') }])
    clearAddress()
    toast('Address added')
  }
  const dropAddress = (id: string) => set('addresses', list.filter((y) => y.id !== id))

  /** A group session being added: its day and the time it starts. */
  const [day, setDay] = useState('')
  const [time, setTime] = useState('10:00 AM')
  const addSession = () => {
    if (!dayOf(day)) { toast('Choose the date of the session'); return }
    if (draft.sessions.some((x) => x.date === day && x.time === time)) { toast('There is already a session at that time'); return }
    set('sessions', [...draft.sessions, { id: formId('s'), date: day, time }].sort((a, b) => a.date.localeCompare(b.date) || clockMinutes(a.time) - clockMinutes(b.time)))
    setDay('')
    toast('Session added')
  }

  /** The hours offered on each weekday. A day with none is unavailable. */
  const windows = (d: Weekday): TimeWindow[] => draft.hours[d] ?? []
  const setWindows = (d: Weekday, next: TimeWindow[]) => set('hours', { ...draft.hours, [d]: next })

  const noticeNumber = (draft.notice.match(/\d+/) ?? ['10'])[0]
  const noticeUnit = /day/i.test(draft.notice) ? 'Days' : /hour/i.test(draft.notice) ? 'Hours' : 'Minutes'
  /** "1 Hour", "30 Minutes": the unit is singular for one. */
  const noticeOf = (n: string, unit: string) => `${n} ${n === '1' ? unit.replace(/s$/, '') : unit}`
  /** Submit keeps what was set only if it can be offered; otherwise it says what to fix and stays open. */
  const submit = () => {
    const fault = availabilityFault({ ...form(), availabilitySet: true })
    if (fault) { toast(fault); return }
    onSubmit()
  }

  const limits = (
    <Card title="Limits">
      {group ? (
        <label className="flex flex-col gap-1">
          <span className="text-text-regular text-text-subtitle">Seats per session</span>
          <input value={draft.seats} aria-label="Seats per session" onChange={(e) => set('seats', e.target.value)}
            className="h-[38px] rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title" />
          <span className="text-text-regular text-text-subtitle">
            {address ? 'It is a duration added between consecutive scheduled meetings.' : 'Max number of study participants'}
          </span>
        </label>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <label className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Buffer between meetings</span>
            <Picker value={draft.buffer} h="h-[38px]" className="w-full text-text-regular"
              options={['No buffer', '5 minutes', '10 minutes', '15 minutes', '30 minutes']}
              onPick={(v) => set('buffer', v)} />
          </label>
          {/* Minimum notice (1518:93678): a number and its unit, Minutes, Hours or Days, kept together as "10 Minutes". */}
          <label className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Minimum notice duration</span>
            <span className="flex h-[38px] items-center rounded-md border-1 border-stroke-input bg-bg pl-3">
              <input aria-label="Minimum notice" inputMode="numeric" value={noticeNumber} onChange={(e) => set('notice', noticeOf(e.target.value.replace(/[^\d]/g, ''), noticeUnit))}
                className="min-w-0 flex-1 bg-transparent text-text-regular text-text-title outline-none" />
              <Picker value={noticeUnit} h="h-[36px]" className="w-[120px] border-0 bg-transparent text-text-regular" options={['Minutes', 'Hours', 'Days']} onPick={(u) => set('notice', noticeOf(noticeNumber, u))} />
            </span>
          </label>
          <span className="text-text-regular text-text-subtitle">
            {address ? 'It is a duration added between consecutive scheduled meetings.' : 'It is a duration gap added between consecutive scheduled meetings.'}
          </span>
          <span className="text-text-regular text-text-subtitle">
            {address ? 'Set how many minutes or hours are required between booked slots.' : 'Set how much notice time is required to scheduled a slot before the current time.'}
          </span>
        </div>
      )}
    </Card>
  )

  const addresses = address ? (
    <Card title="Address" action={
      <Button variant="secondary" size="none" className="h-[38px] px-4" leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => toast('Fill the address in the form below, then Add Address')}>Add Address</Button>
    }>
      <p className="-mt-1 text-text-regular text-text-subtitle">
        Add your commercial addresses for participants to book in-person interviews at.
      </p>
      {list.map((a, i) => (
        <div key={a.id} className="flex items-start justify-between gap-3 rounded-sm bg-bg-2 px-4 py-3">
          <span className="flex flex-col gap-1">
            <span className="text-text-regular text-text-title">{group && `${i + 1}.\u00a0 `}{a.title}</span>
            <span className="text-text-regular text-text-title">{a.detail}</span>
          </span>
          {/* Edit lifts the address back into the form below, so adding it
              again replaces it; the kebab the group frame draws offers the
              same two things in one control. */}
          {group ? (
            <IconBtn label={`Address options for ${a.title}`}
              onClick={() => { dropAddress(a.id); setStreet(a.detail); setCity(a.title); toast('Address moved into the form to edit') }}>
              <MoreVertical className="h-4 w-4" />
            </IconBtn>
          ) : (
            <span className="flex items-center gap-2">
              <IconBtn label={`Edit ${a.title}`}
                onClick={() => { dropAddress(a.id); setStreet(a.detail); setCity(a.title); toast('Edit it below, then Add Address') }}>
                <Edit className="h-4 w-4" />
              </IconBtn>
              <IconBtn label={`Delete ${a.title}`}
                onClick={() => { dropAddress(a.id); toast(`${a.title} removed`) }}>
                <Trash className="h-4 w-4" />
              </IconBtn>
            </span>
          )}
        </div>
      ))}
      <div className="flex flex-col gap-3 rounded-sm bg-bg-2 p-3">
        <p className="text-text-regular text-text-subtitle">Add Full Address</p>
        <Field placeholder="Office number, Building/Street name, Area" value={street} onChange={setStreet} />
        <div className="grid grid-cols-2 gap-3">
          <Field placeholder="City, State" value={city} onChange={setCity} />
          <Field placeholder="Zip Code" value={zip} onChange={setZip} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="none" className="h-[38px]" onClick={addAddress}>Add Address</Button>
          <Button variant="tertiary" size="none" className="h-[38px]" onClick={clearAddress}>Cancel</Button>
        </div>
      </div>
    </Card>
  ) : null

  const hours = group ? (
    <Card title="Schedule Group Sessions">
      {draft.sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 py-3">
          <span className="flex flex-col gap-0.5">
            <span className="text-body-medium text-text-title">{dayHeading(dayOf(s.date)?.toISOString()) || s.date}</span>
            <span className="text-text-regular text-text-subtitle">{s.time} - {clockLabel(clockMinutes(s.time) + draft.duration)}</span>
          </span>
          <span className="flex items-center gap-2">
            <IconBtn label="Edit session"
              onClick={() => { set('sessions', draft.sessions.filter((x) => x.id !== s.id)); setDay(s.date); setTime(s.time); toast('Change it below, then Add') }}><Edit className="h-4 w-4" /></IconBtn>
            <IconBtn label="Delete session"
              onClick={() => { set('sessions', draft.sessions.filter((x) => x.id !== s.id)); toast('Session removed') }}><Trash className="h-4 w-4" /></IconBtn>
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 py-3">
        <span className="flex flex-col gap-0.5">
          <span className="text-body-medium text-text-title">Create new session</span>
          <span className="text-text-regular text-text-subtitle">{draft.duration} mins duration will be considered for session as set initially</span>
        </span>
        <span className="flex items-center gap-2">
          {/* The frame draws this row with no way to say when the session is; the date and start time are added so a session is the client's own. */}
          <DayPick label="Session date" value={day} onChange={setDay} />
          <TimePick label="Session start time" value={time} onPick={setTime} />
          <Button size="none" className="h-[38px] px-4" onClick={addSession}>Add</Button>
          <IconBtn label="Cancel" onClick={() => setDay('')}><Close className="h-4 w-4" /></IconBtn>
        </span>
      </div>
    </Card>
  ) : (
    <Card title="Weekly Hours">
      {DAYS.map((d) => (
        <div key={d} className="flex items-start gap-3 border-b-1 border-stroke-1 pb-3 last:border-b-0 last:pb-0">
          <span className="flex h-[38px] items-center">
            <Toggle checked={windows(d).length > 0} label={d}
              onChange={(v) => setWindows(d, v ? [{ ...BLANK_WINDOW }] : [])} />
          </span>
          <span className="flex h-[38px] w-[86px] items-center text-body-regular text-text-title">{d}</span>
          {windows(d).length > 0 ? (
            <span className="flex flex-col gap-2">
              {windows(d).map((w, i) => (
                <span key={i} className="flex items-center gap-3">
                  <TimePick label={`${d} from`} value={w.from} onPick={(v) => setWindows(d, windows(d).map((x, k) => (k === i ? { ...x, from: v } : x)))} />
                  <span className="text-text-regular text-text-subtitle">TO</span>
                  <TimePick label={`${d} to`} value={w.to} onPick={(v) => setWindows(d, windows(d).map((x, k) => (k === i ? { ...x, to: v } : x)))} />
                  <button type="button" aria-label={`Remove ${d}`}
                    onClick={() => setWindows(d, windows(d).filter((_, k) => k !== i))}
                    className="text-text-subtitle hover:text-text-title">
                    <Close className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className="flex h-[38px] items-center rounded-sm bg-bg-2 px-4 text-text-regular text-text-body">Unavailable</span>
          )}
          <span className="flex-1" />
          <IconBtn label={`Add hours to ${d}`} onClick={() => setWindows(d, [...windows(d), { ...BLANK_WINDOW }])}><Plus className="h-5 w-5" /></IconBtn>
          <IconBtn label={`Copy ${d}`}
            onClick={() => { set('hours', Object.fromEntries(DAYS.map((x) => [x, windows(d).map((w) => ({ ...w }))]))); toast(`${d}'s hours copied to every day`) }}><Copy className="h-4 w-4" /></IconBtn>
        </div>
      ))}
    </Card>
  )

  return (
    <div className="flex w-[700px] max-w-full shrink-0 flex-col overflow-hidden rounded-lg border-1 border-stroke-input">
      <div className="flex items-center gap-3 border-b-1 border-stroke-input bg-yellow-30 px-4 py-3">
        <button type="button" aria-label="Back" onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-title-s text-text-title">{title}</span>
        <span className="flex-1" />
        <span className="text-text-regular text-text-subtitle">Auto-saved</span>
        {/* The frames draw no Submit here: the top bar's Continue submits the availability (22 Oct 2026). */}
        <button type="button" hidden data-submit-availability onClick={submit} />
      </div>

      {/* The in-person frames disagree on the order: the 1:1 setup
          (1518:93678) draws Address first, the focus-group composer
          (1518:94316) draws Limits first. Each keeps its own. */}
      <div className="flex flex-col gap-4 p-4">
        {group ? <>{limits}{addresses}</> : <>{addresses}{limits}</>}
        {hours}
        {!group && (
          <Card title="Date Overrides" action={
            <Button variant="secondary" size="none" className="h-[38px] px-4" leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => onOverride?.()}>Add Override</Button>
          }>
            <p className="-mt-2 text-text-regular text-text-subtitle">
              Add dates when your availability changes from your daily hours.
            </p>
            {draft.overrides.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 py-3">
                <span className="flex flex-col gap-0.5">
                  <span className="text-body-medium text-text-title">
                    {dayHeading(dayOf(o.from)?.toISOString())}{o.to !== o.from && ` - ${dayHeading(dayOf(o.to)?.toISOString())}`}
                  </span>
                  <span className="text-text-regular text-text-subtitle">
                    {o.windows.length ? o.windows.map((w) => `${w.from} - ${w.to}`).join(', ') : 'Unavailable'}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <IconBtn label="Edit override" onClick={() => onOverride?.(o.id)}><Edit className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Delete override"
                    onClick={() => { set('overrides', draft.overrides.filter((x) => x.id !== o.id)); toast('Override removed') }}><Trash className="h-4 w-4" /></IconBtn>
                </span>
              </div>
            ))}
          </Card>
        )}
        {address && !group && (
          <div className="rounded-md border-1 border-stroke-input px-4 py-3">
            <p className="text-text-medium text-text-title">Completion Verification</p>
            <p className="pt-1 text-text-regular text-text-subtitle">A verification PIN is generated automatically for each scheduled session, to be shared with the participant to verify completion.</p>
          </div>
        )}
      </div>
    </div>
  )
}
