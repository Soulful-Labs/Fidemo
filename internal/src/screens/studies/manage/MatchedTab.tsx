import { useState } from 'react'
import TierTag, { ProfessionVerified } from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { ChevronRight, ShieldUserIcon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/Overlay'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import type { ManagedStudy } from '../../../mock/manage'
import { MATCHED } from '../../../mock/recruiting'
import type { Match } from '../../../mock/recruiting'
import RespondentProfile from './RespondentProfile'

/**
 * A "Respondent Profile Card" (368 x 170 on bg-1, 12 inside): a 40px initial,
 * the name over the role; the match score with its shield, the tier and, for
 * some, "Profession-Verified"; then either Invite To Study and View Profile,
 * or, once invited, a flat "Invitation Sent!" in their place.
 */
function Card({ person, invited, onInvite, onView }: { person: Match; invited: boolean; onInvite: () => void; onView: () => void }) {
  return (
    <article className="rounded-lg bg-bg-1 p-3">
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
          <Button variant="secondary" size="md" className="flex-1 px-0" onClick={onInvite}>Invite To Study</Button>
          <Button variant="tertiary" size="md" className="flex-1 px-0 bg-bg-1" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onView}>View Profile</Button>
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
 * then confirms ("Invitation has been sent!", 1932:110882).
 */
export default function MatchedTab({ study, invited, onSegment }: { study: ManagedStudy; invited: boolean; onSegment: (invited: boolean) => void }) {
  const [asking, setAsking] = useState<Match | null>(null)
  const [sent, setSent] = useState<Match | null>(null)
  const [viewing, setViewing] = useState<Match | null>(null)
  const first = (m: Match) => m.name.split(' ')[0]
  return (
    <div>
      <h2 className="text-title-s leading-[25px] text-text-title">Matched Respondents</h2>
      <p className="pt-1 text-text-regular leading-5 text-text-subtitle">Surfaced from the Pool who are matching with target audience criteria. Invite those who you like to get insights from.</p>
      <div className="flex items-center justify-between pt-4">
        <SegmentedTabs className="w-60" segmentClassName="flex-1 min-w-0" value={invited ? 'invited' : 'matched'} onChange={(k) => onSegment(k === 'invited')}
          items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
        <div className="flex gap-3">
          <Select className="w-[180px]" value="Sort: Score" options={['Sort: Score']} />
          <Select className="w-[156px]" value="Tier: All" options={['Tier: All']} />
          <Select className="w-[200px]" value="Location: All" options={['Location: All']} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-6">
        {MATCHED.map((m) => <Card key={m.id} person={m} invited={invited} onInvite={() => setAsking(m)} onView={() => setViewing(m)} />)}
      </div>

      <Modal open={asking !== null} onClose={() => setAsking(null)} className="[&>div>div]:max-w-[330px]" title={`Invite ${asking ? first(asking) : ''} to apply for this study?`}
        footer={<><Button variant="tertiary" onClick={() => setAsking(null)}>Cancel</Button><Button onClick={() => { setSent(asking); setAsking(null) }}>Send Invite</Button></>}>
        <p className="text-body-regular text-text-subtitle">An invitation will be sent to this participant to apply for this ‘{study.title}’ study.</p>
      </Modal>
      <Modal open={sent !== null} onClose={() => setSent(null)} title="Invitation has been sent!" className="[&_div]:max-w-none"
        footer={<Button onClick={() => { setSent(null); onSegment(true) }}>Done!</Button>}>
        <p className="text-body-regular text-text-subtitle">{sent?.name} has been invited to apply for this study.</p>
      </Modal>
      <RespondentProfile open={viewing !== null} invited={invited} onClose={() => setViewing(null)}
        onInvite={() => { setAsking(viewing); setViewing(null) }} />
    </div>
  )
}
