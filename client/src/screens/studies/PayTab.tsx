import { fileName, pdf, save } from '@shared/files'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { Download, InvoiceIcon, UsersIcon } from '../../components/ui/icons'
import { useBill } from '../../mock/pay'
import { useToast } from '../../components/ui/Toast'
import { useStudy } from '../../platform'
import { billing } from '@shared/derive'
import { STOPPED_LINE, canRepublish, isStopped } from '@shared/lifecycle'
import { monthDayYear, clockTime } from '@shared/format'
import BillingCard from '../../components/client/BillingCard'
import { CardMark } from '../payments/PaymentPanels'
import { useStudyActions } from '../../components/client/StudyActions'

/** A figure in Payment Overview. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[78px] flex-1 flex-col justify-center gap-1 rounded-md border-1 border-stroke-1 px-3">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="text-title-l text-text-title">{value}</span>
    </div>
  )
}

/**
 * Pay (1645:132259 while running; 2325:220730 and 1645:132608 in Billing).
 * Billing on the left, Payment Overview and Transactions on the right.
 * Once recruiting stops the study is in Billing (22 Oct 2026): a banner says
 * who stopped it, Payment Due appears with Pay Bill, the billing card gains
 * Estimated / Final, and Re-publish and Recruit takes it back to recruiting.
 * Paying the bill completes it. Pricing of 23 Oct 2026: the Billing card is
 * Total Recruiting Cost less the deposits taken; Payment Overview reads Net
 * Payable with Pay Bill in Billing, Total Paid once completed. The drawn
 * "To be auto-debited by" line is shown as drawn (a reversal on the
 * difference list): nothing debits a card on its own, Pay Bill is the payment.
 */
export default function PayTab() {
  const toast = useToast()
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStudy(id)
  const b = billing(s)
  const { INVOICE, transactions, card } = useBill(s.id)
  const { act, dialogs } = useStudyActions(s)
  const stopped = isStopped(s.state)
  const open = canRepublish(s)
  const money = (n: number) => `$${Math.abs(n).toLocaleString('en-US')}`

  const banner = open && (
    <div className="flex items-start justify-between gap-6 rounded-lg border-1 border-yellow-200 bg-yellow-40 px-4 py-[13px]">
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-title">{STOPPED_LINE[s.stoppedBy ?? 'client']}</p>
        <p className="text-text-regular text-text-subtitle">Complete the study by a payment or get more participants if needed.</p>
        {s.stoppedAt && <p className="text-text-regular text-text-body">{monthDayYear(s.stoppedAt)}, at {clockTime(s.stoppedAt)}</p>}
      </div>
      <Button variant="tertiary" size="none" className="h-[38px] px-3" leftIcon={<UsersIcon className="h-5 w-5" />} onClick={act.resume}>
        Re-publish and Recruit
      </Button>
    </div>
  )

  return (
    <AppShell hideCreate crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="pay" banner={banner || undefined}
        minH={stopped ? 'min-h-[1062px]' : 'min-h-[897px]'} bodyMinH="min-h-[655px]">
        <div className="flex gap-6 px-4 pb-6 pt-4">
          <div className="flex w-[547px] shrink-0 flex-col gap-3">
            <h2 className="text-title-s text-text-title">Billing</h2>
            <BillingCard study={s} stopped={stopped} />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <h2 className="text-title-s text-text-title">Payment Overview</h2>
            {open && (
              <div className="flex flex-col gap-2 rounded-md bg-yellow-30 px-3 py-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex flex-col gap-1">
                    <span className="text-text-regular text-text-subtitle">Net Payable</span>
                    <span className="text-title-l text-text-title">{money(b.outstanding)}</span>
                  </span>
                  <Button size="none" className="h-12 px-5" disabled={b.outstanding <= 0}
                    leftIcon={<InvoiceIcon className="h-5 w-5" />} onClick={() => nav(`/studies/${s.id}/payment`)}>
                    <span className="text-body-medium">Pay Bill</span>
                  </Button>
                </div>
                {INVOICE.dueBy && card && (
                  <span className="flex items-center gap-1.5 text-text-regular text-text-subtitle">
                    To be auto-debited by <span className="text-text-title">{INVOICE.dueBy}</span> by <CardMark brand={card.brand} /><span className="text-text-title">**** {card.last4}</span>
                  </span>
                )}
              </div>
            )}
            {s.state === 'completed' ? (
              <div className="flex gap-3"><Figure label="Total Paid" value={money(b.paid)} /></div>
            ) : (
              <div className="flex gap-3">
                <Figure label="Deposit Paid" value={money(b.deposit)} />
                <Figure label="Total Cost" value={money(b.totalCost)} />
              </div>
            )}

            <h2 className="pt-[25px] text-title-s text-text-title">Transactions</h2>
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.label + t.at} className="flex flex-col gap-2 rounded-md border-1 border-stroke-1 px-3 py-[14px] text-text-regular leading-5">
                  <span className="flex items-center justify-between gap-4 text-text-title">
                    <span className="inline-flex items-center gap-2"><InvoiceIcon className="h-5 w-5" />{t.label}</span><span>{t.amount}</span>
                  </span>
                  <span className="flex items-center justify-between gap-4 text-text-subtitle">
                    <span className="flex flex-col gap-1"><span>{t.at}</span>{t.sub && <span>{t.sub}</span>}</span>
                    <button type="button" className="inline-flex items-center gap-1.5 text-text-title hover:text-brand-primary"
                      onClick={() => toast(`Saved ${save(fileName(`invoice ${t.label} ${t.at}`, 'pdf'), pdf(`Invoice: ${t.label}`, [`Study: ${s.title}`, t.at, t.sub, '', `Amount: ${t.amount}`]))}`)}>
                      <Download className="h-4 w-4" />Invoice
                    </button>
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-text-regular text-text-subtitle">Nothing has been paid on this study yet.</p>}
            </div>
          </div>
        </div>
      </StudyFrame>
      {dialogs}
    </AppShell>
  )
}
