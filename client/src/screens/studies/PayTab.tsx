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
 * Paying the bill completes it. The drawn "auto-debited" line is not built.
 */
export default function PayTab() {
  const toast = useToast()
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStudy(id)
  const b = billing(s)
  const { INVOICE, transactions } = useBill(s.id)
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
              <div className="flex h-[79px] items-center justify-between rounded-md bg-yellow-30 px-3">
                <span className="flex flex-col gap-1">
                  <span className="text-text-regular text-text-subtitle">{INVOICE.dueBy ? `Payment Due by ${INVOICE.dueBy}` : 'Payment Due'}</span>
                  <span className="text-title-l text-text-title">{money(b.outstanding)}</span>
                </span>
                <Button size="none" className="h-12 px-5" disabled={b.outstanding <= 0}
                  leftIcon={<InvoiceIcon className="h-5 w-5" />} onClick={() => nav(`/studies/${s.id}/payment`)}>
                  <span className="text-body-medium">Pay Bill</span>
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <Figure label="Deposit Paid" value={money(b.deposit)} />
              <Figure label="Total Cost" value={money(b.totalCost)} />
            </div>

            <h2 className="pt-[25px] text-title-s text-text-title">Transactions</h2>
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div key={t.label + t.at} className="flex justify-between gap-4 rounded-md border-1 border-stroke-1 px-3 py-[14px]">
                  <span className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-text-regular leading-5 text-text-title">
                      <InvoiceIcon className="h-5 w-5 text-text-title" />{t.label}
                    </span>
                    <span className="flex flex-col gap-1 text-text-regular leading-5 text-text-subtitle"><span>{t.at}</span><span>{t.sub}</span></span>
                  </span>
                  <span className="flex flex-col items-end justify-between gap-2">
                    <span className="text-text-regular leading-5 text-text-title">{t.amount}</span>
                    <Button variant="tertiary" size="none" className="h-[38px] px-3"
                      onClick={() => toast(`Saved ${save(fileName(`invoice ${t.label} ${t.at}`, 'pdf'), pdf(`Invoice: ${t.label}`, [`Study: ${s.title}`, t.at, t.sub, '', `Amount: ${t.amount}`]))}`)}
                      leftIcon={<Download className="h-4 w-4" />}>Invoice</Button>
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
