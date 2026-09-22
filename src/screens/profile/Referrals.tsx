import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { Copy, Share } from '../../components/ui/icons'
import { money } from '../../lib/format'
import { POINTS, pointsToUsd } from '../../lib/rules'
import { referralLink } from '../../lib/profile'
import { useStore } from '../../mock/store'
import { Avatar } from './Profile'
import { ReferIcon } from './profileIcons'

/**
 * PRD 9, Figma 1114:96038, string for string: the Earned stat is drawn in
 * dollars (the points earned at the redemption rate) and the rows show the
 * full address as drawn. One scheme only: 200 points when the referred
 * person completes their first study.
 */
export default function Referrals() {
  const { back } = useAppNav()
  const { user, referrals, toast } = useStore()
  const REFERRAL_LINK = referralLink(user.name, user.email)
  const joined = referrals.length
  const completed = referrals.filter((r) => r.status === 'completed').length
  const earned = money(pointsToUsd(completed * POINTS.REFERRAL))

  const copy = async () => {
    try { await navigator.clipboard.writeText(REFERRAL_LINK) } catch { /* clipboard unavailable outside a secure context */ }
    toast('Link copied')
  }
  const invite = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join HumanLayer', url: REFERRAL_LINK }); return } catch { /* dismissed */ }
    }
    await copy()
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Refer & Earn" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <section className="flex flex-col gap-4 rounded-lg bg-bg-1 bg-green-fade p-4">
          <div className="flex items-center justify-between gap-3">
            <Avatar name={user.name} size={56} />
            <Tag tone="green" size="md" className="text-body-medium">Earn {POINTS.REFERRAL} points</Tag>
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-900 text-brand-secondary"><ReferIcon /></span>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" leftIcon={<Share />} onClick={invite}>Invite</Button>
            <Button variant="secondary" className="flex-1" leftIcon={<Copy />} onClick={copy}>Copy Link</Button>
          </div>
        </section>

        <section className="flex flex-col gap-1 rounded-lg bg-bg-1 p-4">
          <p className="text-body-medium text-text-subtitle">Refer Respondent</p>
          <p className="text-text-regular text-text-body">
            Earn <span className="text-text-title">{POINTS.REFERRAL} reward points</span> for referring a new user when they{' '}
            <span className="text-text-title">completes their 1st study.</span>
          </p>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {[[joined, 'Joined'], [completed, 'Completed'], [earned, 'Earned']].map(([v, l]) => (
            <div key={String(l)} className="flex flex-col items-center gap-1 rounded-lg bg-bg-1 p-3">
              <span className="text-title-s text-brand-primary">{v}</span>
              <span className="text-text-regular text-text-subtitle">{l}</span>
            </div>
          ))}
        </div>

        <h2 className="text-body-medium text-text-title">{joined} Referrals</h2>
        {referrals.length === 0 ? (
          <EmptyState title="0 referrals yet" body="Invite friends and earn points when they complete their first study." actionLabel="Copy Link" onAction={copy} />
        ) : (
          <ul className="flex flex-col gap-4">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <Avatar name={r.name} size={40} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body-medium text-text-title">{r.name}</span>
                  <span className="truncate text-text-regular text-text-body">{r.email}</span>
                </span>
                <Tag tone={r.status === 'completed' ? 'green' : 'yellow'} size="md">{r.status === 'completed' ? 'Completed' : 'Joined'}</Tag>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
