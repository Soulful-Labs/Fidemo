import { useMemo } from 'react'
import { balanceDueBy, billing, counts, depositLabel, invoiceNumber, progressPct } from '@shared/derive'
import { clockTime, dayLongMonthYear, dayMonthYear, money, monthDayYear, monthDayYearTime } from '@shared/format'
import { useClient, useStudies } from '../platform'
import { DEPOSIT_RULE } from '@shared/platform'

/** A line of the billing card (1627:96779). `sub` is the working under it. */
export interface BillingRow {
  label: string
  amount: string
  sub?: string
  info?: boolean
}

/**
 * Everything the billing card, the invoice panel, Make Payment, Bill Payment
 * and the "paid" dialog write about one study's money. All of it comes from
 * shared/derive.ts `billing`, so the same study cannot show two totals. Only
 * the labels and the checkout's sample card form are this app's own.
 */
export function useBill(studyId?: string) {
  const { studies } = useStudies()
  const client = useClient()
  return useMemo(() => {
    const study = studies.find((x) => x.id === studyId) ?? studies.find((x) => x.state === 'billing' || x.state === 'completed') ?? studies[0]
    // When recruiting stopped (Billing, 22 Oct 2026), or the old completion date.
    const marked = study?.stoppedAt ?? study?.completedAt
    const b = study ? billing(study) : undefined
    const c = study ? counts(study) : undefined
    const card = client?.cards.find((x) => x.isDefault) ?? client?.cards[0]
    const number = study ? invoiceNumber(study) : ''
    const due = b ? (b.outstanding > 0 ? b.outstanding : Math.max(0, b.net)) : 0
    const balance = study?.payments.find((x) => x.kind === 'balance')
    const dueBy = study ? balanceDueBy(study) : undefined
    const BILLING: BillingRow[] = (b?.lines ?? []).map((l) => ({ label: l.label, amount: money(l.amount), sub: l.sub, info: l.info }))
    return {
      study, card,
      BILLING,
      BILLING_TOTAL: {
        total: { label: 'Total Recruiting Cost', amount: money(b?.total ?? 0) },
        less: { label: (b?.less ?? []).map((l) => l.label).join(', ') || 'Less: Deposits', amount: `-${money(b?.deposit ?? 0)}`, sub: DEPOSIT_RULE, info: true },
        net: { label: 'Net Payable', amount: money(b?.net ?? 0) },
      },
      INVOICE: {
        title: `Invoice Details (${number}) - ${study?.title ?? ''}`,
        number: `Invoice Number: ${number}`,
        study: study?.title ?? '',
        issued: marked ? `Marked completed and invoice issued on ${dayLongMonthYear(marked)}, ${clockTime(marked)}` : '',
        amount: money(due),
        due: dueBy ? `Due on ${monthDayYear(dueBy)}` : '',
        dueBy: dueBy ? dayMonthYear(dueBy) : '',
        paidTitle: `Paid ${money(balance?.amount ?? 0)} successfully!`,
        paidAt: monthDayYearTime(balance?.at),
        net: { label: 'Net Total Paid', amount: money(balance?.amount ?? due) },
      },
      MAKE_PAYMENT: { toPay: 'To Pay', amount: money(due), link: 'Invoice Details', from: 'From saved card', change: 'Change method', cta: `Pay ${money(due)}` },
      PAID_MODAL: { title: `${money(balance?.amount ?? due)} paid successfully!`, body: 'Your payment has been done and this study has been completed.' },
      BILL: {
        ...BILL_COPY,
        completed: String(c?.completed ?? 0), completedOf: `/${study?.required ?? 0}`,
        qualified: String(c?.everQualified ?? 0), qualifiedOf: `/${c?.everApplied ?? 0}`,
        progress: `${study ? progressPct(study) : 0}%`,
        markedAt: marked ? `Marked completed on ${dayLongMonthYear(marked)}, ${clockTime(marked)}` : 'Not marked completed yet',
        card: { ...BILL_COPY.card, name: client?.name ?? '', cta: `Pay ${money(due)}` },
      },
      /** The deposits, the bill and any refund as the Transactions list writes them (23 Oct 2026), newest first. */
      transactions: [...(study?.payments ?? [])].sort((x, y) => y.at.localeCompare(x.at)).map((x) => ({
        label: x.kind === 'deposit' ? depositLabel(x.stage ?? 'upfront') : x.kind === 'balance' ? 'Net Payable Bill' : 'Refund Received',
        amount: money(x.amount), at: monthDayYearTime(x.at),
        sub: x.kind === 'deposit' ? '' : `Invoice ${number}`,
      })),
    }
  }, [studies, studyId, client])
}

/** Bill Payment (1627:96956): the checkout Pay Balance opens. */
const BILL_COPY = {
  crumb: 'Bill Payment',
  status: 'Billing',
  heading: 'Invoice Breakdown',
  card: {
    title: 'Payment',
    number: '2548 2698 5420 0008',
    expiry: '05 / 2036',
    cvv: '672',
    address: 'Kelly-Bay, NYC',
    zip: '023548',
  },
  notes: [
    { text: 'You are only charged for participants that complete your research.' },
  ] as { text: string; link?: string }[],
}
