import { useState } from 'react'
import { IconButton } from '../../../components/ui/Button'
import { SearchInput, Select } from '../../../components/ui/Input'
import { ListIcon } from '../../../components/ui/icons'
import Table, { Pagination } from '../../../components/ui/Table'
import { UnderlineTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import { EARNINGS, PAYOUTS, PERIODS, POINTS, REDEEMS, REFERRALS, SORTS } from '../../../mock/profile'
import { EarningsFilters, PayoutDetails, PointsFilters, TransactionDetails } from './walletDialogs'

export type WalletSub = 'earnings' | 'payouts' | 'points' | 'referrals'
export const WALLET_SUBS = [{ key: 'earnings', label: 'Earnings' }, { key: 'payouts', label: 'Payouts' }, { key: 'points', label: 'Reward Points' }, { key: 'referrals', label: 'Referrals' }]

const When = ({ day, time }: { day: string; time: string }) => <span className="flex gap-2">{day}<span aria-hidden="true">•</span>{time}</span>
const Pill = ({ good, children }: { good: boolean; children: string }) => <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-text-regular', good ? 'bg-state-successBg text-state-success' : 'bg-yellow-50 text-brand-primary')}>{children}</span>
const H = ({ children }: { children: string }) => <h3 className="pb-3 pt-5 text-title-s leading-[25px] text-text-title">{children}</h3>
const Period = ({ w = 'w-[196px]' }: { w?: string }) => { const [v, set] = useState(PERIODS[0]!); return <Select size="sm" className={cn(w, 'shrink-0')} value={v} onChange={set} options={PERIODS} /> }
const Sort = () => { const [v, set] = useState(SORTS[0]!); return <Select size="sm" className="w-[196px] shrink-0" value={v} onChange={set} options={SORTS} /> }
const FilterButton = ({ onClick }: { onClick: () => void }) => <IconButton label="Filters" className="rounded-sm" onClick={onClick}><ListIcon className="h-5 w-5" /></IconButton>
const Balance = ({ label, value, total, green }: { label: string; value: string; total: string; green?: boolean }) => (
  <div className={cn('flex h-[69px] items-center justify-between rounded-lg px-4', green ? 'bg-bgAlt-2' : 'bg-yellow-30')}>
    <div><p className="text-body-regular leading-[22px] text-text-subtitle">{label}</p><p className={cn('text-title-m leading-7', green ? 'text-brand-secondary' : 'text-brand-primary')}>{value}</p></div>
    <div className="text-right"><p className="text-label text-text-body">All Time Earned:</p><p className="pt-1 text-body-regular text-text-subtitle">{total}</p></div>
  </div>
)

/**
 * Wallet (2020:160313 Earnings, 2021:165139 Payouts, 2022:166544 Reward
 * Points, 2022:177272 Referrals): the participant's money, as they see it.
 * Rows of Earnings and Payouts open their detail dialogs; the filter buttons
 * open the two Filters dialogs. Nothing here pays, reverses or adjusts.
 * The Reward Points frame is headed "Saved Payment Methods", as drawn.
 */
export default function WalletTab({ sub, onSub }: { sub: WalletSub; onSub: (s: WalletSub) => void }) {
  const [dialog, setDialog] = useState<null | 'tx' | 'payout' | 'earnFilter' | 'pointFilter'>(null)
  const close = () => setDialog(null)
  return (
    <div>
      <UnderlineTabs items={WALLET_SUBS} value={sub} onChange={(k) => onSub(k as WalletSub)} />
      {sub === 'earnings' && (
        <div className="pt-5">
          <Balance label="Wallet Balance" value="$542.60" total="$18,264" />
          <div className="flex gap-3 pb-3 pt-5"><SearchInput size="sm" placeholder="Search transaction..." /><Period w="w-60" /><FilterButton onClick={() => setDialog('earnFilter')} /></div>
          <Table rowHeight={52} rows={EARNINGS} rowKey={(r) => r.id} onRowClick={() => setDialog('tx')} columns={[
            { key: 'what', header: 'Particular', width: '1fr', render: (r) => <span className="-ml-1">{r.what}</span> },
            { key: 'when', header: 'Date - Time', width: 260, sortable: true, render: (r) => <When day={r.day} time={r.time} /> },
            { key: 'id', header: 'Transaction ID', width: 200, render: (r) => r.id },
            { key: 'amount', header: 'Amount', width: 200, sortable: true, render: (r) => <span className="text-state-success">{r.amount}</span> },
          ]} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </div>
      )}
      {sub === 'payouts' && (
        <div>
          <H>Saved Payment Methods</H>
          <div className="flex gap-2">
            {[['American Bank', '4242', true], ['Republic American Bank', '7798', false]].map(([bank, last, def]) => (
              <div key={String(bank)} className="h-20 w-[381px] rounded-lg bg-bg-1 px-4 pt-4">
                <p className="flex gap-2 text-body-regular leading-[22px] text-text-title">{bank}<span aria-hidden="true">•</span><span className="text-body-medium">**** {last}</span></p>
                <p className="flex gap-2 pt-1 text-text-regular leading-5 text-text-subtitle">Expires 08/28{def && <><span aria-hidden="true" className="text-brand-primary">•</span><span className="text-brand-primary">Default</span></>}</p>
              </div>
            ))}
          </div>
          <H>Payout History</H>
          <div className="flex gap-3 pb-3"><SearchInput size="sm" placeholder="Search transaction..." /><Period w="w-60" /><Sort /></div>
          <Table rowHeight={52} rows={PAYOUTS} rowKey={(r) => r.key} onRowClick={() => setDialog('payout')} columns={[
            { key: 'when', header: 'Date - Time', width: 316, sortable: true, render: (r) => <When day={r.day} time={r.time} /> },
            { key: 'to', header: 'To', width: 244, render: (r) => r.to }, { key: 'id', header: 'Transaction ID', width: 200, render: (r) => r.id },
            { key: 'amount', header: 'Amount', width: 200, sortable: true, render: (r) => <span className="text-text-medium">{r.amount}</span> },
            { key: 'status', header: 'Status', width: '1fr', render: (r) => <Pill good={r.status === 'Completed'}>{r.status}</Pill> },
          ]} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </div>
      )}
      {sub === 'points' && (
        <div>
          <H>Saved Payment Methods</H>
          <Balance green label="Balance" value="1244" total="18,264" />
          <H>Points History</H>
          <div className="flex gap-3 pb-3"><SearchInput size="sm" placeholder="Search transaction..." /><Period w="w-60" /><Sort /><FilterButton onClick={() => setDialog('pointFilter')} /></div>
          <Table rowHeight={52} rows={POINTS} rowKey={(r) => r.key} columns={[
            { key: 'what', header: 'Particulars', width: '1fr', render: (r) => <span className="-ml-1 flex gap-2"><span className="text-text-medium">{r.kind}</span><span aria-hidden="true">•</span>{r.what}</span> },
            { key: 'when', header: 'Date - Time', width: 260, sortable: true, render: () => <When day="Jul 22, 2026" time="11:00 PM" /> },
            { key: 'points', header: 'Points', width: 200, sortable: true, render: (r) => <span className="text-body-regular text-state-success">{r.points}</span> },
          ]} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
          <H>Redeem History</H>
          <div className="flex gap-3 pb-3"><SearchInput size="sm" placeholder="Search transaction..." /><Period w="w-60" /></div>
          <Table rowHeight={52} rows={REDEEMS} rowKey={(r) => r.key} columns={[
            { key: 'what', header: 'Particulars', width: '1fr', render: (r) => <span className="-ml-1">{r.what}</span> },
            { key: 'when', header: 'Date - Time', width: 260, sortable: true, render: () => <When day="Jul 22, 2026" time="11:00 PM" /> },
            { key: 'id', header: 'Transaction ID', width: 260, render: () => '#152356789107' },
            { key: 'points', header: 'Points', width: 200, sortable: true, render: (r) => <span className="text-body-regular text-state-danger">{r.points}</span> },
          ]} />
        </div>
      )}
      {sub === 'referrals' && (
        <div className="pt-5">
          <div className="flex gap-3">
            {[['Completed', '6'], ['Joined', '8'], ['Earned', '$150']].map(([l, v]) => (
              <div key={l} className="flex h-14 flex-1 items-center justify-between rounded-md bg-bg-1 px-4"><span className="text-body-regular text-text-title">{l}</span><span className="text-title-s text-brand-primary">{v}</span></div>
            ))}
          </div>
          <h3 className="pb-3 pt-6 text-title-s leading-[25px] text-text-title">8 Referrals</h3>
          <Table rowHeight={52} rows={REFERRALS} rowKey={(r) => r.key} columns={[
            { key: 'name', header: 'Name', width: 380, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> },
            { key: 'email', header: 'Email', width: 380, render: (r) => r.email }, { key: 'joined', header: 'Joined', width: 200, render: (r) => r.joined },
            { key: 'status', header: 'Status', width: '1fr', render: (r) => <Pill good={r.status === 'Completed'}>{r.status}</Pill> },
          ]} />
        </div>
      )}
      <TransactionDetails open={dialog === 'tx'} onClose={close} /><PayoutDetails open={dialog === 'payout'} onClose={close} />
      <EarningsFilters open={dialog === 'earnFilter'} onClose={close} /><PointsFilters open={dialog === 'pointFilter'} onClose={close} />
    </div>
  )
}
