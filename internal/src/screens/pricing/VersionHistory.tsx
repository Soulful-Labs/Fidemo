import { useMemo } from 'react'
import AppShell from '../../app/AppShell'
import { monthDayYearTime } from '@shared/format'
import { DEFAULTS } from '@shared/settings'
import type { FeeSettings, RateCard } from '@shared/types'
import { feeLabel, previewUpload, segmentLabel } from '@shared/ratecard'
import { ExportButtons } from './RateCardTables'
import { usePlatform } from '../../platform'
import Pill from '../../components/app/Pill'
import { addOnPills } from '../../mock/pricing'

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`

function Version({ heading, by, fees }: { heading: string; by?: string; fees: FeeSettings }) {
  return (
    <section className="overflow-hidden rounded-lg border-1 border-stroke-1">
      <p className="bg-bg-1 px-4 py-3 text-body-regular text-text-subtitle">{heading}{by && <span className="text-text-subtitle"> &nbsp;&bull;&nbsp; by <span className="text-text-title">{by}</span></span>}</p>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="grid grid-cols-2 gap-4 border-b-1 border-stroke-input pb-3">
          <p className="flex flex-col gap-1 text-text-regular text-text-subtitle">Platform Fees<span className="text-body-regular text-text-title">{usd(fees.platform)}</span></p>
          <p className="flex flex-col gap-1 text-text-regular text-text-subtitle">Moderation Fees<span className="text-body-regular text-text-title">{usd(fees.moderation)}</span></p>
        </div>
        <p className="text-text-medium text-text-title">Recruitment Fees</p>
        <p className="flex flex-col gap-1 text-text-regular text-text-subtitle">Base<span className="text-body-regular text-text-title">{usd(fees.recruitmentBase)}</span></p>
        {fees.addOns.map((a, i) => (
          <div key={a.id} className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Add-on {i + 1}</span>
            <p className="flex flex-wrap items-center gap-2 text-text-regular text-text-subtitle">
              <span className="text-body-regular text-text-title">+{usd(a.amount)}</span>&bull; For
              {addOnPills(a).map(([l, v]) => <Pill key={v} label={l} className="h-7 px-2.5">{v}</Pill>)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Version History, Clients Fees (23 Oct 2026): every version of the client
 * fees, newest first, each with when it was saved and by whom, read from the
 * saved changes (`settingsLog`, shared/settings.ts). The oldest is the
 * policy's starting values, in force until the first change.
 */
export default function VersionHistory() {
  const state = usePlatform()
  const named = (id: string) => state.team.find((t) => t.id === id)?.name ?? 'A team member'
  const versions = useMemo(() => {
    const changes = (state.settingsLog ?? []).filter((c) => c.group === 'fees')
    return [
      ...changes.map((c) => ({ id: c.id, heading: `As updated on: ${monthDayYearTime(c.at)}`, by: named(c.by), fees: c.after as FeeSettings })).reverse(),
      { id: 'policy', heading: changes.length ? 'Starting values, from the Trust and Rewards Policy' : 'In force now: the starting values, from the Trust and Rewards Policy. No changes have been saved yet.', by: undefined, fees: DEFAULTS.fees },
    ]
  }, [state])
  /** Every version of the rate card (24 Oct 2026): who, when, where it came from, and what it changed. */
  const cards = useMemo(() => (state.settingsLog ?? []).filter((c) => c.group === 'rateCard').map((c) => {
    const before = c.before as RateCard, after = c.after as RateCard
    const p = previewUpload(before, [{ kind: 'segments', segments: after.segments, fees: [], unreadable: [], skipped: [] }, { kind: 'fees', segments: [], fees: after.fees, unreadable: [], skipped: [] }])
    const removed = [...before.segments.filter((x) => !after.segments.some((y) => y.id === x.id)).map(segmentLabel), ...before.fees.filter((x) => !after.fees.some((y) => y.id === x.id)).map(feeLabel)]
    return { id: c.id, at: c.at, by: named(c.by), source: c.source, after, changed: p.matched.filter((m) => m.changes.length), added: p.added, removed }
  }).reverse(), [state])
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Fees', to: '/pricing' }, { label: 'Clients Fees', to: '/pricing' }, { label: 'Version History' }]}>
      <div className="flex flex-col gap-4">{versions.map((v) => <Version key={v.id} heading={v.heading} by={v.by} fees={v.fees} />)}</div>
      <h2 className="pb-3 pt-8 text-title-s text-text-title">Rate Card</h2>
      <div className="flex flex-col gap-4">
        {cards.map((v) => (
          <section key={v.id} className="overflow-hidden rounded-lg border-1 border-stroke-1">
            <p className="flex items-center justify-between gap-4 bg-bg-1 px-4 py-3 text-body-regular text-text-subtitle">
              <span>As updated on: <span className="text-text-title">{monthDayYearTime(v.at)}</span> &nbsp;&bull;&nbsp; by <span className="text-text-title">{v.by}</span>{v.source && <> &nbsp;&bull;&nbsp; from {v.source}</>}</span>
              <ExportButtons card={v.after} />
            </p>
            <div className="flex flex-col gap-1 px-4 py-3 text-text-regular text-text-title">
              <p>{v.after.segments.length} segment rows and {v.after.fees.length} fees, adjustments and rules.</p>
              {v.changed.map((m) => <p key={m.label}><span className="text-text-medium">{m.label}</span>: {m.changes.map((c) => `${c.field} was ${c.from}, now ${c.to}`).join('; ')}</p>)}
              {v.added.length > 0 && <p className="text-text-subtitle">Added: {v.added.join(' · ')}</p>}
              {v.removed.length > 0 && <p className="text-text-subtitle">Removed: {v.removed.join(' · ')}</p>}
            </div>
          </section>
        ))}
        {cards.length === 0 && <p className="text-text-regular text-text-subtitle">No rate card has been saved yet.</p>}
      </div>
    </AppShell>
  )
}
