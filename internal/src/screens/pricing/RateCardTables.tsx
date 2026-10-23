import { useState } from 'react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { notice } from '../../components/app/Notice'
import { feeLabel, feesCsv, segmentLabel, segmentsCsv } from '@shared/ratecard'
import { save } from '@shared/files'
import type { RateCard, RateFee, RateRange, RateSegment } from '@shared/types'

/** A range as the sheet writes it: "135 to 165", "500", or blank. */
export const rangeText = (r: RateRange, unit = '') => (r.min == null && r.max == null ? '' : `$${r.min ?? '?'}${r.max != null && r.max !== r.min ? ` to $${r.max}` : ''}${unit ? ` ${unit}` : ''}`)

/** The two CSVs, in the team's own columns, saved to the computer. */
export function ExportButtons({ card }: { card: RateCard }) {
  const out = (name: string, body: string) => notice(`Saved ${save(name, new Blob([body], { type: 'text/csv;charset=utf-8' }))}`)
  return (
    <div className="flex gap-2">
      <Button variant="tertiary" size="md" className="px-3" onClick={() => out('rate-card.csv', segmentsCsv(card))}>Export rate card CSV</Button>
      <Button variant="tertiary" size="md" className="px-3" onClick={() => out('rate-card-fees.csv', feesCsv(card))}>Export fees CSV</Button>
    </div>
  )
}

/**
 * The rate card, read only (Pricing & Rewards, 24 Oct 2026): every segment at
 * its size band with setup, cost per recruit and the incentive guide, then the
 * fees, adjustments and rules. Team only: no client screen reads it.
 */
export function RateCardView({ card }: { card: RateCard }) {
  const th = 'px-3 py-2 text-left text-text-regular font-normal text-text-subtitle'
  const td = 'px-3 py-2 align-top text-text-regular text-text-title'
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border-1 border-stroke-1">
        <table className="w-full min-w-[960px] border-collapse">
          <thead className="bg-bg-1"><tr>{['Segment', 'Level', 'Size band', 'Setup', 'Cost per recruit', 'Incentive guide'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>
            {card.segments.map((s) => (
              <tr key={s.id} className="border-t-1 border-stroke-1">
                <td className={td}>{s.segment}<span className="block text-text-subtitle">{s.section}</span></td>
                <td className={td}>{s.level}{s.criteria && <span className="block text-text-subtitle">{s.criteria}</span>}</td>
                <td className={td}>{s.sizeBand}</td>
                <td className={td}>{rangeText(s.setup)}{s.setupNote && <span className="block text-text-subtitle">{s.setupNote}</span>}</td>
                <td className={td}>{rangeText(s.cpr)}{s.cprNote && <span className="block text-text-subtitle">{s.cprNote}</span>}</td>
                <td className={td}>{rangeText(s.incentive, s.incentiveUnit)}{s.incentiveNote && <span className="block text-text-subtitle">{s.incentiveNote}</span>}</td>
              </tr>
            ))}
            {card.segments.length === 0 && <tr><td className={td} colSpan={6}>No segments on the rate card yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['Standard fee', 'Additional fee', 'Adjustment', 'Rule'].map((g) => (
          <div key={g} className="rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
            <h4 className="pb-2 text-body-medium text-text-title">{g === 'Rule' ? 'Rules' : `${g}s`}</h4>
            {card.fees.filter((f) => f.group === g).map((f) => (
              <p key={f.id} className="flex justify-between gap-4 border-t-1 border-stroke-input py-2 text-text-regular first-of-type:border-t-0">
                <span className="text-text-title">{f.item}{f.note && <span className="block text-text-subtitle">{f.note}</span>}</span>
                <span className="shrink-0 text-text-title">{f.unit === 'percent uplift' ? `${f.amount.min}${f.amount.max !== f.amount.min ? ` to ${f.amount.max}` : ''}%` : rangeText(f.amount, f.unit === 'flat' ? '' : f.unit)}</span>
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A text cell of the editor. */
function Cell({ value, onChange, label, wide, flagged }: { value: string; onChange: (v: string) => void; label: string; wide?: boolean; flagged?: boolean }) {
  return (
    <label className={cn('flex flex-col gap-1 text-label text-text-subtitle', wide && 'col-span-2')}>{label}
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} placeholder={flagged ? 'Fill in: not read from the file' : ''}
        className={cn('h-9 rounded-sm border-1 bg-bg-0 px-2 text-text-regular text-text-title outline-none', flagged ? 'border-state-danger' : 'border-stroke-input')} />
    </label>
  )
}

/** A number cell: blank is blank; anything else that is not a number is shown in red and not saved. */
function NumCell({ value, onChange, label, flagged }: { value: number | null; onChange: (v: number | null) => void; label: string; flagged?: boolean }) {
  const [text, setText] = useState(value == null ? '' : String(value))
  const bad = text.trim() !== '' && !/^\d+(\.\d+)?$/.test(text.trim().replace(/[$,]/g, ''))
  return (
    <label className="flex flex-col gap-1 text-label text-text-subtitle">{label}
      <input value={text} inputMode="decimal" aria-label={label} placeholder={flagged ? 'Fill in' : ''}
        onChange={(e) => { setText(e.target.value); const t = e.target.value.trim().replace(/[$,]/g, ''); if (t === '') onChange(null); else if (/^\d+(\.\d+)?$/.test(t)) onChange(Number(t)) }}
        className={cn('h-9 w-full rounded-sm border-1 bg-bg-0 px-2 text-text-regular text-text-title outline-none', bad || (flagged && value == null) ? 'border-state-danger' : 'border-stroke-input')} />
    </label>
  )
}

const newId = () => `rc-new-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`

/**
 * The rate card, editable (Edit Clients Fees, 24 Oct 2026): every cell of
 * every segment and fee, and rows added by hand. `flags` are the cells an
 * upload could not read, keyed "label|column": they are drawn in red until
 * filled. Nothing saves here; Save Changes does.
 */
export function RateCardEditor({ card, onChange, flags }: { card: RateCard; onChange: (c: RateCard) => void; flags: Set<string> }) {
  const setSeg = (i: number, patch: Partial<RateSegment>) => onChange({ ...card, segments: card.segments.map((s, k) => (k === i ? { ...s, ...patch } : s)) })
  const setFee = (i: number, patch: Partial<RateFee>) => onChange({ ...card, fees: card.fees.map((f, k) => (k === i ? { ...f, ...patch } : f)) })
  const flagged = (label: string, col: string) => flags.has(`${label}|${col}`)
  const range = (r: RateRange, end: 'min' | 'max', v: number | null): RateRange => ({ ...r, [end]: v })
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-s text-text-title">Segments</h3>
      {card.segments.map((s, i) => {
        const label = segmentLabel(s)
        return (
          <section key={s.id} aria-label={`Segment ${label}`} className="grid grid-cols-6 gap-3 rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
            <Cell label="Section" value={s.section} onChange={(v) => setSeg(i, { section: v })} />
            <Cell label="Segment" value={s.segment} onChange={(v) => setSeg(i, { segment: v })} wide />
            <Cell label="Level" value={s.level} onChange={(v) => setSeg(i, { level: v })} />
            <Cell label="Size band" value={s.sizeBand} onChange={(v) => setSeg(i, { sizeBand: v })} />
            <Cell label="Criteria" value={s.criteria} onChange={(v) => setSeg(i, { criteria: v })} />
            <NumCell label="Setup from" value={s.setup.min} flagged={flagged(label, 'setup_min')} onChange={(v) => setSeg(i, { setup: range(s.setup, 'min', v) })} />
            <NumCell label="Setup to" value={s.setup.max} flagged={flagged(label, 'setup_max')} onChange={(v) => setSeg(i, { setup: range(s.setup, 'max', v) })} />
            <NumCell label="Cost per recruit from" value={s.cpr.min} flagged={flagged(label, 'cpr_min')} onChange={(v) => setSeg(i, { cpr: range(s.cpr, 'min', v) })} />
            <NumCell label="Cost per recruit to" value={s.cpr.max} flagged={flagged(label, 'cpr_max')} onChange={(v) => setSeg(i, { cpr: range(s.cpr, 'max', v) })} />
            <NumCell label="Incentive from" value={s.incentive.min} flagged={flagged(label, 'incentive_min')} onChange={(v) => setSeg(i, { incentive: range(s.incentive, 'min', v) })} />
            <NumCell label="Incentive to" value={s.incentive.max} flagged={flagged(label, 'incentive_max')} onChange={(v) => setSeg(i, { incentive: range(s.incentive, 'max', v) })} />
            <Cell label="Setup note" value={s.setupNote} onChange={(v) => setSeg(i, { setupNote: v })} wide />
            <Cell label="Cost per recruit note" value={s.cprNote} onChange={(v) => setSeg(i, { cprNote: v })} wide />
            <Cell label="Incentive unit" value={s.incentiveUnit} onChange={(v) => setSeg(i, { incentiveUnit: v })} />
            <Cell label="Incentive note" value={s.incentiveNote} onChange={(v) => setSeg(i, { incentiveNote: v })} />
          </section>
        )
      })}
      <Button variant="secondary" size="md" className="self-start px-3" onClick={() => onChange({ ...card, segments: [...card.segments, { id: newId(), section: '', segment: 'New segment', level: '', criteria: '', sizeBand: 'any', setup: { min: null, max: null }, setupNote: '', cpr: { min: null, max: null }, cprNote: '', incentive: { min: null, max: null }, incentiveUnit: 'per hour', incentiveNote: '' }] })}>Add segment row</Button>

      <h3 className="pt-3 text-title-s text-text-title">Fees, adjustments and rules</h3>
      <div className="flex flex-col gap-2">
        {card.fees.map((f, i) => {
          const label = feeLabel(f)
          return (
            <section key={f.id} aria-label={`Fee ${label}`} className="grid grid-cols-[150px_1.4fr_100px_100px_120px_2fr] gap-3 rounded-lg border-1 border-stroke-1 bg-bg-1 p-3">
              <Cell label="Group" value={f.group} onChange={(v) => setFee(i, { group: v })} />
              <Cell label="Item" value={f.item} onChange={(v) => setFee(i, { item: v })} />
              <NumCell label="Amount from" value={f.amount.min} flagged={flagged(label, 'amount_min')} onChange={(v) => setFee(i, { amount: range(f.amount, 'min', v) })} />
              <NumCell label="Amount to" value={f.amount.max} flagged={flagged(label, 'amount_max')} onChange={(v) => setFee(i, { amount: range(f.amount, 'max', v) })} />
              <Cell label="Unit" value={f.unit} onChange={(v) => setFee(i, { unit: v })} />
              <Cell label="Note" value={f.note} onChange={(v) => setFee(i, { note: v })} />
            </section>
          )
        })}
      </div>
      <Button variant="secondary" size="md" className="self-start px-3" onClick={() => onChange({ ...card, fees: [...card.fees, { id: newId(), group: 'Additional fee', item: 'New fee', amount: { min: null, max: null }, unit: 'flat', note: '' }] })}>Add fee row</Button>
    </div>
  )
}
