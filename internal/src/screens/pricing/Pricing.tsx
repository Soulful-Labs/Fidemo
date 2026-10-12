import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Pill from '../../components/app/Pill'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { DEDUCTED_VIEW, EARNED, EARNED_STARS, POINTS, TIERS_VIEW, FEE } from '../../mock/pricing'
import { Head, Value } from './parts'

const Rows = ({ title, rows, sub }: { title: string; rows: string[][]; sub?: string[][] }) => (
  <div className="rounded-lg border-1 border-stroke-1 bg-bg-1 px-4 pb-2 pt-4">
    <h3 className="pb-1 text-body-regular text-text-title">{title}</h3>
    {rows.map(([l, v], i) => <p key={l} className={cn('flex justify-between py-[9.5px] text-body-regular', i > 0 && 'border-t-1 border-stroke-input')}><span className="text-text-subtitle">{l}</span><span className="text-text-title">{v}</span></p>)}
    {sub?.map(([l, v], i) => <p key={l} className={cn('flex justify-between py-[9.5px] text-text-regular', i > 0 ? 'border-t-1 border-stroke-input' : '-mt-2.5')}><span className="text-text-subtitle">{l}</span><span className="text-text-title">{v}</span></p>)}
  </div>
)
export const AddOn = ({ amount, pills }: { amount: string; pills: [string | undefined, string][] }) => (
  <div className="flex-1 rounded-md bg-bg-2 px-3 py-3"><p className="text-title-s text-text-title">{amount}</p>
    <p className="flex items-center gap-2 pt-1.5 text-text-regular text-text-subtitle">For{pills.map(([l, v]) => <Pill key={v} label={l} className="h-7 px-2.5">{v}</Pill>)}</p></div>
)

/**
 * Pricing & Rewards (Fees 2051:176489, Gamification 2058:194308): two
 * segments of read-only values, each group with its own Edit button.
 * Fees: Clients (Platform, Moderation, Recruitment with two add-ons) and
 * Participants (Withdrawal, Reward Points Value).
 * Gamification: Tiers, Trust Score (Earned For, Deducted For), Reward Points.
 * Every figure is as drawn; several disagree with the signed policy.
 */
export default function Pricing() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const gami = params.get('tab') === 'gamification'
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Pricing & Rewards' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={gami ? 'gamification' : 'fees'} onChange={(k) => setParams(k === 'fees' ? {} : { tab: k }, { replace: true })}
        items={[{ key: 'fees', label: 'Fees' }, { key: 'gamification', label: 'Gamification' }]} />
      {gami ? (
        <div className="flex flex-col gap-6 pt-6">
          <section><Head title="Tiers" note="Set conditions for tiers" action="Edit Tiers" onEdit={() => navigate('/pricing/tiers')} />
            <div className="grid grid-cols-3 gap-3">{TIERS_VIEW.map(([l, v]) => <Value key={l} label={l!} value={v} note="Equal or above trust score" />)}</div></section>
          <section><Head title="Trust Score" note="Set the score changes for different rules" action="Edit Trust Score" onEdit={() => navigate('/pricing/trust-score')} />
            <div className="grid grid-cols-2 gap-3"><Rows title="Earned For" rows={EARNED} sub={EARNED_STARS} /><Rows title="Deducted For" rows={DEDUCTED_VIEW} /></div></section>
          <section><Head title="Reward Points" note="Set reward points for different sources to earn them" action="Edit Reward Points" onEdit={() => navigate('/pricing/reward-points')} />
            <div className="grid grid-cols-3 gap-3">{POINTS.map(([l, v, n]) => <Value key={l} label={l!} value={v} note={n} />)}</div></section>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-6">
          <section><Head title="Clients" note="Configure study pricing by industry or other filters, and the charges" action="Edit Fees" onEdit={() => navigate('/pricing/client-fees')} />
            <div className="grid grid-cols-2 gap-3"><Value label="Platform Fees" value={FEE.platform} note="One-time per study" /><Value label="Moderation Fees" value={FEE.moderation} note="One-time per completed participant" /></div>
            <Value className="mt-3" label="Recruitment Fees" note="One-time per completed participant">
              <p className="flex items-baseline gap-2 pt-2 text-title-m leading-7 text-text-title">{FEE.recruitmentBase}<span className="text-text-regular text-text-subtitle">Base</span></p>
              <div className="flex gap-2 pt-2"><AddOn amount={FEE.typeAddOn} pills={[['Study Type:', 'Video Call, In-Person, Diary Study'], [undefined, 'Roles']]} /><AddOn amount={FEE.skillsAddOn} pills={[[undefined, 'Skills']]} /></div>
            </Value></section>
          <section><Head title="Participants" note="Manage charges and rewards for participants" action="Edit Fees" onEdit={() => navigate('/pricing/participant-fees')} />
            <div className="grid grid-cols-2 gap-3"><Value label="Withdrawal" value={FEE.withdrawal} note="One-time charge per withdrawal" /><Value label="Reward Points Value" value={FEE.pointValue} note="For 100 Reward Coins" /></div></section>
        </div>
      )}
    </AppShell>
  )
}
