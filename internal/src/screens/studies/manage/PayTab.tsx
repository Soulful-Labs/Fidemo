import { useState } from 'react'
import type { ReactNode } from 'react'
import { isStopped } from '@shared/lifecycle'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { dayMonthYear as dmy, clockTime } from '@shared/format'
import Button from '../../../components/ui/Button'
import { DownloadIcon, ReceiptIcon } from '../../../components/ui/icons'
import type { ManagedStudy } from '../../../mock/manage'
import { BillLine } from '../review/PaymentRevisions'
import { balanceDueBy, billing } from '@shared/derive'
import { dayMonthYear, money, monthDayYearTime } from '@shared/format'
import { fileName, pdf, save } from '@shared/files'
import { notice } from '../../../components/app/Notice'
import { DEPOSIT_RULE } from '@shared/platform'
import { depositLabel } from '@shared/derive'
import type { Study } from '@shared/types'
import { usePlatform } from '../../../platform'

const Rule = () => <hr className="border-0 border-t-1 border-stroke-input" />

export const Money = ({ label, value, short }: { label: string; value: string; short?: boolean }) => (
  <div className={`flex ${short ? 'h-[79px]' : 'h-[91px]'} flex-1 flex-col justify-center rounded-md border-1 border-stroke-1 px-3`}>
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    <p className="pt-1.5 text-title-l leading-[31px] text-text-title">{value}</p>
  </div>
)

/** One line under Transactions: what was paid, when, how it was counted, and its receipt. */
export function Transaction({ title, amount, detail, at, action = 'Receipt', of = '' }: { title: string; amount: string; detail: string; at?: string; action?: 'Receipt' | 'Invoice'; of?: string }) {
  const download = () => notice(`Saved ${save(fileName(`${action} ${title} ${of}`, 'pdf'), pdf(`${action}: ${title}`, [of, at ?? '', detail, '', `Amount: ${amount}`]))}`)
  return (
    <div className="flex flex-col gap-1 rounded-md border-1 border-stroke-1 p-3 text-text-regular leading-5">
      <p className="flex justify-between text-text-title"><span className="flex items-center gap-1"><ReceiptIcon className="h-5 w-5" />{title}</span><span>{amount}</span></p>
      <div className="flex items-center justify-between text-text-subtitle">
        <div className="flex flex-col gap-1">{at && <p>{at}</p>}<p>{detail}</p></div>
        <Button variant="tertiary" size="md" className="px-3" leftIcon={<DownloadIcon className="h-5 w-5" />} onClick={download}>{action}</Button>
      </div>
    </div>
  )
}

export const FEES = [
  { label: 'Platform Fee', amount: '$100' },
  { label: 'Recruiting Fee', detail: '$20 x 25 participants', amount: '$500', info: true },
  { label: 'Incentives', detail: '$100 x 25 participants', amount: '$2,500', info: true },
  { label: 'Moderation Fee', detail: '$10 x 25 participants', amount: '$250', info: true },
]

/** The study's own fee lines (shared/derive.ts billing), in the shape BillLine draws. */
export const feeLines = (study: Study) => billing(study).lines.map((l) => ({ label: l.label, detail: l.sub, amount: money(l.amount), info: l.info }))

export function Billing({ children, lines = FEES, top }: { children: ReactNode; lines?: { label: string; detail?: string; amount: string; info?: boolean }[]
  /** Drawn above the lines, inside the card: the Estimated / Final switch (2325:221199, 1932:97043). */
  top?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      {top}
      {lines.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
      <Rule />
      {children}
    </div>
  )
}

/**
 * Pay (1932:107773; in Billing, the client's 2325:220730 read only): the
 * client's bill. Billing on the left, down to Payable (Net Payable once
 * recruiting stops, with Estimated / Final); Payment Overview on the right,
 * with Payment Due while the bill is open, then Deposit Paid and Total Cost;
 * and Transactions, each with its invoice. In Billing a banner says who
 * stopped the study. The console takes no money here: no Pay Bill and no
 * Re-publish and Recruit, which are the client's.
 */
const STOPPED_BY: Record<'client' | 'team' | 'filled', string> = {
  client: 'This study is stopped by the client to mark completed.',
  team: 'This study is stopped by the team to mark completed.',
  filled: 'This study has filled its target and stopped recruiting.',
}
export default function PayTab({ study }: { study: ManagedStudy }) {
  const state = usePlatform()
  const real = state.studies.find((x) => x.id === study.id)
  if (!real) return null
  const b = billing(real)
  const stopped = isStopped(real.state)
  const paid = real.payments.filter((x) => x.kind === 'deposit' || x.kind === 'balance')
  return (
    <div className="flex flex-col gap-4">
      {real.state === 'billing' && (
        <div className="flex flex-col gap-1 rounded-lg border-1 border-yellow-200 bg-yellow-40 px-4 py-[13px]">
          <p className="text-body-medium text-text-title">{STOPPED_BY[real.stoppedBy ?? 'client']}</p>
          <p className="text-text-regular text-text-subtitle">The client completes it by paying the bill, or re-publishes it to recruit more.</p>
          {real.stoppedAt && <p className="text-text-regular text-text-body">{dmy(real.stoppedAt)}, at {clockTime(real.stoppedAt)}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 items-start gap-6">
        <div>
          <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Billing</h2>
          {stopped ? <StoppedBill study={real} /> : (
            <Billing lines={feeLines(real)}>
              <BillLine line={{ label: 'Total cost', amount: money(b.total) }} />
              <Rule />
              <BillLine line={{ label: 'Less: Incentive Deposit', amount: `-${money(b.deposit)}` }} />
              <Rule />
              <BillLine bold line={{ label: 'Payable', amount: money(Math.max(0, b.net)) }} />
            </Billing>
          )}
        </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
        {real.state === 'billing' && b.outstanding > 0 && (
          <div className="flex h-[79px] flex-col justify-center rounded-md bg-yellow-30 px-4">
            <p className="text-text-regular text-text-subtitle">Payment Due{balanceDueBy(real) ? ` by ${dayMonthYear(balanceDueBy(real))}` : ''}</p>
            <p className="pt-1 text-title-l leading-[31px] text-text-title">{money(b.outstanding)}</p>
          </div>
        )}
        <div className="flex gap-3"><Money short label="Deposit Paid" value={money(b.deposit)} /><Money short label="Total Cost" value={money(b.totalCost)} /></div>
        <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Transactions</h2>
        <div className="flex flex-col gap-2">
          {paid.map((x) => <Transaction key={x.id} action="Invoice" of={real.title} title={x.kind === 'deposit' ? depositLabel(x.stage ?? 'upfront') : 'Net Payable Bill'} amount={money(x.amount)} at={monthDayYearTime(x.at)} detail={x.kind === 'deposit' ? DEPOSIT_RULE : 'Billed on delivery'} />)}
          {paid.length === 0 && <p className="text-text-regular text-text-subtitle">Nothing has been paid on this study yet.</p>}
        </div>
      </div>
      </div>
    </div>
  )
}

/**
 * The bill once recruiting stops (Billing States, 2325:221199): Estimated is
 * the quote at the target, Final is what was delivered, each down to Net
 * Payable after the deposit.
 */
export function StoppedBill({ study, paid }: { study: Study
  /** A completed, settled study (1932:97043): the last line reads "Net Payable - Paid". */
  paid?: boolean }) {
  const [view, setView] = useState('final')
  const b = billing(study)
  const lines = view === 'final' ? b.lines : b.estimate.lines
  const total = view === 'final' ? b.total : b.estimate.total
  const net = view === 'final' ? b.net : b.estimate.net
  return (
    <div className="flex flex-col gap-3">
      <Billing top={<SegmentedTabs className="w-full" segmentClassName="flex-1" value={view} onChange={setView} items={[{ key: 'estimated', label: 'Estimated' }, { key: 'final', label: 'Final' }]} />}
        lines={lines.map((l) => ({ label: l.label, amount: money(l.amount), detail: l.sub, info: l.info }))}>
        <BillLine line={{ label: 'Total cost', amount: money(total) }} />
        <Rule />
        <BillLine line={{ label: 'Less: Incentive Deposit', amount: `-${money(b.deposit)}` }} />
        <Rule />
        <BillLine bold line={{ label: net < 0 ? 'Credited to the next study' : paid ? 'Net Payable - Paid' : 'Net Payable', amount: money(Math.abs(net)) }} />
      </Billing>
    </div>
  )
}
