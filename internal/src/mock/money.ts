import { billing, invoiceNumber } from '@shared/derive'
import { clockTime, dayLongMonthYear, money, monthDayYear, monthDayYearTime } from '@shared/format'
import type { Client, Study } from '@shared/types'

/**
 * One study's bill as every console screen writes it: the Pay tab, the
 * Review Payment tab, the client's invoice panel and the refund detail. All
 * of it is shared/derive.ts `billing`, so the same study shows one set of
 * numbers wherever it appears.
 */
export interface BillLineView { label: string; detail?: string; amount: string; info?: boolean }

export function billView(study: Study, client?: Client) {
  const b = billing(study)
  const card = client?.cards.find((c) => c.isDefault) ?? client?.cards[0]
  const deposit = study.payments.find((p) => p.kind === 'deposit')
  const balance = study.payments.find((p) => p.kind === 'balance')
  const refund = study.payments.find((p) => p.kind === 'refund')
  const dueBy = study.completedAt ? new Date(new Date(study.completedAt).getTime() + 7 * 86_400_000).toISOString() : undefined
  const lines: BillLineView[] = b.lines.map((l) => ({ label: l.label, detail: l.sub, amount: money(l.amount), info: l.info }))
  return {
    b, lines, card,
    total: money(b.total), totalCost: money(b.totalCost), depositAmount: money(b.deposit), net: money(b.net),
    outstanding: money(b.outstanding), due: money(study.state === 'completed' ? b.outstanding : b.due), refund: money(b.refund),
    depositLine: { label: 'Less: Incentive Deposit', detail: `$${study.rates.incentivePer} x ${study.required} participants`, amount: `-${money(b.deposit)}`, info: true } as BillLineView,
    invoice: invoiceNumber(study),
    issued: study.completedAt ? `Marked completed and invoice issued on ${dayLongMonthYear(study.completedAt)}, ${clockTime(study.completedAt)}` : 'Not marked completed yet',
    dueBy: dueBy ? monthDayYear(dueBy) : '',
    paidAt: monthDayYearTime(balance?.at), paidAmount: money(balance?.amount ?? 0),
    transactions: [deposit, balance, refund].filter((p): p is NonNullable<typeof p> => Boolean(p)).map((p) => ({
      label: p.kind === 'deposit' ? 'Incentive Deposit Paid' : p.kind === 'balance' ? 'Balance Paid' : 'Refund Paid', amount: money(p.amount), at: monthDayYearTime(p.at),
      detail: p.kind === 'deposit' ? `$${study.rates.incentivePer} x ${study.required} participants` : `Invoice ${invoiceNumber(study)}`,
    })),
  }
}

export type BillView = ReturnType<typeof billView>
