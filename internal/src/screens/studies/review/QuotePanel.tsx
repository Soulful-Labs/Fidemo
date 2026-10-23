import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { Checkbox } from '../../../components/ui/controls'
import { Modal } from '../../../components/ui/Overlay'
import { notice } from '../../../components/app/Notice'
import { TEAM, usePlatform } from '../../../platform'
import { currentRate } from '@shared/derive'
import { money } from '@shared/format'
import { hoursOf, proposedSegment, quoteFrom, RATE_CARD, segmentLabel } from '@shared/ratecard'
import { platform } from '@shared/store'
import type { Study } from '@shared/types'

const Line = ({ label, amount, sub, bold }: { label: string; amount: string; sub?: string; bold?: boolean }) => (
  <p className={`flex justify-between gap-4 text-text-regular leading-5 text-text-title ${bold ? 'font-medium' : ''}`}><span>{label}{sub && <span className="block text-text-subtitle">{sub}</span>}</span><span>{amount}</span></p>
)

/**
 * Quote from the rate card (review Payment tab, 24 Oct 2026). Team only: the
 * client never sees this panel or the rate card. The team picks the segment
 * and size band, the hours and any flat add-ons; the panel works the price out
 * (setup, plus cost per recruit times participants, plus the incentive guide
 * times hours times participants, plus add-ons, over the participants), at the
 * lower end of each range with the top beside it. "Apply this quote" sets the
 * study's cost per interview and incentive; either can then be adjusted.
 */
export function QuotePanel({ study }: { study: Study }) {
  usePlatform() // re-render when the card or the study changes
  const card = RATE_CARD.current
  const fallbackHours = study.quote?.hours ?? hoursOf(study.durationMins)
  const [segmentId, setSegmentId] = useState(study.quote?.segmentId ?? proposedSegment(card, study.required, fallbackHours)?.id ?? card.segments[0]?.id ?? '')
  const [hours, setHours] = useState(String(Math.round(fallbackHours * 100) / 100))
  const [addOns, setAddOns] = useState<string[]>(study.quote?.addOnIds ?? [])
  const [incentiveOpen, setIncentiveOpen] = useState(false)
  const h = Number(hours)
  const q = useMemo(() => quoteFrom(card, segmentId, study.required, h, addOns), [card, segmentId, study.required, h, addOns])
  const labelOf = (id: string) => { const s = card.segments.find((x) => x.id === id); return s ? `${segmentLabel(s)}${s.section ? ` (${s.section})` : ''}` : '' }
  const flat = card.fees.filter((f) => f.unit === 'flat' && f.amount.min != null)
  const apply = () => { const r = platform().applyRateCardQuote(study.id, segmentId, h, addOns, TEAM); notice(r.ok ? 'Quote applied: the cost per interview and the incentive are set' : r.why) }
  const cpi = currentRate(study), incentive = study.rates.incentivePer
  return (
    <section aria-label="Quote from the rate card" className="flex flex-col gap-3 rounded-lg border-1 border-stroke-1 p-4">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-title-s text-text-title">Quote from the rate card</h2><p className="text-text-regular text-text-subtitle">Team only. The client sees the cost per interview; the participant sees the incentive.</p></div>
        <div className="flex gap-2"><Button variant="secondary" size="md" className="px-3" onClick={() => setIncentiveOpen(true)}>Change Incentive</Button></div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-text-regular">
        <p className="flex flex-col rounded-md bg-bg-1 px-3 py-2 text-text-subtitle">Cost per interview<span className="text-title-m text-text-title">{money(cpi)}</span></p>
        <p className="flex flex-col rounded-md bg-bg-1 px-3 py-2 text-text-subtitle">Incentive per participant<span className="text-title-m text-text-title">{incentive > 0 ? money(incentive) : 'Not set'}</span></p>
        <p className="flex flex-col rounded-md bg-bg-1 px-3 py-2 text-text-subtitle">Participants<span className="text-title-m text-text-title">{study.required}</span></p>
      </div>
      {incentive > cpi && <p role="status" className="rounded-md bg-yellow-30 px-3 py-2 text-text-regular text-text-title">The incentive is above the cost per interview: the platform pays each participant more than the client is charged for them.</p>}
      {!(incentive > 0) && <p role="alert" className="text-text-regular text-state-danger">Set the incentive before this study can go live.</p>}
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <Select label="Segment and size band" value={labelOf(segmentId)} options={card.segments.map((s) => labelOf(s.id))} onChange={(v) => setSegmentId(card.segments.find((s) => labelOf(s.id) === v)?.id ?? segmentId)} />
        <label className="flex flex-col gap-1 text-text-regular text-text-subtitle">Hours
          <input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" aria-label="Hours" className="h-12 rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-body-regular text-text-title outline-none" />
        </label>
      </div>
      {flat.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">{flat.map((f) => <Checkbox key={f.id} checked={addOns.includes(f.id)} onChange={(on) => setAddOns((a) => (on ? [...a, f.id] : a.filter((x) => x !== f.id)))} label={`${f.item} (${money(f.amount.min!)})`} />)}</div>
      )}
      {q ? (
        <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-3">
          <Line label="Setup" amount={money(q.setup)} sub={q.segment.setupNote || undefined} />
          <Line label={`Cost per recruit, ${money(q.cpr)} x ${q.participants}`} amount={money(q.recruitment)} sub={q.segment.cprNote || undefined} />
          <Line label={`Incentive, ${money(q.segment.incentive.min!)} ${q.segment.incentiveUnit} x ${q.hours} x ${q.participants}`} amount={money(q.incentives)} sub={q.segment.incentiveNote || undefined} />
          {q.addOns.map((a) => <Line key={a.id} label={a.label} amount={money(a.amount)} />)}
          <Line bold label="Total" amount={money(q.total)} sub={`Top of every range: ${money(q.high.total)}`} />
          <Line bold label="Cost per interview" amount={money(q.cpi)} sub={`Top of every range: ${money(q.high.cpi)}. Incentive proposed: ${money(q.incentive)}`} />
        </div>
      ) : <p className="text-text-regular text-text-subtitle">This segment cannot be quoted for these hours: a figure the sum needs is blank on the rate card. Fill it in on Edit Clients Fees, or set the cost per interview by hand.</p>}
      <Button size="md" className="self-start px-4" disabled={!q} onClick={apply}>Apply this quote</Button>
      <ChangeIncentive open={incentiveOpen} onClose={() => setIncentiveOpen(false)} study={study} />
    </section>
  )
}

/**
 * Change Incentive (24 Oct 2026), the same shape as Change CPI Rate: what
 * each participant is paid. It warns, and does not stop, when the incentive
 * is above the cost per interview. A change applies to participants who
 * complete after it; anyone already paid keeps what they were paid.
 */
export function ChangeIncentive({ open, onClose, study }: { open: boolean; onClose: () => void; study: Study }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setValue(study.rates.incentivePer > 0 ? String(study.rates.incentivePer) : ''); setError('') } }, [open, study])
  const amount = Number(value.replace(/[$,\s]/g, ''))
  const over = Number.isFinite(amount) && amount > currentRate(study)
  const submit = () => {
    const res = platform().setStudyIncentive(study.id, amount, TEAM)
    if (!res.ok) { setError(res.why); return }
    notice(`The incentive is now ${money(amount)} per participant`)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Change Incentive"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
      <div className="flex flex-col gap-4 text-text-regular leading-5">
        <p className="text-body-regular text-text-subtitle">Changing the incentive updates what each participant is paid. It applies to participants who complete after the change; anyone already paid keeps what they were paid.</p>
        <label className="flex flex-col gap-2 text-body-regular text-text-subtitle">Incentive
          <span className="flex h-12 items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3">
            <span className="text-title-s text-text-title">$</span>
            <input value={value} onChange={(e) => { setValue(e.target.value); setError('') }} inputMode="decimal" aria-label="Incentive"
              className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none" />
            <span className="text-text-subtitle">Per Participant</span>
          </span>
        </label>
        {over && <p role="status" className="rounded-md bg-yellow-30 px-3 py-2 text-text-title">This is above the cost per interview ({money(currentRate(study))}). You can still submit it, for a hard study, on purpose.</p>}
        {error && <p role="alert" className="text-state-danger">{error}</p>}
      </div>
    </Modal>
  )
}
