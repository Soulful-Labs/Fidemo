import Button from '../../../components/ui/Button'
import { DownloadIcon, InfoIcon, ReceiptIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { PAYMENT as P, REVISIONS as R } from '../../../mock/review'
import { Rule } from './parts'

interface Line { label: string; detail?: string; amount: string; info?: boolean }

const BillLine = ({ line, bold }: { line: Line; bold?: boolean }) => (
  <div className="flex items-start justify-between text-text-regular leading-5 text-text-title">
    <div className="flex flex-col gap-1">
      <p className={cn('flex items-center gap-1', bold && 'text-text-medium')}>
        {line.label}{line.info && <InfoIcon className="h-4 w-4 text-text-subtitle" />}
      </p>
      {line.detail && <p className="text-text-subtitle">{line.detail}</p>}
    </div>
    <p className={cn(bold && 'text-text-medium')}>{line.amount}</p>
  </div>
)

const Mastercard = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <circle cx="5" cy="8" r="5" className="fill-state-danger" /><circle cx="11" cy="8" r="5" className="fill-yellow-500" fillOpacity="0.9" />
  </svg>
)

/**
 * Payment (1984:120589): two 372 columns 24 apart. "Payment Overview": Total
 * Cost (ringed) and Deposit Paid (bg-1) beside the incentive, AutoPay and card
 * on file. Then Billing, a bg-1 list of fees down to "Net payable cost", and
 * Transactions with a Receipt button. Every figure is read only.
 */
export function PaymentTab({ onReceipt }: { onReceipt: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-6">
      <h2 className="col-span-2 text-title-s leading-[25px] text-text-title">Payment Overview</h2>
      <div className="flex flex-col gap-3 pt-3">
        <div className="flex h-[58px] items-center justify-between rounded-md border-1 border-stroke-1 px-4">
          <span className="text-body-regular text-text-subtitle">Total Cost</span>
          <span className="text-title-m text-text-title">{P.totalCost}</span>
        </div>
        <div className="flex h-[58px] items-center justify-between rounded-md bg-bg-1 px-4">
          <span className="text-body-regular text-text-subtitle">Deposit Paid</span>
          <span className="text-title-m text-text-title">{P.depositPaid}</span>
        </div>
      </div>
      <div className="mt-3 flex h-[128px] flex-col rounded-md border-1 border-stroke-1 px-3 pt-3 text-text-regular">
        <div className="flex h-7 items-center justify-between">
          <span className="flex items-center gap-1 text-text-subtitle">Incentive
            <span className="flex h-7 items-center rounded-full bg-bgAlt-2 px-2.5 text-text-subtitle">{P.suggested}</span>
          </span>
          <span className="self-start text-state-success">{P.incentive}</span>
        </div>
        <Rule className="mt-2" />
        <div className="flex justify-between pt-2 text-text-subtitle"><span>AutoPay</span><span className="text-text-title">{P.autoPay}</span></div>
        <Rule className="mt-2" />
        <div className="flex justify-between pt-2 text-text-subtitle"><span>Card on File</span>
          <span className="flex items-center gap-2 text-text-title"><Mastercard /><span>•••• {P.card}</span></span>
        </div>
      </div>

      <div className="pt-6">
        <h2 className="text-title-s leading-[25px] text-text-title">Billing</h2>
        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
          {P.billing.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule className="border-stroke-input" />}<BillLine line={line} /></div>)}
          <Rule className="border-stroke-input" />
          {P.totals.map((line) => <BillLine key={line.label} line={line} />)}
          <Rule className="border-stroke-input" />
          <BillLine line={P.net} bold />
        </div>
      </div>
      <div className="pt-6">
        <h2 className="text-title-s leading-[25px] text-text-title">Transactions</h2>
        <div className="mt-3 flex flex-col gap-2 rounded-md border-1 border-stroke-1 p-3 text-text-regular">
          <div className="flex justify-between text-text-medium text-text-title">
            <span className="flex items-center gap-1"><ReceiptIcon className="h-5 w-5" />{P.transaction.title}</span>
            <span>{P.transaction.amount}</span>
          </div>
          <div className="flex items-center justify-between text-text-subtitle">
            <div className="flex flex-col gap-1"><p>{P.transaction.when}</p><p>{P.transaction.detail}</p></div>
            <Button variant="tertiary" size="md" className="px-3" leftIcon={<DownloadIcon className="h-5 w-5" />} onClick={onReceipt}>Receipt</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Entry = ({ title, when, children }: { title: string; when: string; children?: React.ReactNode }) => (
  <article className="flex gap-2 rounded-lg border-1 border-stroke-1 p-[11px] leading-5">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bgAlt-2"><VerifiedIcon className="h-[18px] w-[18px] text-state-success" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="pb-0.5 text-text-regular leading-5 text-text-title">{title}</h3>
      {children}
      <p className="text-text-regular leading-5 text-text-body">{when}</p>
    </div>
  </article>
)

/**
 * Revisions History (1984:122012): the newest entry first. A request for
 * changes carries the message that was sent to the client, in a bg-1 box; the
 * submission is a single line. Each has a green tick and its time.
 */
export function RevisionsTab() {
  const q = R.requested
  return (
    <div className="flex flex-col gap-2">
      <Entry title={q.title} when={q.when}>
        <div className="mb-0.5 rounded-md bg-bg-1 px-3 py-3 text-text-regular leading-5 text-text-title">
          <p>{q.greeting}</p>
          <p>{q.intro}</p>
          <ol className="list-decimal py-5 pl-5">
            {q.items.map(([head, detail]) => (
              <li key={head}>{head}<ol className="list-[lower-alpha] pl-[21px]"><li>{detail}</li></ol></li>
            ))}
          </ol>
          <p>{q.outro}</p>
        </div>
      </Entry>
      <Entry title={R.created.title} when={R.created.when} />
    </div>
  )
}
