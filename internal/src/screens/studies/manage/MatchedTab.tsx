import { useState } from 'react'
import TierTag, { ProfessionVerified } from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { ChevronRight, ShieldUserIcon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/Overlay'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import type { ManagedStudy } from '../../../mock/manage'
import { platform } from '@shared/store'
import { useRecruiting } from '../../../mock/recruiting'
import type { Match } from '../../../mock/recruiting'
import { TEAM, say } from '../../../platform'
import RespondentProfile from './RespondentProfile'
import { TIER_MENU, tierFromMenu, tierMenuValue } from '@shared/lifecycle'
import type { Tier as SharedTier } from '@shared/types'

/**
 * A "Respondent Profile Card" (368 x 170 on bg-1, 12 inside): a 40px initial,
 * the name over the role; the match score with its shield, the tier and, for
 * some, "Profession-Verified"; then either Invite To Study and View Profile,
 * or, once invited, a flat "Invitation Sent!" in their place. The whole card
 * opens the full profile (22 Oct 2026), on Matched and on Invited.
 */
function Card({ person, invited, onInvite, onView }: { person: Match; invited: boolean; onInvite: () => void; onView: () => void }) {
  return (
    <article role="button" tabIndex={0} aria-label={`Open ${person.name}'s profile`} onClick={onView} onKeyDown={(e) => { if (e.key === 'Enter') onView() }}
      className="cursor-pointer rounded-lg bg-bg-1 p-3 hover:bg-bg-2">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-3 text-title-s text-text-subtitle">{person.initial}</span>
        <div className="min-w-0">
          <p className="text-text-regular leading-5 text-text-subtitle">{person.name}</p>
          <p className="truncate pt-0.5 text-body-medium leading-[22px] text-text-title">{person.role}</p>
        </div>
      </div>
      <div className="flex h-8 items-center gap-2 pt-4 box-content">
        <span className="flex items-center gap-1 text-title-s leading-[25px] text-text-title"><ShieldUserIcon className="h-6 w-6 text-brand-primary" />{person.score}</span>
        <TierTag tier={person.tier} />
        {person.verified && <ProfessionVerified />}
      </div>
      {invited ? (
        <p className="mt-3 flex h-[38px] items-center justify-center rounded-md border-1 border-stroke-input text-text-medium text-text-disabled">Invitation Sent!</p>
      ) : (
        <div className="mt-3 flex gap-3">
          <Button variant="secondary" size="md" className="flex-1 px-0" onClick={(e) => { e.stopPropagation(); onInvite() }}>Invite To Study</Button>
          <Button variant="tertiary" size="md" className="flex-1 px-0 bg-bg-1" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); onView() }}>View Profile</Button>
        </div>
      )}
    </article>
  )
}

/**
 * Matched (1952:76970 Matched, 1952:77106 Invited): people the platform
 * surfaced from the pool for this study's audience. Two segments, three
 * dropdowns (their options are not drawn), and the cards three across.
 * Inviting asks first ("Invite Ferry to apply for this study?", 1932:110861),
 * then confirms ("Invitation has been sent!", 1932:110882). The cards are the
 * study's own matched and invited participations; Send Invite invites for
 * real (shared/store.ts), notifies the person and is logged.
 */
export default function MatchedTab({ study, invited, onSegment }: { study: ManagedStudy; invited: boolean; onSegment: (invited: boolean) => void }) {
  const [asking, setAsking] = useState<Match | null>(null)
  const [sent, setSent] = useState<Match | null>(null)
  const [viewing, setViewing] = useState<Match | null>(null)
  const { matched, invited: sentTo } = useRecruiting(study.raw)
  /**
   * Sort, Tier and Location (22 Oct 2026). Tier is the drawn menu (2003:134356); Sort and Location are not
   * drawn, so Sort offers the score (as matched) and the name, and Location the places these people are in.
   */
  const [sort, setSort] = useState<'Score' | 'Name'>('Score')
  const [tier, setTier] = useState<SharedTier | null>(null)
  const [place, setPlace] = useState('All')
  const pool = invited ? sentTo : matched
  const places = [...new Set(pool.map((m) => m.location).filter(Boolean))].sort()
  const people = pool
    .filter((m) => (!tier || m.tier.toLowerCase() === tier) && (place === 'All' || m.location === place))
    .sort((a, b) => sort === 'Name' ? a.name.localeCompare(b.name) : Number.parseInt(b.score, 10) - Number.parseInt(a.score, 10))
  const first = (m: Match) => m.name.split(' ')[0]
  const send = (m: Match) => { setAsking(null); if (say(platform().invite(study.id, m.id, TEAM))) setSent(m) }
  return (
    <div>
      <h2 className="text-title-s leading-[25px] text-text-title">Matched Respondents</h2>
      <p className="pt-1 text-text-regular leading-5 text-text-subtitle">Surfaced from the Pool who are matching with target audience criteria. Invite those who you like to get insights from.</p>
      <div className="flex items-center justify-between pt-4">
        <SegmentedTabs className="w-60" segmentClassName="flex-1 min-w-0" value={invited ? 'invited' : 'matched'} onChange={(k) => onSegment(k === 'invited')}
          items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
        <div className="flex gap-3">
          <Select className="w-[180px]" value={`Sort: ${sort}`} options={['Sort: Score', 'Sort: Name']} onChange={(v) => setSort(v === 'Sort: Name' ? 'Name' : 'Score')} />
          <Select className="w-[230px]" value={tierMenuValue(tier)} options={TIER_MENU.map((m) => m.label)} onChange={(v) => setTier(tierFromMenu(v))} />
          <Select className="w-[200px]" value={`Location: ${place}`} options={['Location: All', ...places.map((p) => `Location: ${p}`)]} onChange={(v) => setPlace(v.replace('Location: ', ''))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-6">
        {people.map((m) => <Card key={m.id} person={m} invited={invited} onInvite={() => setAsking(m)} onView={() => setViewing(m)} />)}
        {people.length === 0 && <p className="col-span-3 rounded-lg bg-bg-1 p-4 text-text-regular text-text-subtitle">{pool.length ? 'No one matches these filters.' : invited ? 'No one has been invited to this study yet.' : 'No one in the pool is waiting to be invited to this study.'}</p>}
      </div>

      <Modal open={asking !== null} onClose={() => setAsking(null)} className="[&>div>div]:max-w-[330px]" title={`Invite ${asking ? first(asking) : ''} to apply for this study?`}
        footer={<><Button variant="tertiary" onClick={() => setAsking(null)}>Cancel</Button><Button onClick={() => asking && send(asking)}>Send Invite</Button></>}>
        <p className="text-body-regular text-text-subtitle">An invitation will be sent to this participant to apply for this ‘{study.title}’ study.</p>
      </Modal>
      <Modal open={sent !== null} onClose={() => setSent(null)} title="Invitation has been sent!" className="[&_div]:max-w-none"
        footer={<Button onClick={() => { setSent(null); onSegment(true) }}>Done!</Button>}>
        <p className="text-body-regular text-text-subtitle">{sent?.name} has been invited to apply for this study.</p>
      </Modal>
      <RespondentProfile personId={viewing?.id} invited={invited} onClose={() => setViewing(null)}
        onInvite={() => { setAsking(viewing); setViewing(null) }} />
    </div>
  )
}
