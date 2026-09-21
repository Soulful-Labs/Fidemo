import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'
import { ViewAll } from '../dashboard/SectionHeader'
import { PayoutRow } from './bits'
import TypeFilter from '../studies/TypeFilter'

const RANGES = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']
const SORTS = [{ key: 'new', label: 'Sort: Newest First' }, { key: 'old', label: 'Sort: Oldest First' }]

/**
 * PRD 10.1, Figma 969:29063 and 969:29231: the Payout Account card, then
 * Payout History with three rows and View All, which expands into the full
 * history with its range and sort filters.
 */
export default function Payouts() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { payoutMethods, payouts } = useStore()
  const [all, setAll] = useState(false)
  const [range, setRange] = useState('All Time')
  const [sort, setSort] = useState('new')
  const account = payoutMethods.find((m) => m.isDefault) ?? payoutMethods[0]

  const since = (() => {
    const d = new Date()
    if (range === 'This Month') d.setDate(1)
    else if (range === 'Last Month') d.setMonth(d.getMonth() - 1, 1)
    else if (range === 'Last 3 Months') d.setMonth(d.getMonth() - 3)
    else if (range === 'Last 6 Months') d.setMonth(d.getMonth() - 6)
    else return 0
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })()
  const list = payouts
    .filter((p) => new Date(p.at).getTime() >= since)
    .sort((a, b) => (sort === 'new' ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at)))

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title={all ? 'Payout History' : 'Payout'} onBack={() => (all ? setAll(false) : back())} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        {!all && (
          <section className="flex flex-col gap-3">
            <h2 className="text-body-medium text-text-title">Payout Account</h2>
            {account ? (
              <div className="flex flex-col gap-3 rounded-lg bg-bgAlt-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-regular text-text-body">Account Number</span>
                    <span className="text-body-regular text-text-title">{account.accountNumber}</span>
                  </div>
                  {account.isDefault && <Tag tone="outline">Default</Tag>}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-body">Routing/Swift Code</span>
                  <span className="text-body-regular text-text-title">{account.routingCode}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-body">Bank Name</span>
                  <span className="text-body-regular text-text-title">{account.bankName}</span>
                </div>
                <Button variant="secondary" fullWidth onClick={() => navigate('/wallet/payout-methods')}>Manage Payout Methods</Button>
              </div>
            ) : (
              <EmptyState title="No payout account added yet!" actionLabel="Add Payout Account" onAction={() => navigate('/wallet/payout-methods/add')} />
            )}
          </section>
        )}

        <section className="flex flex-col gap-2">
          {all ? (
            <div className="flex items-center gap-2">
              <TypeFilter value={range} options={RANGES.map((r) => ({ key: r, label: r }))} onChange={setRange} />
              <TypeFilter value={sort} options={SORTS} onChange={setSort} />
            </div>
          ) : (
            <h2 className="text-body-medium text-text-title">Payout History</h2>
          )}
          {list.length === 0 ? (
            <EmptyState
              title="No payouts made yet! Browse the studies and start earning now!"
              actionLabel="Participate in studies and earn"
              onAction={() => navigate('/studies')}
            />
          ) : (
            (all ? list : list.slice(0, 3)).map((p) => <PayoutRow key={p.id} payout={p} />)
          )}
          {!all && list.length > 0 && (
            <div className="pt-2"><ViewAll onClick={() => setAll(true)} /></div>
          )}
        </section>
      </div>
    </div>
  )
}
