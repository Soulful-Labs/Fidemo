import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { SearchInput, Select } from '../../../components/ui/Input'
import { ChevronDown, ChevronUp, CloseIcon, SortIcon, StarIcon, UserIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { useManagedStudy } from '../../../mock/manage'
import { markCompleted, markNoShow } from '../../../mock/attendance'
import { useSession } from '../../../mock/results'
import type { SessionView } from '../../../mock/results'
import { startOf } from '../../../mock/recruiting'
import RespondentProfile from '../manage/RespondentProfile'
import { GroupCompletionBar } from './bars'
import { ActivityList, JoinNow, Notes, PinCard, SessionCard, VideoResult } from './content'
import DetailShell, { DETAIL_TABS } from './DetailShell'
import CancelSessionDialog from './CancelSessionDialog'
import { MarkBackDialog, NoShowDialog, RatePanel } from './dialogs'

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
 *
 * The session, its seats, its people and its PIN are the study's own
 * (shared/derive.ts sessionSeats). Every mark moves the person's
 * participation in the shared store and is logged; a no-show is not paid.
 * The page shows the after state once the session has started.
 */
export default function SessionPage() {
  const { id, sid } = useParams()
  const [params, setParams] = useSearchParams()
  const study = useManagedStudy(id)
  const x = useSession(study.raw, sid)
  const inPerson = study.type === 'in-person-group'
  const tab = params.get('tab') === 'activity' ? 'activity' : 'result'
  const [noShow, setNoShow] = useState<Person | null>(null)
  const [back, setBack] = useState<Person | null>(null)
  const [openRow, setOpenRow] = useState(0)
  const [rating, setRating] = useState<Person | null>(null)
  const [profile, setProfile] = useState<string | undefined>()
  const [cancelling, setCancelling] = useState<Person | null>(null)
  if (!x) return <DetailShell study={study} tabs={[DETAIL_TABS.result]} tab="result" onTab={() => undefined}><p className="text-text-regular text-text-subtitle">This study has no sessions yet.</p></DetailShell>

  const people = x.people
  const started = Date.now() >= startOf(x.startsAt, x.slot).getTime()
  const done = params.get('state') === 'completed' || started || people.some((p) => p.state === 'completed' || p.state === 'no_show')
  const allDone = people.length > 0 && people.every((p) => p.state === 'completed' || p.state === 'no_show')

  const NoShowButton = ({ p }: { p: Person }) => <Button variant="tertiary" size="md" className="px-3" leftIcon={<CloseIcon className="h-4 w-4" />} onClick={() => setNoShow(p)}>Mark No-show</Button>
  const CompleteButton = ({ p, back: marksBack }: { p: Person; back?: boolean }) => <Button variant="secondary" size="md" className="px-3" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={() => marksBack ? setBack(p) : markCompleted(study.id, p.id)}>Mark Completed</Button>
  /**
   * The row's actions follow the participant's state (1952:79377, 22 Oct 2026), the same for every type:
   * nothing recorded, Mark No-show and Mark Completed; completed, Mark No-show and a green read-back;
   * a no-show, Mark Completed and a red read-back. A read-back is not a button. Once paid, a completion
   * cannot be undone, so only its read-back shows.
   */
  const actions = (p: Person) => {
    if (p.state === 'completed') return <>{!p.participation.paidAt && <NoShowButton p={p} />}<Tag good>{p.codeConfirmed ? 'Marked completed by participant' : 'Marked completed'}</Tag></>
    if (p.state === 'no_show') return <><CompleteButton p={p} back /><Tag good={false}>Marked as No-show</Tag></>
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
        {people.map((p) => (
          <div role="row" key={p.id} className={cn('grid grid-cols-[160px_280px_1fr_auto] items-center border-t-1 border-stroke-1 pl-4 pr-3', done ? 'h-[70px]' : 'h-[52px]')}>
            <span>{p.name}</span><span>{p.role}</span>
            <span className="flex items-center gap-2">{p.score}<TierTag tier={p.tier} /></span>
            {done && <span className="flex items-center gap-3">{actions(p)}</span>}
            {!done && p.state === 'scheduled' && <Button variant="tertiary" size="md" className="px-3" onClick={() => setCancelling(p)}>Cancel Session</Button>}
          </div>
        ))}
        {people.length === 0 && <p className="border-t-1 border-stroke-1 p-4 text-text-subtitle">No one has booked a seat in this session yet.</p>}
      </div>
    </div>
  )
  const PIN_TEXT = 'Share this PIN number with all participants for their joining verification. This same PIN number applies for all the participants.'
  const scheduled = inPerson
    ? <SessionCard title="Scheduled For" date={x.date} time={x.time} address={x.address} />
    : <SessionCard title="Scheduled For" date={x.date} time={x.time} aside={<span className="flex h-7 items-center rounded-full bg-bg-2 px-3 text-text-regular text-text-title">{x.seats}</span>}><JoinNow /></SessionCard>
  const markAll = () => { for (const p of people) if (p.state !== 'completed' && p.state !== 'no_show') markCompleted(study.id, p.id) }

  return (
    <DetailShell study={study} tabs={[DETAIL_TABS.result, DETAIL_TABS.activity]} tab={tab} bar={tab === 'result' && done ? <GroupCompletionBar done={allDone} onAll={markAll} /> : undefined}
      onTab={(k) => setParams({ ...(k === 'activity' && { tab: k }), ...(params.get('state') === 'completed' && { state: 'completed' }) }, { replace: true })}>
      {tab === 'result' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-title-s leading-[25px] text-text-title">{x.name}</h2>
          {!done && <div className="grid grid-cols-2 gap-3">{scheduled}<PinCard code={x.code} text={PIN_TEXT} /></div>}
          {done && (inPerson
            ? <SessionCard title="In-person Group interview of all participants and You" date={x.date} time={x.time} address={x.address} />
            : <VideoResult title="Video Recording of all participants and Client" who={x.name} when={`${x.date}, ${x.time}`} />)}
          {done && inPerson && <Notes editor tall="h-[586px]" />}
          {table}
          {!done && inPerson && <Notes editor download={false} tall="h-[588px]" />}
          {done && <PinCard wide code={x.code} text={PIN_TEXT} />}
        </div>
      )}
      {tab === 'activity' && (
        <div className="flex flex-col gap-3">
          <SearchInput size="sm" placeholder="Search by name or role" />
          {people.map((p, i) => (
            <article key={p.id} className="overflow-hidden rounded-lg border-1 border-stroke-1">
              <header className="flex h-[72px] items-center gap-3 bg-bg-1 px-4 text-text-regular text-text-title">
                <div className="flex-1"><p className="text-body-medium leading-[22px]">{p.name}</p><p className="leading-5">{p.role}</p></div>
                <span className="flex items-center gap-2 pr-2">{p.score}<TierTag tier={p.tier} /></span>
                <Button variant="tertiary" size="md" className="px-3" leftIcon={<UserIcon className="h-4 w-4" />} onClick={() => setProfile(p.id)}>View Profile</Button>
                <Button variant="secondary" size="md" className="px-3" rightIcon={openRow === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} onClick={() => setOpenRow(openRow === i ? -1 : i)}>View Activity</Button>
                {p.state === 'completed' && (p.rated
                  ? <span className="flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-4 text-text-medium">Rated</span>
                  : <Button size="md" className="px-3" leftIcon={<StarIcon className="h-5 w-5" />} onClick={() => setRating(p)}>Rate</Button>)}
              </header>
              {openRow === i && (
                <div className="p-4"><p className="pb-2 text-text-regular text-text-subtitle">Study activity</p><ActivityList inline items={p.participation.events.map((e) => ({ text: e.label, when: new Date(e.at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) }))} /></div>
              )}
            </article>
          ))}
          <PinCard wide code={x.code} text={PIN_TEXT} />
        </div>
      )}
      <NoShowDialog open={noShow !== null} group name={noShow?.name ?? ''} onClose={() => setNoShow(null)} onConfirm={() => { if (noShow) markNoShow(study.id, noShow.id); setNoShow(null) }} />
      <MarkBackDialog open={back !== null} name={back?.name ?? ''} onClose={() => setBack(null)} onConfirm={() => { if (back) markCompleted(study.id, back.id); setBack(null) }} />
      <RatePanel study={study} person={rating && { ...rating, first: rating.name.split(' ')[0] ?? rating.name }} onClose={() => setRating(null)} />
      <CancelSessionDialog studyId={study.id} person={cancelling} onClose={() => setCancelling(null)} />
      <RespondentProfile personId={profile} invited={false} onClose={() => setProfile(undefined)} onInvite={() => setProfile(undefined)} />
    </DetailShell>
  )
}

type Person = SessionView['people'][number]
