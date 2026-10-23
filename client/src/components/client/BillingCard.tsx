import { billing } from '@shared/derive'
import type { Study } from '@shared/types'
import { useState } from 'react'
import { cn } from '../../lib/cn'

/**
 * The Billing card on Pay in the three states of Billing States 2.0 (23 Oct
 * 2026). While a study runs it is the plain card: Total Recruiting Cost at the
 * rate and the required participants, less the deposits taken, Payable. Once
 * it is stopped it gains Estimated / Final: Estimated is that same bill, Final
 * is the participants who completed, each at the rate agreed when they
 * completed, which is what the client is billed for. Every figure is
 * shared/derive.ts `billing`.
 */
const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US')}`

function Row({ label, note, amount, strong, rule = true, muted }: { label: string; note?: string; amount: string; strong?: boolean; rule?: boolean; muted?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 text-text-regular leading-5', rule && 'border-t-1 border-stroke-input', strong && 'font-medium', muted ? 'text-text-subtitle' : 'text-text-title')}>
      <span>{label}{note && <span className="text-text-body"> &bull; {note}</span>}</span>
      <span className="text-text-title">{amount}</span>
    </div>
  )
}

/** `fixed`: the Final bill alone, with no Estimated / Final switch (Payment's Invoice Breakdown, Invoice Details). */
export default function BillingCard({ study, stopped, fixed }: { study: Study; stopped: boolean; fixed?: boolean }) {
  const b = billing(study)
  const [side, setSide] = useState<'estimated' | 'final'>('final')
  const final = fixed || (stopped && side === 'final')
  const total = final ? b.total : b.estimate.total
  const net = final ? b.net : b.estimate.net
  const paidUp = final && study.state === 'completed' && b.balancePaid > 0
  /** A credit only exists once the study is stopped; while it runs, the deposits simply cover the bill so far. */
  const credited = final && net < 0
  const last = credited ? 'Credited to your next study' : paidUp ? 'Net Paid' : final ? 'Net Payable' : 'Payable'
  const lastAmount = credited ? Math.abs(net) : paidUp ? b.balancePaid : Math.max(0, net)

  return (
    <div className={cn('overflow-hidden rounded-lg border-1 border-stroke-1 px-4', stopped ? 'bg-bg-0' : 'bg-bg-1')}>
      {stopped && !fixed && (
        <div className="pt-4">
          <div role="tablist" className="flex h-12 rounded-md bg-bgAlt-2 p-1">
            {(['estimated', 'final'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={side === k} onClick={() => setSide(k)}
                className={cn('flex-1 rounded-md text-body-regular transition-colors duration-150',
                  side === k ? 'bg-green-200 text-text-title' : 'text-text-subtitle hover:text-text-title')}>
                {k === 'estimated' ? 'Estimated' : 'Final'}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 py-3 text-text-regular leading-5 text-text-title">
        <span className="flex justify-between gap-4"><span>Total Recruiting Cost</span><span>{usd(total)}</span></span>
        {final
          ? b.lines.map((l) => (
            <span key={l.label + l.sub} className="flex justify-between gap-4 text-text-subtitle">
              <span>{l.label}{l.sub && <span className="text-text-body"> &bull; {l.sub}</span>}</span><span>{usd(l.amount)}</span>
            </span>
          ))
          : <span className="text-text-subtitle">{b.estimate.lines[0]?.label}</span>}
      </div>
      {b.less.map((l) => <Row key={l.label} label={l.label} note={l.sub} amount={usd(l.amount)} />)}
      <Row label={last} amount={usd(lastAmount)} strong />
    </div>
  )
}
