import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import TierTag from '../../../components/app/TierTag'
import Button, { IconButton } from '../../../components/ui/Button'
import { ChevronRight, DotsIcon, ExternalIcon, LinkIcon, VerifiedIcon } from '../../../components/ui/icons'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { PERSON as P } from '../../../mock/profile'
import { InviteToStudy, ReviewsPanel } from '../panels'
import AboutTab from './AboutTab'
import { AccountFlow } from './accountDialogs'
import type { AccountStep } from './accountDialogs'
import StudiesTab from './StudiesTab'
import type { StudySub } from './StudiesTab'
import WalletTab from './WalletTab'
import type { WalletSub } from './WalletTab'

type Tab = 'about' | 'studies' | 'wallet'
const STUDY: StudySub[] = ['invites', 'scheduled', 'applied', 'history', 'saved']
const WALLET: WalletSub[] = ['earnings', 'payouts', 'points', 'referrals']

/**
 * A participant's profile (`/participants/:id`, `?tab=studies|wallet`,
 * `&sub=...`, `?state=deactivated`): one screen, three segments, ten states.
 * The header (photo, name, role, place, certificate id, profile completion,
 * "Profession Verified"; score, tier, Reviews, copy link, options; last
 * active) stays put; only what is under the segments changes.
 *
 * The options menu is the one drawn loose on the canvas: Invite To Study,
 * Send E-mail, Deactivate Account (2022:175927); on a deactivated account
 * Send E-mail, Reactivate Account (2024:179609). A deactivated account also
 * carries a banner with its reason, a "Reason" button and Reactivate Account
 * (2024:178894).
 */
export default function Profile() {
  const [params, setParams] = useSearchParams()
  const deactivated = params.get('state') === 'deactivated'
  const tab: Tab = params.get('tab') === 'studies' ? 'studies' : params.get('tab') === 'wallet' ? 'wallet' : 'about'
  const s = params.get('sub')
  const studySub = (STUDY as string[]).includes(s ?? '') ? (s as StudySub) : 'invites'
  const walletSub = (WALLET as string[]).includes(s ?? '') ? (s as WalletSub) : 'earnings'
  const go = (next: { tab?: Tab; sub?: string; deactivated?: boolean }) => {
    const t = next.tab ?? tab
    const off = next.deactivated ?? deactivated
    setParams({ ...(t !== 'about' && { tab: t }), ...(next.sub && !['invites', 'earnings'].includes(next.sub) && { sub: next.sub }), ...(off && { state: 'deactivated' }) }, { replace: true })
  }
  const [menu, setMenu] = useState(false)
  const [panel, setPanel] = useState<null | 'reviews' | 'invite'>(null)
  const [flow, setFlow] = useState<AccountStep>(null)
  const items = deactivated ? ['Send E-mail', 'Reactivate Account'] : ['Invite To Study', 'Send E-mail', 'Deactivate Account']
  const pick = (item: string) => {
    setMenu(false)
    if (item === 'Invite To Study') setPanel('invite')
    if (item === 'Send E-mail') window.location.href = 'mailto:jonathanmorgan@gmail.com'
    if (item === 'Deactivate Account' || item === 'Reactivate Account') setFlow('form')
  }
  const Reviews = <Button variant="tertiary" size="md" className="bg-bgAlt-1 px-3 text-text-regular" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => setPanel('reviews')}>Reviews</Button>

  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: 'All Participants', to: '/participants' }, { label: P.name }]}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={P.photo} alt="" className="h-[87px] w-[87px] rounded-sm object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title-s leading-[25px] text-text-title">{P.name}</h1>
          <p className="flex items-center gap-2 pt-1 text-text-regular leading-[22px] text-text-subtitle"><span className="text-body-regular">{P.role}</span><span aria-hidden="true">•</span>{P.place}<span aria-hidden="true">•</span>{P.cert}</p>
          <div className="flex gap-3 pt-2">
            <span className="flex h-7 items-center rounded-full bg-yellow-50 px-2.5 text-text-regular text-brand-primary">{P.completion}</span>
            <span className="flex h-7 items-center gap-1 rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle"><VerifiedIcon className="h-4 w-4 text-state-success" />Profession Verified</span>
          </div>
        </div>
        <div className="relative flex flex-col items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="text-title-l leading-[31px] text-text-title">{P.score}</span><TierTag tier="Platinum" size={32} />{Reviews}
            <IconButton label="Copy profile link" className="ml-1" onClick={() => { void navigator.clipboard?.writeText(window.location.href) }}><LinkIcon className="h-5 w-5" /></IconButton>
            <IconButton label="Participant options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
          </div>
          {menu && (
            <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
              {items.map((item) => <li key={item} role="none"><button role="menuitem" type="button" onClick={() => pick(item)} className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{item}</button></li>)}
            </ul>
          )}
          <p className="text-text-regular leading-5 text-text-subtitle">{P.lastActive}</p>
        </div>
      </header>

      {deactivated && (
        <div role="status" className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-yellow-40 px-4 py-3.5 text-text-regular leading-5">
          <div>
            <p className="text-body-medium leading-[22px] text-state-danger">Account is deactivated.</p>
            <p className="pt-1.5 text-text-title">This account was deactivated as passport ID verification could not be done. Can verify it manually and reactivate.</p>
            <p className="pt-1.5 text-text-subtitle">Oct 1, 2026</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="tertiary" className="bg-yellow-40 px-5" leftIcon={<ExternalIcon className="h-5 w-5" />}>Reason</Button>
            <Button variant="secondary" className="px-5" onClick={() => setFlow('form')}>Reactivate Account</Button>
          </div>
        </div>
      )}

      <SegmentedTabs className="mt-4 w-80 self-start" segmentClassName="flex-1 min-w-0" value={tab} onChange={(k) => go({ tab: k as Tab })}
        items={[{ key: 'about', label: 'About' }, { key: 'studies', label: 'Studies' }, { key: 'wallet', label: 'Wallet' }]} />
      <div className="pt-3">
        {tab === 'about' && <AboutTab onReviews={() => setPanel('reviews')} />}
        {tab === 'studies' && <StudiesTab sub={studySub} onSub={(k) => go({ sub: k })} />}
        {tab === 'wallet' && <WalletTab sub={walletSub} onSub={(k) => go({ sub: k })} />}
      </div>

      <ReviewsPanel open={panel === 'reviews'} onClose={() => setPanel(null)} />
      <InviteToStudy open={panel === 'invite'} onClose={() => setPanel(null)} />
      <AccountFlow kind={deactivated ? 'reactivate' : 'deactivate'} step={flow} onStep={setFlow} onDone={() => { setFlow(null); go({ deactivated: !deactivated }) }} />
    </AppShell>
  )
}
