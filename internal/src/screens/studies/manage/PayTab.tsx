import { useState } from 'react'
import type { ReactNode } from 'react'
import { isStopped } from '@shared/lifecycle'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { DownloadIcon, ReceiptIcon } from '../../../components/ui/icons'
import type { ManagedStudy } from '../../../mock/manage'
import { BillLine, Mastercard } from '../review/PaymentRevisions'
import { balanceDueBy, billing } from '@shared/derive'
import { dayMonthYear, money, monthDayYearTime } from '@shared/format'
import { fileName, pdf, save } from '@shared/files'
import { notice } from '../../../components/app/Notice'
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

/** One line under Transactions: what was paid and its amount, then when, and its receipt or invoice (23 Oct 2026). */
export function Transaction({ title, amount, detail, at, action = 'Receipt', of = '' }: { title: string; amount: string; detail?: string; at?: string; action?: 'Receipt' | 'Invoice'; of?: string }) {
  const download = () => notice(`Saved ${save(fileName(`${action} ${title} ${of}`, 'pdf'), pdf(`${action}: ${title}`, [of, at ?? '', detail ?? '', '', `Amount: ${amount}`]))}`)
  return (
    <div className="flex flex-col gap-2 rounded-md border-1 border-stroke-1 p-3 text-text-regular leading-5">
      <p className="flex justify-between text-text-title"><span className="flex items-center gap-1"><ReceiptIcon className="h-5 w-5" />{title}</span><span>{amount}</span></p>
      <div className="flex items-center justify-between text-text-subtitle">
        <div className="flex flex-col gap-1">{at && <p>{at}</p>}{detail && <p>{detail}</p>}</div>
        <button type="button" onClick={download} className="flex items-center gap-1.5 text-text-title hover:text-brand-primary"><DownloadIcon className="h-5 w-5" />{action}</button>
      </div>
    </div>
  )
}

/** A bill as a card of lines on bg-1: `top` (the Estimated / Final switch) above them, `children` below a rule. */
export function Billing({ children, lines, top }: { children: ReactNode; lines: { label: string; detail?: string; amount: string; info?: boolean }[]; top?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      {top}
      {lines.map((line, i) => <div key={line.label + (line.detail ?? '')} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
      <Rule />
      {children}
    </div>
  )
}

const usd = (n: number) => `${n < 0 ? '-' : ''}${money(Math.abs(n))}`
const Row = ({ label, note, amount, bold }: { label: string; note?: string; amount: string; bold?: boolean }) => (
  <p className={`flex justify-between gap-4 text-text-regular leading-5 text-text-title ${bold ? 'font-medium' : ''}`}>
    <span>{label}{note && <span className="text-text-body"> &bull; {note}</span>}</span><span>{amount}</span>
  </p>
)

/**
 * The billing card (Billing States 2.0, 23 Oct 2026), the same bill the client
 * sees. While the study runs it is the plain card: Total Recruiting Cost at the
 * CPI rate and the required participants, less the deposits taken, Payable.
 * Once recruiting stops it has Estimated / Final: Final is one line per rate
 * period of the participants who completed, down to Net Payable (Net Paid when
 * settled). Every figure is shared/derive.ts `billing`.
 */
export function BillCard({ study, stopped, paid }: { study: Study; stopped: boolean; paid?: boolean }) {
  const [view, setView] = useState('final')
  const b = billing(study)
  const final = stopped && view === 'final'
  const total = final ? b.total : b.estimate.total
  const net = final ? b.net : b.estimate.net
  const credited = final && net < 0
  const last = credited ? 'Credited to the next study' : final && paid ? 'Net Paid' : final ? 'Net Payable' : 'Payable'
  return (
    <div className={`flex flex-col gap-3 rounded-lg p-4 ${stopped ? 'border-1 border-stroke-1 bg-bg-0' : 'bg-bg-1'}`}>
      {stopped && <SegmentedTabs className="w-full" segmentClassName="flex-1" value={view} onChange={setView} items={[{ key: 'estimated', label: 'Estimated' }, { key: 'final', label: 'Final' }]} />}
      <div className="flex flex-col gap-2">
        <Row label="Total Recruiting Cost" amount={usd(total)} />
        {final
          ? b.lines.map((l) => <p key={l.label + l.sub} className="flex justify-between gap-4 text-text-regular text-text-subtitle"><span>{l.label}{l.sub && <span className="text-text-body"> &bull; {l.sub}</span>}</span><span>{usd(l.amount)}</span></p>)
          : <p className="text-text-regular text-text-subtitle">{b.estimate.lines[0]?.label}</p>}
      </div>
      {b.less.map((l) => <div key={l.label} className="flex flex-col gap-3"><Rule /><Row label={l.label} note={l.sub} amount={usd(l.amount)} /></div>)}
      <Rule />
      <Row bold label={last} amount={usd(credited ? -net : final && paid ? b.balancePaid : Math.max(0, net))} />
    </div>
  )
}

/** The bill once recruiting stops: Estimated / Final. `paid`: a completed, settled study, whose last line reads Net Paid. */
export function StoppedBill({ study, paid }: { study: Study; paid?: boolean }) {
  return <BillCard study={study} stopped paid={paid} />
}

/** The deposits and the bill as Transactions lists them, newest first. */
export function transactionsOf(study: Study) {
  return study.payments.filter((x) => x.kind === 'deposit' || x.kind === 'balance').sort((x, y) => y.at.localeCompare(x.at))
    .map((x) => ({ id: x.id, title: x.kind === 'deposit' ? depositLabel(x.stage ?? 'upfront') : 'Net Payable Bill', amount: money(x.amount), at: monthDayYearTime(x.at) }))
}

/**
 * Pay (Ongoing Study Details, Pay tab, 23 Oct 2026, every study type): the
 * client's bill, read only. Billing on the left (the plain card while
 * recruiting, Estimated / Final once stopped); Payment Overview on the right:
 * in Billing, Net Payable with the drawn line "To be auto-debited by [date] by
 * [card]" (shown as drawn; nothing debits a card on its own, recorded on the
 * difference list); then Deposit Paid and Total Cost, or Total Paid once
 * completed; and Transactions, each with its invoice. The banner for a study
 * in Billing sits above the study header (BillingBanner). The console takes no money here.
 */
export default function PayTab({ study }: { study: ManagedStudy }) {
  const state = usePlatform()
  const real = state.studies.find((x) => x.id === study.id)
  if (!real) return null
  const b = billing(real)
  const stopped = isStopped(real.state)
  const tx = transactionsOf(real)
  const client = state.clients.find((c) => c.id === real.clientId)
  const card = client?.cards.find((c) => c.isDefault) ?? client?.cards[0]
  const dueBy = balanceDueBy(real)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 items-start gap-6">
        <div>
          <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Billing</h2>
          <BillCard study={real} stopped={stopped} paid={real.state === 'completed'} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
          {real.state === 'billing' && (
            <div className="flex flex-col gap-1 rounded-md bg-yellow-30 px-4 py-3">
              <p className="text-text-regular text-text-subtitle">Net Payable</p>
              <p className="text-title-l leading-[31px] text-text-title">{money(b.outstanding)}</p>
              {dueBy && card && <p className="flex items-center gap-1.5 text-text-regular text-text-subtitle">To be auto-debited by <span className="text-text-title">{dayMonthYear(dueBy)}</span> by <Mastercard /><span className="text-text-title">**** {card.last4}</span></p>}
            </div>
          )}
          {real.state === 'completed'
            ? <div className="flex gap-3"><Money short label="Total Paid" value={money(b.paid)} /></div>
            : <div className="flex gap-3"><Money short label="Deposit Paid" value={money(b.deposit)} /><Money short label="Total Cost" value={money(b.totalCost)} /></div>}
          <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Transactions</h2>
          <div className="flex flex-col gap-2">
            {tx.map((x) => <Transaction key={x.id} action="Invoice" of={real.title} title={x.title} amount={x.amount} at={x.at} />)}
            {tx.length === 0 && <p className="text-text-regular text-text-subtitle">Nothing has been paid on this study yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
