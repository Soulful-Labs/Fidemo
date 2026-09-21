import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { PointsCoin } from '../../components/ui/icons'
import { money, points } from '../../lib/format'
import { useStore } from '../../mock/store'
import { ViewAll } from '../dashboard/SectionHeader'
import TaxFormBanner from './TaxFormBanner'
import { CoinIcon, EarningRow, PayoutsIcon, RowCard } from './bits'

function CoinBadge() {
  return (
    <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true" className="shrink-0">
      <path d="M28 3l5.4 3.4 6.3-.7 2.5 5.9 5.9 2.5-.7 6.3L51 26l-3.6 5.4.7 6.3-5.9 2.5-2.5 5.9-6.3-.7L28 49l-5.4-3.6-6.3.7-2.5-5.9-5.9-2.5.7-6.3L5 26l3.6-5.4-.7-6.3 5.9-2.5 2.5-5.9 6.3.7L28 3Z" className="fill-yellow-1000" />
      <circle cx="28" cy="26" r="12" className="fill-brand-primary" />
      <path d="M28 18.5v15M31.5 21.5c0-1.5-1.6-2.3-3.5-2.3s-3.5.8-3.5 2.3 1.6 2.3 3.5 2.3 3.5.8 3.5 2.3-1.6 2.3-3.5 2.3-3.5-.8-3.5-2.3" className="stroke-bg-0" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** PRD 10.1, Figma 969:29004. The wallet home on the green palette. */
export default function Wallet() {
  const navigate = useNavigate()
  const { user, transactions, toast } = useStore()
  const blocked = user.taxFormRequired

  return (
    <div className="flex min-h-full flex-col gap-4 bg-bgAlt-0 px-4 pb-6 pt-4">
      <section className="flex flex-col gap-4 rounded-lg bg-bgAlt-2 bg-green-fade p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-body-regular text-text-subtitle">Wallet Balance</span>
            <span className="text-display-s text-brand-primary">{money(user.walletBalance)}</span>
          </div>
          <CoinBadge />
        </div>
        <Button fullWidth disabled={blocked} onClick={() => navigate('/wallet/withdraw')}
          onBlocked={() => toast('Withdrawals open once your tax form is on file')}>
          Withdraw
        </Button>
        {user.pendingEarnings > 0 && (
          <p className="text-center text-text-regular text-text-body">
            {money(user.pendingEarnings)} awaiting client approval, then it moves to your balance
          </p>
        )}
        <p className="flex items-center gap-3 text-text-regular text-text-body">
          <span className="h-px flex-1 bg-stroke-3" />
          All Time Earned: <span className="text-text-title">{money(user.allTimeEarned)}</span>
          <span className="h-px flex-1 bg-stroke-3" />
        </p>
      </section>

      <TaxFormBanner />

      <RowCard to="/points" icon={<PointsCoin className="h-5 w-5" />} label="Reward Points" value={points(user.points)} />

      <section className="flex flex-col gap-2 rounded-lg bg-bgAlt-2 p-4">
        <p className="flex items-center gap-2 text-body-medium text-text-title">
          <CoinIcon className="text-brand-primary" />
          Earning History
        </p>
        {transactions.slice(0, 3).map((tx) => <EarningRow key={tx.id} tx={tx} />)}
        <div className="pt-2"><ViewAll to="/wallet/earnings" /></div>
      </section>

      <RowCard to="/wallet/payouts" icon={<PayoutsIcon />} label="Payouts" />
    </div>
  )
}
