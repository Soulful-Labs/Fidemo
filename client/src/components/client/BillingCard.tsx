import { billing } from '@shared/derive'
import type { Study } from '@shared/types'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { Info } from '../ui/icons'

/**
 * The Billing card on Pay (1645:132259, 1645:132608) in the three states of
 * Billing States (2317:163459). While a study runs it is the bill so far.
 * Once it is stopped it gains Estimated / Final: Estimated is the quote at the
 * required number of participants, Final is what was delivered, which is
 * what the client is billed for. Every figure is shared/derive.ts `billing`.
 */
const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US')}`

function Line({ label, amount, sub, info, strong, last, tall }: {
  label: string; amount: string; sub?: string; info?: boolean; strong?: boolean; last?: boolean; tall?: boolean
}) {
  return (
    <div className={cn('flex justify-between gap-4 px-4 text-text-regular leading-5 text-text-title',
      sub ? 'h-[68px] pt-[13px]' : tall ? 'h-12 items-center' : 'h-11 items-center', !last && 'border-b-1 border-stroke-1', strong && 'font-medium')}>
      <span className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1">{label}{info && <Info className="h-4 w-4 text-text-body" />}</span>
        {sub && <span className="text-text-subtitle">{sub}</span>}
      </span>
      <span>{amount}</span>
    </div>
  )
}

export default function BillingCard({ study, stopped }: { study: Study; stopped: boolean }) {
  const b = billing(study)
  const [side, setSide] = useState<'estimated' | 'final'>('final')
  const estimated = stopped && side === 'estimated'
  const lines = estimated ? b.estimate.lines : b.lines
  const total = estimated ? b.estimate.total : b.total
  const net = estimated ? b.estimate.net : b.net
  const payable = net < 0 ? 'Credited to your next study' : stopped && !estimated ? 'Net Payable' : 'Payable'

  return (
    <div className={cn('overflow-hidden rounded-lg border-1 border-stroke-1', stopped ? 'bg-bg-0' : 'bg-bg-1')}>
      {stopped && (
        <div className="px-4 pt-4">
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
      {lines.map((l, i) => (
        <Line key={l.label} label={l.label} amount={usd(l.amount)} sub={l.sub} tall={i === 0} />
      ))}
      <Line label="Total cost" amount={usd(total)} />
      <Line label="Less: Incentive Deposit" amount={usd(-b.deposit)} info={estimated} />
      <Line label={payable} amount={usd(Math.abs(net))} strong last tall />
    </div>
  )
}
