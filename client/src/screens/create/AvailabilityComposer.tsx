import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Toggle from '../../components/ui/Toggle'
import { ChevronLeft, Close, Copy, Edit, MoreVertical, Plus, Trash } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-1 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-title-s leading-[22px] text-text-title">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

/** A plain box in the address form. */
function Field({ placeholder }: { placeholder: string }) {
  return (
    <input placeholder={placeholder}
      className="h-[38px] w-full rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title placeholder:text-text-body" />
  )
}

function Time({ value }: { value: string }) {
  return (
    <span className="flex h-[38px] w-[100px] items-center rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular text-text-title">
      {value}
    </span>
  )
}

function IconBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label}
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
  group: boolean; address?: boolean; title?: string; onOverride?: () => void; onBack: () => void; onSubmit: () => void
}) {
  const { draft, set } = useDraft()

  const limits = (
    <Card title="Limits">
      {group ? (
        <label className="flex flex-col gap-1">
          <span className="text-text-regular text-text-subtitle">Seats per session</span>
          <span className="flex h-[38px] items-center rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
            {draft.seats}
          </span>
          <span className="text-text-regular text-text-subtitle">
            {address ? 'It is a duration added between consecutive scheduled meetings.' : 'Max number of study participants'}
          </span>
        </label>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <label className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Buffer between meetings</span>
            <Select value={draft.buffer} className="w-full" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Minimum notice duration</span>
            <Select value={draft.notice} className="w-full" />
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
      <Button variant="secondary" size="none" className="h-[38px] px-4" leftIcon={<Plus className="h-4 w-4" />}>Add Address</Button>
    }>
      <p className="-mt-1 text-text-regular text-text-subtitle">
        Add your commercial addresses for participants to book in-person interviews at.
      </p>
      <div className="flex items-start justify-between gap-3 rounded-sm bg-bg-2 px-4 py-3">
        <span className="flex flex-col gap-1">
          <span className="text-text-regular text-text-title">{group && '1.  '}Carolina, Texas, USA</span>
          <span className="text-text-regular text-text-title">A-123, Empire State, Hamburg Street 2, Carolina, Texas, USA - 10001</span>
        </span>
        {group ? (
          <IconBtn label="Address options"><MoreVertical className="h-4 w-4" /></IconBtn>
        ) : (
          <span className="flex items-center gap-2">
            <IconBtn label="Edit address"><Edit className="h-4 w-4" /></IconBtn>
            <IconBtn label="Delete address"><Trash className="h-4 w-4" /></IconBtn>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 rounded-sm bg-bg-2 p-3">
        <p className="text-text-regular text-text-subtitle">Add Full Address</p>
        <Field placeholder="Office number, Building/Street name, Area" />
        <div className="grid grid-cols-2 gap-3">
          <Field placeholder="City, State" />
          <Field placeholder="Zip Code" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="none" className="h-[38px]">Add Address</Button>
          <Button variant="tertiary" size="none" className="h-[38px]">Cancel</Button>
        </div>
      </div>
    </Card>
  ) : null

  const hours = group ? (
    <Card title="Schedule Group Sessions">
      {draft.sessions.map((s) => (
        <div key={s.date} className="flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 py-3">
          <span className="flex flex-col gap-0.5">
            <span className="text-body-medium text-text-title">{s.date}</span>
            <span className="text-text-regular text-text-subtitle">{s.time}</span>
          </span>
          <span className="flex items-center gap-2">
            <IconBtn label="Edit session"><Edit className="h-4 w-4" /></IconBtn>
            <IconBtn label="Delete session"><Trash className="h-4 w-4" /></IconBtn>
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 py-3">
        <span className="flex flex-col gap-0.5">
          <span className="text-body-medium text-text-title">Create new session</span>
          <span className="text-text-regular text-text-subtitle">40 mins duration will be considered for session as set initially</span>
        </span>
        <span className="flex items-center gap-2">
          <Button size="none" className="h-[38px] px-4">Add</Button>
          <IconBtn label="Cancel"><Close className="h-4 w-4" /></IconBtn>
        </span>
      </div>
    </Card>
  ) : (
    <Card title="Weekly Hours" action={onOverride && (
      <Button variant="tertiary" size="none" className="h-[38px] px-4" leftIcon={<Plus className="h-4 w-4" />}
        onClick={onOverride}>Add an override</Button>
    )}>
      {DAYS.map((d) => (
        <div key={d} className="flex items-center gap-3 border-b-1 border-stroke-1 pb-3 last:border-b-0 last:pb-0">
          <Toggle checked={draft.days.includes(d)} label={d}
            onChange={(v) => set('days', v ? [...draft.days, d] : draft.days.filter((x) => x !== d))} />
          <span className="w-[86px] text-text-regular text-text-title">{d}</span>
          <Time value="12:00 AM" />
          <span className="text-text-regular text-text-subtitle">TO</span>
          <Time value="12:00 AM" />
          <button type="button" aria-label={`Remove ${d}`} className="text-text-subtitle hover:text-text-title">
            <Close className="h-4 w-4" />
          </button>
          <span className="flex-1" />
          <IconBtn label={`Add hours to ${d}`}><Plus className="h-5 w-5" /></IconBtn>
          <IconBtn label={`Copy ${d}`}><Copy className="h-4 w-4" /></IconBtn>
        </div>
      ))}
    </Card>
  )

  return (
    <div className="flex w-[628px] shrink-0 flex-col overflow-hidden rounded-lg border-1 border-stroke-input">
      <div className="flex items-center gap-3 border-b-1 border-stroke-input bg-yellow-30 px-4 py-3">
        <button type="button" aria-label="Back" onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-title-s text-text-title">{title}</span>
        <span className="flex-1" />
        <span className="text-text-regular text-text-subtitle">Auto-saved</span>
        <Button size="row" onClick={onSubmit}>Submit</Button>
      </div>

      {/* The in-person frames disagree on the order: the 1:1 setup
          (1518:93678) draws Address first, the focus-group composer
          (1518:94316) draws Limits first. Each keeps its own. */}
      <div className="flex flex-col gap-4 p-4">
        {group ? <>{limits}{addresses}</> : <>{addresses}{limits}</>}
        {hours}
      </div>
    </div>
  )
}
