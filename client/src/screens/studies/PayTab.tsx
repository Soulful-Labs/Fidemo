import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { Download, Info, InvoiceIcon, MoneyMark } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { BILLING, BILLING_TOTAL, PAY_STATE, TRANSACTIONS } from '../../mock/pay'
import type { BillingRow } from '../../mock/pay'
import { managedStudy } from '../../mock/studies'

/** A figure beside the payment due tile. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[79px] w-[267px] flex-col justify-center gap-1 rounded-md border-1 border-stroke-input px-4">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="text-title-l text-text-title">{value}</span>
    </div>
  )
}

/** One billing line: a label, its working, and the amount on the right. */
function Row({ r, last }: { r: BillingRow; last?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-4',
      r.sub ? 'py-3' : 'h-12 items-center', !last && 'border-b-1 border-stroke-input')}>
      <span className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 text-text-regular leading-5 text-text-title">
          {r.label}{r.info && <Info className="h-4 w-4 text-text-body" />}
        </span>
        {r.sub && <span className="text-text-regular leading-5 text-text-subtitle">{r.sub}</span>}
      </span>
      <span className="text-text-regular leading-5 text-text-title">{r.amount}</span>
    </div>
  )
}

/**
 * Pay (1627:96779 while ongoing, 1627:97128 due as completed). One tab, two
 * states: the balance is not payable until the study is marked completed, and
 * the frames change only the due label, the amount, the total, the billing
 * date and whether a net payable row is drawn.
 */
export default function PayTab() {
  const { id } = useParams()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const s = managedStudy(id)
  const due = params.get('state') === 'due'
  const v = due ? PAY_STATE.due : PAY_STATE.ongoing

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="pay"
        minH={due ? 'min-h-[1011px]' : 'min-h-[905px]'}
        bodyMinH={due ? 'min-h-[761px]' : 'min-h-[655px]'}>
        <div className="flex flex-col px-4 pt-4">
          <h2 className="text-title-s leading-[22px] text-text-title">Payment Overview</h2>

          <div className="flex gap-3 pt-[14px]">
            <div className="mr-3 flex h-[79px] w-[547px] items-center justify-between rounded-md bg-yellow-30 px-4">
              <span className="flex flex-col gap-1">
                <span className="text-text-regular text-text-subtitle">{v.dueLabel}</span>
                <span className="text-title-l text-text-title">{v.due}</span>
              </span>
              <Button size="none" className="h-12 w-[154px]" disabled={!v.payable}
                leftIcon={<MoneyMark className="h-5 w-5" />}
                onClick={() => nav(`/studies/${s.id}/payment`)}>
                <span className="text-body-medium">Pay Balance</span>
              </Button>
            </div>
            <Figure label="Deposit Paid" value="$3,000" />
            <Figure label="Total Cost" value={v.totalCost} />
          </div>

          <div className="flex gap-6 pt-6">
            <div className="w-[547px]">
              <h3 className="text-title-s leading-[22px] text-text-title">
                Billing {v.billingAs && <span className="text-text-regular text-text-subtitle">{v.billingAs}</span>}
              </h3>
              <div className="mt-4 overflow-hidden rounded-md bg-bg-1">
                {BILLING.map((r) => <Row key={r.label} r={r} />)}
                <div className="flex flex-col gap-2 border-b-1 border-stroke-input px-4 py-[14px]">
                  <span className="flex items-center justify-between gap-4 text-text-regular leading-5 text-text-title">
                    {BILLING_TOTAL.total.label}<span>{BILLING_TOTAL.total.amount}</span>
                  </span>
                  <span className="flex items-start justify-between gap-4">
                    <span className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 text-text-regular leading-5 text-text-title">
                        {BILLING_TOTAL.less.label}<Info className="h-4 w-4 text-text-body" />
                      </span>
                      <span className="text-text-regular leading-5 text-text-subtitle">{BILLING_TOTAL.less.sub}</span>
                    </span>
                    <span className="text-text-regular leading-5 text-text-title">{BILLING_TOTAL.less.amount}</span>
                  </span>
                </div>
                {v.net && <Row r={BILLING_TOTAL.net} last />}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-title-s leading-[22px] text-text-title">Transactions</h3>
              <div className="mt-4 flex flex-col gap-3">
                {TRANSACTIONS.map((t) => (
                  <div key={t.label} className="flex justify-between gap-4 rounded-md border-1 border-stroke-input px-4 py-[14px]">
                    <span className="flex flex-col">
                      <span className="inline-flex items-center gap-2 text-text-regular leading-5 text-text-title">
                        <InvoiceIcon className="h-4 w-4 text-text-title" />{t.label}
                      </span>
                      <span className="text-text-regular leading-5 text-text-subtitle">{t.at}</span>
                      <span className="text-text-regular leading-5 text-text-subtitle">{t.sub}</span>
                    </span>
                    <span className="flex flex-col items-end gap-2">
                      <span className="text-text-regular leading-5 text-text-title">{t.amount}</span>
                      <Button variant="tertiary" size="none" className="h-[38px] px-4"
                        leftIcon={<Download className="h-4 w-4" />}>Receipt</Button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
