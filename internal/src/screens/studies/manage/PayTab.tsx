import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { DownloadIcon, ReceiptIcon } from '../../../components/ui/icons'
import type { ManagedStudy } from '../../../mock/manage'
import { BillLine, Mastercard } from '../review/PaymentRevisions'

const Rule = () => <hr className="border-0 border-t-1 border-stroke-input" />

export const Money = ({ label, value, short }: { label: string; value: string; short?: boolean }) => (
  <div className={`flex ${short ? 'h-[79px]' : 'h-[91px]'} flex-1 flex-col justify-center rounded-md border-1 border-stroke-1 px-3`}>
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    <p className="pt-1.5 text-title-l leading-[31px] text-text-title">{value}</p>
  </div>
)

/** One line under Transactions: what was paid, when, how it was counted, and its receipt. */
export function Transaction({ title, amount, detail }: { title: string; amount: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border-1 border-stroke-1 p-3 text-text-regular leading-5">
      <p className="flex justify-between text-text-title"><span className="flex items-center gap-1"><ReceiptIcon className="h-5 w-5" />{title}</span><span>{amount}</span></p>
      <div className="flex items-center justify-between text-text-subtitle">
        <div className="flex flex-col gap-1"><p>Aug 5, 2026, 10:24 AM</p><p>{detail}</p></div>
        <Button variant="tertiary" size="md" className="px-3" leftIcon={<DownloadIcon className="h-5 w-5" />}>Receipt</Button>
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

export function Billing({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      {FEES.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
      <Rule />
      {children}
    </div>
  )
}

/**
 * Pay (1952:77992 and its five siblings, identical but for the header): the
 * client's bill for the study, shown to the team. "Payment Overview": the
 * amount due on a yellow-30 card with its due date and the card it will be
 * auto-debited from, then Deposit Paid and Total Cost. Billing: the fee lines
 * down to "Net payable cost". Transactions: what the client has paid, with a
 * receipt. Nothing here acts on money; the only control is Receipt.
 */
export default function PayTab({ study }: { study: ManagedStudy }) {
  return (
    <div className={study.tight ? undefined : 'pt-0.5'}>
      <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
      <div className="grid grid-cols-2 gap-6 pt-3">
        <div className="flex h-[93px] flex-col justify-center rounded-md bg-yellow-30 px-4">
          <p className="flex items-center justify-between"><span className="text-title-l leading-[31px] text-text-title">$350</span>
            <span className="self-start text-text-regular text-brand-primary">{study.type === 'survey' ? 'Payment Due byAug 10, 2026' : 'Payment Due by Aug 10, 2026'}</span></p>
          <p className="flex items-center gap-2 pt-1 text-text-regular text-text-title">If not paid, will be auto-debited from
            <span className="flex h-7 items-center gap-2 rounded-full bg-bgAlt-2 px-2.5"><Mastercard /><span>•••• &nbsp;4242</span></span></p>
        </div>
        <div className="flex items-center gap-3"><Money label="Deposit Paid" value="$3,000" /><Money label="Total Cost" value="$3,850" /></div>
      </div>
      <div className="grid grid-cols-2 items-start gap-6 pt-6">
        <div>
          <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Billing</h2>
          <Billing>
            <BillLine line={{ label: 'Total cost', amount: '$3,350' }} />
            <BillLine line={{ label: 'Less: Incentive Deposit', detail: '$100 x 30 participants', amount: '-$3000', info: true }} />
            <Rule />
            <BillLine bold line={{ label: 'Net payable cost', amount: '$350' }} />
          </Billing>
        </div>
        <div>
          <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Transactions</h2>
          <Transaction title="Incentive Deposit Paid" amount="$3,000" detail="$20 x 30 participants" />
        </div>
      </div>
    </div>
  )
}
