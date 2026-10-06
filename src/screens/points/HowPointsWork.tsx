import { useAppNav } from '../../app/useAppNav'
import TopBar from '../../components/ui/TopBar'
import { PointsCoin } from '../../components/ui/icons'
import { POINTS, REDEEM } from '../../lib/rules'

function Person() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="shrink-0">
      <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 20c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5M18 9v6M15 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Dollar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="shrink-0">
      <path d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * PRD 8.2 Earn Reward Points, Figma 1114:96262, at the policy's values
 * (section 4). The drawn "Points have no expiry" line is not in the policy
 * and is not shown; the Good to know lines are the policy's own.
 */
const WAYS = [
  { title: 'Being Referred', sub: 'When someone refers you to join, once', value: POINTS.BEING_REFERRED },
  { title: 'Referral', sub: 'Refer someone who joins', value: POINTS.REFERRAL },
  { title: 'Study Completion', sub: 'Complete a study and get paid', value: POINTS.STUDY_COMPLETION },
  { title: 'Full Profile Completion', sub: 'Fill in every section of your profile', value: POINTS.FULL_PROFILE },
  { title: 'Streak Completion', sub: 'Maintain your participation streak', value: POINTS.STREAK },
]

function Row({ icon, title, sub, value, note }: { icon: React.ReactNode; title: string; sub: string; value: number; note?: string }) {
  return (
    <div className="flex items-start gap-3 border-b-1 border-stroke-3 py-3 last:border-b-0">
      <span className="text-brand-secondary">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-medium text-text-title">{title}</span>
        <span className="text-text-regular text-text-body">{sub}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="flex items-center gap-1 text-body-medium text-brand-secondary"><PointsCoin className="h-4 w-4" />{value}</span>
        {note && <span className="text-text-regular text-text-subtitle">{note}</span>}
      </span>
    </div>
  )
}

export default function HowPointsWork() {
  const { back } = useAppNav()
  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Earn Reward Points" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-900/60"><PointsCoin className="h-12 w-12 text-brand-secondary" /></span>
          <p className="pt-2 text-body-medium text-brand-secondary">Earn reward points - redeem to cash!</p>
          <p className="text-text-regular text-text-body">Participate and earn reward points which are redeemable to wallet as real cash.</p>
        </div>
        <span className="h-px w-full bg-stroke-3" />
        <h2 className="text-center text-body-medium text-text-title">How Reward Points Works</h2>

        <section className="rounded-lg bg-bgAlt-2 px-4 py-2">
          <p className="py-2 text-body-medium text-brand-primary">Ways To Earn</p>
          {WAYS.map((w) => <Row key={w.title} icon={<Person />} title={w.title} sub={w.sub} value={w.value} />)}
        </section>

        <section className="rounded-lg bg-bgAlt-2 px-4 py-2">
          <p className="py-2 text-body-medium text-brand-primary">Redeem Points</p>
          <Row icon={<Dollar />} title="Wallet Redemption" sub="Convert points into cash" value={REDEEM.PER_USD} note="= $1 USD" />
          <Row icon={<span className="w-5" />} title="Minimum Redemption" sub="The minimum points required to redeem" value={REDEEM.MINIMUM} />
        </section>

        <section className="flex flex-col gap-2 rounded-lg bg-bgAlt-2 p-4">
          <p className="text-body-medium text-text-title">Good to know</p>
          {[
            'Points are a separate reward balance and never affect Trust Score.',
            'Points are not deducted for missed, late or cancelled sessions.',
            `Points can be redeemed to the wallet at ${REDEEM.PER_USD} points = $1 USD, with a minimum of ${REDEEM.MINIMUM.toLocaleString('en-US')} points.`,
          ].map((line) => (
            <p key={line} className="flex items-start gap-2 text-text-regular text-text-subtitle">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="mt-0.5 shrink-0 text-brand-primary"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {line}
            </p>
          ))}
        </section>
      </div>
    </div>
  )
}
