import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { SearchInput, Select } from '../../../components/ui/Input'
import { ChevronDown, ChevronUp, CloseIcon, SortIcon, StarIcon, UserIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { MANAGED } from '../../../mock/manage'
import { PARTICIPANTS, sessionActivity } from '../../../mock/results'
import type { Attendance, Participant } from '../../../mock/results'
import RespondentProfile from '../manage/RespondentProfile'
import { GroupCompletionBar } from './bars'
import { ActivityList, JoinNow, Notes, PinCard, SessionCard, VideoResult } from './content'
import DetailShell, { DETAIL_TABS } from './DetailShell'
import { MarkBackDialog, NoShowDialog, RatePanel } from './dialogs'

const PIN_ALL = 'Share this PIN number with all participants for their joining verification. This same PIN number applies for all the participants.'
const Tag = ({ good, children }: { good: boolean; children: string }) => (
  <span className={cn('flex h-[38px] items-center gap-1 rounded-md px-3 text-text-regular', good ? 'bg-state-successBg text-state-success' : 'bg-red-50 text-state-danger')}>
    {good ? <VerifiedIcon className="h-4 w-4" /> : <CloseIcon className="h-4 w-4" />}{children}
  </span>
)

/**
 * A group session inside a study (`/studies/:id/sessions/:sid`,
 * `?state=completed`): Study Result and Activity.
 * - Before it runs (1952:79052, 1961:186911): when it is scheduled, the
 *   Verification PIN everyone shares, and who is in it; in person adds notes.
 * - After (1952:79377, 1961:187259): the recording or the notes, then each
 *   participant's attendance (completed by the participant with the PIN,
 *   marked no-show, or still to mark) and "Mark all as Completed".
 * Activity (1952:79703) lists each participant with their steps.
 */
export default function SessionPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const study = MANAGED.find((s) => s.id === id) ?? MANAGED[1]!
  const inPerson = study.type === 'in-person-group'
  const done = params.get('state') === 'completed'
  const tab = params.get('tab') === 'activity' ? 'activity' : 'result'
  const [people, setPeople] = useState<Record<string, Attendance>>(Object.fromEntries(PARTICIPANTS.map((p) => [p.id, p.attendance])))
  const [noShow, setNoShow] = useState<string | null>(null)
  const [back, setBack] = useState<string | null>(null)
  const [openRow, setOpenRow] = useState(0)
  const [rating, setRating] = useState(false)
  const [profile, setProfile] = useState(false)
  const set = (pid: string | null, a: Attendance) => pid && setPeople((s) => ({ ...s, [pid]: a }))

  const NoShowButton = ({ p }: { p: Participant }) => <Button variant="tertiary" size="md" className="px-3" leftIcon={<CloseIcon className="h-4 w-4" />} onClick={() => setNoShow(p.id)}>Mark No-show</Button>
  const CompleteButton = ({ p, live }: { p: Participant; live?: boolean }) => <Button variant="secondary" size="md" className="px-3" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={() => live && setBack(p.id)}>Mark Completed</Button>
  const actions = (p: Participant) => {
    const a = people[p.id]
    if (a === 'participant') return <>{!inPerson && <NoShowButton p={p} />}<Tag good>Marked completed by participant</Tag></>
    if (a === 'noshow') return inPerson ? <><CompleteButton p={p} live /><Tag good={false}>Marked No-show by client</Tag></> : <><NoShowButton p={p} /><Tag good={false}>Marked as No-show</Tag></>
    return <><NoShowButton p={p} /><CompleteButton p={p} /></>
  }

  const table = (
    <div>
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-body-medium leading-[22px] text-text-title">Participants</h2>
        <Select size="sm" className="w-40" value="Tier: All" options={['Tier: All']} />
      </div>
      <div role="table" className="overflow-hidden rounded-lg border-1 border-stroke-2 text-text-regular text-text-title">
        <div role="row" className="grid h-[52px] grid-cols-[160px_280px_1fr] items-center bg-bg-1 px-4 text-text-subtitle">
          <span>Name</span><span>Role</span><span className="flex items-center gap-1">Score<SortIcon className="h-4 w-4 text-text-body" /></span>
        </div>
        {PARTICIPANTS.map((p) => (
          <div role="row" key={p.id} className={cn('grid grid-cols-[160px_280px_1fr_auto] items-center border-t-1 border-stroke-1 pl-4 pr-3', done ? 'h-[70px]' : 'h-[52px]')}>
            <span>{p.name}</span><span>{p.role}</span>
            <span className="flex items-center gap-2">{p.score}<TierTag tier={p.tier} /></span>
            {done && <span className="flex items-center gap-3">{actions(p)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
  const scheduled = inPerson
    ? <SessionCard title="Scheduled For" date="August 12, 2026, Wednesday" time="10:00 AM - 11:00 AM" address />
    : <SessionCard title="Scheduled For" date="August 20, 2026, Wednesday" time="10:00 AM" aside={<span className="flex h-7 items-center rounded-full bg-bg-2 px-3 text-text-regular text-text-title">4 / 10 Seats</span>}><JoinNow /></SessionCard>

  return (
    <DetailShell study={study} tabs={[DETAIL_TABS.result, DETAIL_TABS.activity]} tab={tab} bar={tab === 'result' && done ? <GroupCompletionBar /> : undefined}
      onTab={(k) => setParams({ ...(k === 'activity' && { tab: k }), ...(done && { state: 'completed' }) }, { replace: true })}>
      {tab === 'result' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-title-s leading-[25px] text-text-title">Session 1</h2>
          {!done && <div className="grid grid-cols-2 gap-3">{scheduled}<PinCard text={PIN_ALL} /></div>}
          {done && (inPerson
            ? <SessionCard title="In-person Group interview of all participants and You" date="August 12, 2026, Wednesday" time="10:00 AM - 11:00 AM" address />
            : <VideoResult title="Video Recording of all participants and Client" who="Session 1" />)}
          {done && inPerson && <Notes editor tall="h-[586px]" />}
          {table}
          {!done && inPerson && <Notes editor download={false} tall="h-[588px]" />}
          {done && <PinCard wide text={PIN_ALL} />}
        </div>
      )}
      {tab === 'activity' && (
        <div className="flex flex-col gap-3">
          <SearchInput size="sm" placeholder="Search by name or role" />
          {[0, 1, 2, 3].map((i) => (
            <article key={i} className="overflow-hidden rounded-lg border-1 border-stroke-1">
              <header className="flex h-[72px] items-center gap-3 bg-bg-1 px-4 text-text-regular text-text-title">
                <div className="flex-1"><p className="text-body-medium leading-[22px]">Sarah K</p><p className="leading-5">Housewife</p></div>
                <span className="flex items-center gap-2 pr-2">95<TierTag tier="Platinum" /></span>
                <Button variant="tertiary" size="md" className="px-3" leftIcon={<UserIcon className="h-4 w-4" />} onClick={() => setProfile(true)}>View Profile</Button>
                <Button variant="secondary" size="md" className="px-3" rightIcon={openRow === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} onClick={() => setOpenRow(openRow === i ? -1 : i)}>View Activity</Button>
                {i < 2
                  ? <Button size="md" className="px-3" leftIcon={<StarIcon className="h-5 w-5" />} onClick={() => setRating(true)}>Rate</Button>
                  : <span className="flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-4 text-text-medium">Rated</span>}
              </header>
              {openRow === i && (
                <div className="p-4"><p className="pb-2 text-text-regular text-text-subtitle">Study activity</p><ActivityList inline items={sessionActivity('Sarah K', false)} /></div>
              )}
            </article>
          ))}
          <PinCard wide text={PIN_ALL} />
        </div>
      )}
      <NoShowDialog open={noShow !== null} group onClose={() => setNoShow(null)} onConfirm={() => { set(noShow, 'noshow'); setNoShow(null) }} />
      <MarkBackDialog open={back !== null} onClose={() => setBack(null)} onConfirm={() => { set(back, 'participant'); setBack(null) }} />
      <RatePanel person={rating ? 'Sarah' : null} group onClose={() => setRating(false)} />
      <RespondentProfile open={profile} invited={false} onClose={() => setProfile(false)} onInvite={() => setProfile(false)} />
    </DetailShell>
  )
}
