import RollingNumber from '../../components/motion/RollingNumber'
import { useNavigate } from 'react-router-dom'
import StatTile from '../../components/app/StatTile'
import { Clock, Dollar, ListIcon } from '../../components/ui/icons'
import { money, moneyDelta } from '../../lib/format'
import { STATUS } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import SectionHeader from './SectionHeader'

function Coin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v9M14.5 9.5c0-1-1.1-1.5-2.5-1.5s-2.5.6-2.5 1.5 1.1 1.5 2.5 1.5 2.5.6 2.5 1.5-1.1 1.5-2.5 1.5-2.5-.6-2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** The four overview tiles (PRD 5.1). Each routes per the button table. */
export default function OverviewTiles() {
  const navigate = useNavigate()
  const { user, studies, transactions } = useStore()

  const inReview = studies.filter((s) => STATUS[s.status].tab === 'applied').length

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const lastMonthStart = new Date(monthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)

  const total = (from: Date, to?: Date) =>
    transactions
      .filter((t) => {
        const at = new Date(t.at)
        return at >= from && (!to || at < to)
      })
      .reduce((sum, t) => sum + t.amount, 0)

  const thisMonth = total(monthStart)
  // The delta is the change against last month, not a repeat of the value.
  const change = thisMonth - total(lastMonthStart, monthStart)

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Overview" />
      <div className="grid grid-cols-2 gap-2">
        <StatTile tint="yellow" icon={<Dollar />} label="Wallet Balance" value={<RollingNumber value={user.walletBalance} format={money} step={0.01} memory="wallet" float />} onClick={() => navigate('/wallet')} />
        <StatTile
          tint="green" icon={<Coin />}
          label="This Month"
          value={money(thisMonth)}
          delta={change !== 0 ? moneyDelta(change) : undefined}
          deltaLabel={change !== 0 ? 'vs last month' : undefined}
          onClick={() => navigate('/wallet')}
        />
        <StatTile tint="purple" icon={<Clock className="h-5 w-5" />} label="Studies In Review" value={String(inReview)} onClick={() => navigate('/studies/mine/applied')} />
        <StatTile tint="blue" icon={<ListIcon />} label="All Time Studies" value={String(user.completedStudies)} onClick={() => navigate('/studies/mine/history')} />
      </div>
    </section>
  )
}
