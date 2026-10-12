import { useMemo } from 'react'
import { billing, clientById, financeTotals, ledger, refundCases, refundsPending, studyById } from '@shared/derive'
import type { LedgerKind, LedgerRow } from '@shared/derive'
import { count, dayMonthYear, money, monthDayYearTime } from '@shared/format'
import { consoleType, usePlatform } from '../platform'
import { STUDY_TYPE_LABEL } from '../components/app/StudyTypeTag'
import { billView } from './money'

/**
 * Finance (section 2051:154237), read from the shared platform: every
 * movement of money (shared/derive.ts ledger), the totals over it, and the
 * refunds the platform raises when a study underfills.
 */
export type TxKind = 'all' | 'earning' | 'payouts' | 'payments' | 'refunds'
export const TX_TABS = [{ key: 'all', label: 'All transactions' }, { key: 'earning', label: 'Participant Earning' }, { key: 'payouts', label: 'Participant Payouts' }, { key: 'payments', label: 'Study Payments' }, { key: 'refunds', label: 'Client Refunds' }]
export interface Tx { id: string; date: string; kind?: string; what: string; type: string; to?: string; from?: string; amount: string; row: LedgerRow }

/** The two loose menus (2065:207945, 2065:208135). */
export const TYPE_OPTIONS = ['All Types', 'Participant Earning', 'Participant Payouts', 'Study Payments', 'Client Refunds']
export const PERIOD_OPTIONS = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months']
const PERIOD_DAYS: Record<string, number> = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90, 'Last 6 months': 182 }

const TYPE: Record<LedgerKind, string> = { earning: 'Participant Earning', payout: 'Participant Payout', payment: 'Study Payment', refund: 'Client Refund' }
const TAB: Record<LedgerKind, TxKind> = { earning: 'earning', payout: 'payouts', payment: 'payments', refund: 'refunds' }

/** Growth on last year, from the dated rows; blank when there is nothing last year to compare with. */
const growth = (rows: LedgerRow[], kind: LedgerKind) => {
  const y = new Date().getFullYear()
  const of = (yr: number) => rows.filter((r) => r.kind === kind && new Date(r.at).getFullYear() === yr).reduce((n, r) => n + r.amount, 0)
  const now = of(y), before = of(y - 1)
  return before > 0 ? `${(((now - before) / before) * 100).toFixed(1)}% vs last year` : 'no figures for last year'
}

export function useFinance(tab: TxKind, type: string, period: string, query: string) {
  const state = usePlatform()
  return useMemo(() => {
    const rows = ledger(state)
    const t = financeTotals(state)
    const TILES = [
      { label: 'Clients Spent', value: money(t.clientsSpent), note: growth(rows, 'payment') },
      { label: 'Participants Earned', value: money(t.participantsEarned), note: growth(rows, 'earning') },
      { label: 'Gross Revenue', value: money(t.grossRevenue), note: 'fees on delivered participants' },
      { label: 'Refunds Pending', value: money(t.refundsPending), note: `${t.refundStudies} underfilled studies`, warn: true },
    ]
    const since = PERIOD_DAYS[period] ? Date.now() - PERIOD_DAYS[period]! * 86_400_000 : 0
    const q = query.trim().toLowerCase()
    const TX: Tx[] = rows
      .filter((r) => tab === 'all' || TAB[r.kind] === tab)
      .filter((r) => tab !== 'all' || type === 'All Types' || TYPE_OPTIONS.indexOf(type) === ['earning', 'payout', 'payment', 'refund'].indexOf(r.kind) + 1)
      .filter((r) => new Date(r.at).getTime() >= since)
      .map((r) => {
        const s = r.studyId ? studyById(state, r.studyId) : undefined
        return {
          id: r.id, date: dayMonthYear(r.at), what: r.kind === 'payout' ? r.title : s?.title ?? r.title,
          kind: r.kind === 'payout' ? undefined : r.kind === 'refund' ? 'Study Deposit' : s ? STUDY_TYPE_LABEL[consoleType(s.type)] : 'Study',
          type: TYPE[r.kind], to: r.to, from: r.from, amount: money(r.amount), row: r,
        }
      })
      .filter((r) => !q || `${r.what} ${r.type} ${r.to} ${r.from} ${r.amount}`.toLowerCase().includes(q))
    const pending = refundsPending(state)
    const REFUNDS = pending.map((r) => ({
      id: r.study.id, date: dayMonthYear(r.study.completedAt), type: STUDY_TYPE_LABEL[consoleType(r.study.type)], study: r.study.title,
      client: r.client?.name ?? '', target: String(r.target), shortfall: String(r.shortfall), billed: money(r.billed), refund: money(r.amount),
    }))
    return { TILES, TX, REFUNDS, refundsCount: count(pending.length), refundsTotal: money(t.refundsPending) }
  }, [state, tab, type, period, query])
}

export type Refund = ReturnType<typeof useFinance>['REFUNDS'][number]

/** One refund case: the study, its client, its bill and whether it has been confirmed. */
export function useRefund(studyId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const c = refundCases(state).find((r) => r.study.id === studyId) ?? refundCases(state)[0]
    if (!c) return undefined
    const client = clientById(state, c.study.clientId)
    const v = billView(c.study, client)
    const b = billing(c.study)
    return {
      ...c, client, v, b,
      amount: money(c.amount), billed: money(b.total), deposit: money(b.deposit),
      confirmedAt: monthDayYearTime(c.confirmed?.at), raisedAt: dayMonthYear(c.study.completedAt),
    }
  }, [state, studyId])
}

/** One ledger row for the Transaction Details panel. */
export function useLedgerRow(id?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const r = id ? ledger(state).find((x) => x.id === id) : undefined
    if (!r) return undefined
    const s = r.studyId ? studyById(state, r.studyId) : undefined
    const client = s ? clientById(state, s.clientId) : undefined
    const card = client?.cards.find((c) => c.isDefault) ?? client?.cards[0]
    return { row: r, study: s, type: s ? consoleType(s.type) : undefined, at: monthDayYearTime(r.at), amount: money(r.amount), card }
  }, [state, id])
}
