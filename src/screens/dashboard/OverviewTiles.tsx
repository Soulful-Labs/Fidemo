import { useNavigate } from 'react-router-dom'
import StatTile from '../../components/app/StatTile'
import { money, moneyDelta } from '../../lib/format'
import { STATUS } from '../../lib/studyState'
import { useStore } from '../../mock/store'

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
    <div className="grid grid-cols-2 gap-3">
      <StatTile label="Wallet Balance" value={money(user.walletBalance)} onClick={() => navigate('/wallet')} />
      <StatTile
        label="This Month"
        value={money(thisMonth)}
        delta={change !== 0 ? moneyDelta(change) : undefined}
        onClick={() => navigate('/wallet')}
      />
      <StatTile label="Studies In Review" value={String(inReview)} onClick={() => navigate('/studies/mine/applied')} />
      <StatTile label="All Time Studies" value={String(user.completedStudies)} onClick={() => navigate('/studies/mine/history')} />
    </div>
  )
}
