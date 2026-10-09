import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import { SearchInput, Select } from '../../components/ui/Input'
import { ChevronRight } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { PERIOD_OPTIONS, REFUNDS, TILES, TX, TX_TABS, TYPE_OPTIONS } from '../../mock/finance'
import type { Refund, Tx, TxKind } from '../../mock/finance'
import TransactionDetails from './TransactionDetails'
import type { DetailKind } from './TransactionDetails'

const what = (r: Tx) => r.kind ? <span className="flex gap-2">{r.kind}<span aria-hidden="true">•</span>{r.what}</span> : r.what
const party = (v?: string) => <span className={v === 'HumanLayer' ? 'text-text-body' : undefined}>{v}</span>
const COLS: Record<TxKind, Column<Tx>[]> = {
  all: [{ key: 'd', header: 'Date', width: 120, sortable: true, render: (r) => r.date }, { key: 'w', header: 'Transaction', width: '1fr', render: what },
    { key: 't', header: 'Type', width: 180, render: (r) => r.type }, { key: 'to', header: 'To', width: 180, render: (r) => party(r.to) }, { key: 'f', header: 'From', width: 180, render: (r) => party(r.from) },
    { key: 'a', header: 'Amount', width: 126, sortable: true, render: (r) => r.amount }],
  earning: [], payouts: [], payments: [], refunds: [],
}
const single = (w: number, last: 'to' | 'from', label: string): Column<Tx>[] => [
  { key: 'd', header: 'Date', width: 120, sortable: true, render: (r) => r.date }, { key: 'w', header: 'Transaction', width: '1fr', render: what },
  { key: 't', header: 'Type', width: w, render: (r) => r.type }, { key: last, header: label, width: 200, render: (r) => r[last] }, { key: 'a', header: 'Amount', width: 166, sortable: true, render: (r) => r.amount }]
COLS.earning = single(200, 'to', 'To'); COLS.payouts = single(200, 'to', 'To'); COLS.payments = single(200, 'from', 'From'); COLS.refunds = single(180, 'to', 'To')

/**
 * Finance (`/finance`, `?tx=...`; Refunds at `/finance/refunds`): Overview and
 * Refunds. Overview: four all-time tiles, then "Transactions" in five
 * underline tabs over one table. The tabs differ 2.5-2.8%: the underline,
 * the type dropdown (All only), the columns. A row opens its Transaction
 * Details. Refunds lists "Pending Refund Confirmations", each with Review.
 */
export default function Finance({ refunds }: { refunds?: boolean }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const k = params.get('tx')
  const tab: TxKind = TX_TABS.some((t) => t.key === k) ? (k as TxKind) : 'all'
  const [detail, setDetail] = useState<DetailKind | null>(null)
  const [type, setType] = useState(TYPE_OPTIONS[0]!)
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]!)
  const open = (r: Tx) => {
    if (r.type.startsWith('Participant Earning')) setDetail('earning')
    else if (r.type.startsWith('Participant Payout')) setDetail('payouts')
    else if (r.type.startsWith('Study Payment')) setDetail('payments')
    else navigate('/finance/refunds')
  }
  const refundCols: Column<Refund>[] = [
    { key: 'd', header: 'Date', width: 110, sortable: true, render: (r) => r.date }, { key: 's', header: 'Study', width: '1fr', render: (r) => <span className="flex gap-2">{r.type}<span aria-hidden="true">•</span>{r.study}</span> },
    { key: 'c', header: 'Client', width: 130, render: (r) => r.client }, { key: 't', header: 'Target', width: 74, render: (r) => r.target }, { key: 'sh', header: 'Shortfall', width: 74, render: (r) => r.shortfall },
    { key: 'b', header: 'Billed', width: 98, sortable: true, render: (r) => r.billed }, { key: 'r', header: 'Refund', width: 92, sortable: true, render: (r) => <span className="text-state-destructive">{r.refund}</span> },
    { key: 'x', header: '', width: 84, render: () => <span className="flex items-center justify-end gap-1 text-text-medium text-brand-primary">Review<ChevronRight className="h-4 w-4" /></span> },
  ]
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Finance' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={refunds ? 'refunds' : 'overview'} onChange={(v) => navigate(v === 'refunds' ? '/finance/refunds' : '/finance')}
        items={[{ key: 'overview', label: 'Overview' }, { key: 'refunds', label: 'Refunds' }]} />
      {refunds ? (
        <>
          <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Pending Refund Confirmations</h2>
          <p className="pt-1 text-text-regular leading-5 text-text-body">Confirm the pending refund transactions to clients for studies</p>
          <div className="mt-3 flex h-[84px] items-center justify-between rounded-lg border-1 border-stroke-1 bg-bgAlt-1 px-4">
            <div><p className="text-text-regular text-text-title">Refunds Pending</p><p className="pt-1 text-title-l text-state-destructive">24</p></div>
            <div className="text-right"><p className="text-text-regular text-text-title">Total client refund value</p><p className="pt-1 text-title-l text-state-destructive">$38,956</p></div>
          </div>
          <Table className="mt-4" rowHeight={56} rows={REFUNDS} rowKey={(r) => r.id} columns={refundCols} onRowClick={(r) => navigate(`/finance/refunds/${r.id}`)} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </>
      ) : (
        <>
          <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Finance Overview</h2>
          <p className="pt-1 text-text-regular leading-5 text-text-body">Quick all-time insights of key financial metrics running across the platform</p>
          <div className="mt-3 grid grid-cols-4 rounded-lg border-1 border-stroke-1">
            {TILES.map((t, i) => (
              <div key={t.label} className={cn('px-4 pb-3.5 pt-3', i > 0 && 'border-l-1 border-stroke-1')}>
                <p className="text-body-regular text-text-subtitle">{t.label}</p>
                <p className="pt-2 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-text-title">{t.value}</p>
                <p className={cn('pt-2 text-text-regular', t.warn ? 'text-state-destructive' : 'text-state-success')}>{t.warn ? '' : '↑ '}{t.note}</p>
              </div>
            ))}
          </div>
          <h2 className="pb-3 pt-7 text-title-s leading-[25px] text-text-title">Transactions</h2>
          <UnderlineTabs items={TX_TABS} value={tab} onChange={(v) => setParams(v === 'all' ? {} : { tx: v }, { replace: true })} />
          <div className="flex gap-3 pb-3 pt-4">
            <SearchInput size="sm" placeholder="Search transaction by name, type, amount..." />
            {tab === 'all' && <Select size="sm" className="w-[200px] shrink-0" value={type} onChange={setType} options={TYPE_OPTIONS} />}
            <Select size="sm" className="w-[112px] shrink-0" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
          </div>
          <Table rowHeight={52} rows={TX[tab]} rowKey={(r) => r.id} columns={COLS[tab]} onRowClick={open} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </>
      )}
      <TransactionDetails kind={detail} onClose={() => setDetail(null)} />
    </AppShell>
  )
}
