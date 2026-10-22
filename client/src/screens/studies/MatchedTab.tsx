import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import RespondentCard from '../../components/client/RespondentCard'
import { useOpenProfile } from '../../app/ProfileHost'
import { StudyFrame } from '../../components/client/StudyFrame'
import { SentModal } from '../pool/PoolModals'
import { ChevronRight, PoolIcon } from '../../components/ui/icons'
import InviteFromPool from './InviteFromPool'
import { useStudies, useStudy } from '../../platform'
import { recruits } from '@shared/derive'
import { useToast } from '../../components/ui/Toast'
import Picker from '../../components/ui/Picker'
import { TIER_MENU, tierFromMenu } from '@shared/lifecycle'

/**
 * Matched (1627:96237) and Invited (1627:96329) are one tab with a segmented
 * switch, not two screens: same heading, same description, same filters, same
 * nine cards. Only each card's action row changes.
 *
 * Both halves now read the study's own participant list. Workflow step 24
 * ranks by score and tier, which is what the Sort control does; step 27 has
 * the client selecting rather than contacting, so Invite To Study moves the
 * person to `invited` and the platform does the sending.
 */
export default function MatchedTab() {
  const { id } = useParams()
  const s = useStudy(id)
  const { pathname } = useLocation()
  // Matched and Invited are one tab with a switch; the route map names both.
  const [state, setState] = useState<'matched' | 'invited'>(pathname.endsWith('/invited') ? 'invited' : 'matched')
  const [tier, setTier] = useState('All')
  const { moveRespondent, state: world } = useStudies()
  const toast = useToast()
  /** The frame draws nine cards; the rest are behind Load more. */
  const [shown, setShown] = useState(9)
  /** Sort and Location are not drawn as menus (22 Oct 2026): Sort offers the score (as matched) and the name, Location the places these people are in. */
  const [sort, setSort] = useState<'Score' | 'Name'>('Score')
  const [place, setPlace] = useState('All')
  const pool = recruits(world, s, state)
  const places = [...new Set(pool.map((r) => r.location).filter(Boolean))].sort()
  const matched = pool
    .filter((r) => (tier === 'All' || r.tier === tier.toLowerCase()) && (place === 'All' || r.location === place))
    .sort((a, b) => (sort === 'Name' ? a.name.localeCompare(b.name) : b.score - a.score))
  const people = matched.slice(0, shown)
  /** Respondent Profile Details (1627:98130), with its Reviews page: the one profile host every name opens. */
  const openProfile = useOpenProfile()
  /** Who was just invited, for the Sent dialog. */
  const [sent, setSent] = useState<string | null>(null)
  /** Invite From Pool (15 Oct 2026): the whole pool, inside this tab, for every study type. */
  const [fromPool, setFromPool] = useState(false)
  const invite = (pid: string, name: string) => {
    const res = moveRespondent(s.id, pid, 'invited')
    if (res.ok) setSent(name.split(' ')[0] ?? name); else toast(res.why)
  }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="matched" minH="min-h-[1307px]" bodyMinH="min-h-[1057px]">
        {fromPool ? (
          <InviteFromPool study={s} onBack={() => setFromPool(false)} onInvite={(p) => invite(p.id, p.name)}
            onView={(p) => openProfile(p.id)} />
        ) : (
        <div className="flex flex-col px-4 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-title-s leading-[22px] text-text-title">Matched Respondents</h2>
              <p className="pt-2 text-text-regular text-text-subtitle">
                Surfaced from the Pool who are matching with target audience criteria. Invite those who you like to get insights from.
              </p>
            </div>
            <Button variant="tertiary" size="none" className="h-[46px] shrink-0 px-4 text-body-regular" onClick={() => setFromPool(true)}
              leftIcon={<PoolIcon className="h-5 w-5" />}>Invite From Pool</Button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Tabs variant="segmented" className="w-[238px]" value={state} onChange={(k) => setState(k as 'matched' | 'invited')}
              items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
            <div className="flex items-center gap-3">
              <Picker value={`Sort: ${sort}`} className="w-[180px]" options={['Sort: Score', 'Sort: Name']} onPick={(v) => setSort(v === 'Sort: Name' ? 'Name' : 'Score')} />
              <Picker value={`Tier: ${tier}`} className="w-[230px]" options={TIER_MENU.map((m) => m.label)} onPick={(v) => { const t = tierFromMenu(v); setTier(t ? t[0]!.toUpperCase() + t.slice(1) : 'All') }} />
              <Picker value={`Location: ${place}`} className="w-[200px]" options={['All', ...places].map((p) => `Location: ${p}`)} onPick={(v) => setPlace(v.replace('Location: ', ''))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6">
            {people.length === 0 && (
              <p className="col-span-3 py-10 text-center text-body-regular text-text-subtitle">
                {state === 'matched' ? 'Nobody new is waiting to be invited.' : 'No invitations have gone out yet.'}
              </p>
            )}
            {people.map((r) => (
              <RespondentCard key={r.id} respondent={r} actions={
                state === 'matched' ? (
                  <>
                    <Button variant="secondary" size="none" className="h-11 flex-1" onClick={() => invite(r.id, r.name)}>Invite To Study</Button>
                    <Button variant="tertiary" size="none" className="h-11 flex-1" onClick={() => openProfile(r.id)}
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Profile</Button>
                  </>
                ) : (
                  <Button variant="tertiary" size="none" className="h-11 flex-1" disabled>Invitation Sent!</Button>
                )
              } />
            ))}
            {matched.length > people.length && (
              <button type="button" onClick={() => setShown((n) => n + 9)}
                className="col-span-3 py-4 text-body-medium text-brand-primary hover:underline">
                Load more ({matched.length - people.length} more)
              </button>
            )}
          </div>
        </div>
        )}
      </StudyFrame>
      <SentModal open={sent !== null} name={sent ?? undefined} study={s.title} onClose={() => setSent(null)} />
    </AppShell>
  )
}
