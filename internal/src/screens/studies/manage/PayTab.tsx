import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { DownloadIcon, ReceiptIcon } from '../../../components/ui/icons'
import type { ManagedStudy } from '../../../mock/manage'
import { BillLine } from '../review/PaymentRevisions'
import { balanceDueBy, billing } from '@shared/derive'
import { dayMonthYear, money, monthDayYearTime } from '@shared/format'
import { fileName, pdf, save } from '@shared/files'
import { notice } from '../../../components/app/Notice'
import { DEPOSIT_RULE } from '@shared/platform'
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

export function Billing({ children, lines = FEES }: { children: ReactNode; lines?: { label: string; detail?: string; amount: string; info?: boolean }[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      {lines.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
      <Rule />
      {children}
    </div>
  )
}

/**
 * Pay (1932:107773, 19 Oct 2026): the client's bill, as the client app draws
 * it. Billing on the left, down to Payable (Net Payable once the study is
 * stopped); Payment Overview on the right, with Payment Due once the balance
 * falls due, then Deposit Paid and Total Cost; and Transactions, each with
 * its invoice. The console takes no money here.
 */
export default function PayTab({ study }: { study: ManagedStudy }) {
  const state = usePlatform()
  const real = state.studies.find((x) => x.id === study.id)
  if (!real) return null
  const b = billing(real)
  const stopped = real.state === 'completed'
  const paid = real.payments.filter((x) => x.kind === 'deposit' || x.kind === 'balance')
  return (
    <div className="grid grid-cols-2 items-start gap-6">
      <div>
        <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Billing</h2>
        <Billing lines={feeLines(real)}>
          <BillLine line={{ label: 'Total cost', amount: money(b.total) }} />
          <Rule />
          <BillLine line={{ label: 'Less: Incentive Deposit', amount: `-${money(b.deposit)}` }} />
          <Rule />
          <BillLine bold line={{ label: stopped && b.net < 0 ? 'Credited to the next study' : stopped ? 'Net Payable' : 'Payable', amount: money(stopped ? Math.abs(b.net) : Math.max(0, b.net)) }} />
        </Billing>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
        {stopped && b.outstanding > 0 && (
          <div className="flex h-[79px] flex-col justify-center rounded-md bg-yellow-30 px-4">
            <p className="text-text-regular text-text-subtitle">Payment Due{balanceDueBy(real) ? ` by ${dayMonthYear(balanceDueBy(real))}` : ''}</p>
            <p className="pt-1 text-title-l leading-[31px] text-text-title">{money(b.outstanding)}</p>
          </div>
        )}
        <div className="flex gap-3"><Money short label="Deposit Paid" value={money(b.deposit)} /><Money short label="Total Cost" value={money(b.totalCost)} /></div>
        <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Transactions</h2>
        <div className="flex flex-col gap-2">
          {paid.map((x) => <Transaction key={x.id} action="Invoice" of={real.title} title={x.kind === 'deposit' ? 'Incentive Deposit Paid' : 'Balance Paid'} amount={money(x.amount)} at={monthDayYearTime(x.at)} detail={x.kind === 'deposit' ? DEPOSIT_RULE : 'Billed on delivery'} />)}
          {paid.length === 0 && <p className="text-text-regular text-text-subtitle">Nothing has been paid on this study yet.</p>}
        </div>
      </div>
    </div>
  )
}
