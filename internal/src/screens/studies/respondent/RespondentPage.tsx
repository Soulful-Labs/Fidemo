import { diaryWords } from '@shared/platform'
import { Fragment, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { canUndoDecision, decide, markCompleted, markNoShow, undoAttendance } from '../../../mock/attendance'
import { useManagedStudy } from '../../../mock/manage'
import { useRespondent } from '../../../mock/results'
import { CompletedBar, CompletionBar, ScreenerBar } from './bars'
import type { CompletionState, ScreenerState } from './bars'
import { ActivityList, Answers, JoinNow, Notes, PinCard, RateBanner, SessionCard, VideoResult } from './content'
import DetailShell, { DETAIL_TABS, RespondentCard } from './DetailShell'
import { NoShowDialog, RatePanel } from './dialogs'

type Tab = 'screener' | 'result' | 'activity'

/**
 * A respondent inside a study (`/studies/:id/respondents/:personId`). Where
 * they are in the study, which is their participation's state in the shared
 * platform, decides what is drawn:
 * - applied (and decided): Screener and Activity, with the Qualify /
 *   Disqualify bar under their answers (1952:78522);
 * - booked (one-to-one session studies): Study Result shows the session and
 *   the study's Verification PIN (1952:82213, 1961:184023);
 * - finished (completed or no-show): Study Result shows the answers,
 *   recording or notes, and the completion bar; the card beside it asks for a
 *   rating (1932:108609, 1952:82396, 1961:184231).
 */
export default function RespondentPage() {
  const { id, rid = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const study = useManagedStudy(id)
  const r = useRespondent(study.raw, rid)
  const [rating, setRating] = useState(false)
  const [asking, setAsking] = useState(false)
  if (!r) return <DetailShell study={study} tabs={[DETAIL_TABS.screener]} tab="screener" onTab={() => undefined}><p className="text-text-regular text-text-subtitle">This person is not on this study.</p></DetailShell>

  const group = study.type === 'video-group' || study.type === 'in-person-group'
  const stage = group && r.stage !== 'applied' ? 'finished' : r.stage
  const keys: Tab[] = stage === 'applied' ? ['screener', 'activity'] : ['screener', 'result', 'activity']
  const wanted = params.get('tab') as Tab | null
  const tab: Tab = wanted && keys.includes(wanted) ? wanted : stage === 'applied' ? 'screener' : 'result'
  const finished = stage === 'finished'
  const closed = params.get('from') === 'completed'
  const session = study.type === 'video' || study.type === 'in-person'
  const inPerson = study.type === 'in-person'
  const p = r.participation
  const noShow = p.state === 'no_show'
  const completed = p.state === 'completed'

  const screener: ScreenerState = p.state === 'applied' ? 'todo' : p.state === 'disqualified' ? 'disqualified' : 'qualified'
  const completion: CompletionState = noShow ? 'noshow' : completed ? (p.paidAt ? 'settled' : 'completed') : 'todo'
  const pinFor = (what: string) => `Share this PIN number with ${r.name}. for their ${what} verification`

  let bar = null
  if (tab === 'screener' && stage === 'applied') bar = <ScreenerBar state={screener} canUndo={canUndoDecision(p)} onDecide={(to) => decide(study.id, r.id, to)} />
  if (tab === 'result' && finished) bar = session
    ? <CompletionBar label={inPerson ? 'Completion Confirmation' : 'Final Completion Confirmation'} name={r.name} state={completion}
        onComplete={() => markCompleted(study.id, r.id)} onNoShow={() => setAsking(true)} onUndo={() => undoAttendance(study.id, p)} />
    : <CompletedBar closed={closed} kind={study.type === 'diary' ? 'diary' : 'survey'} name={r.name} noShow={noShow} />
  const sessionTitle = inPerson ? `In-person interview of ${r.name} and Client` : 'Scheduled For'

  return (
    <DetailShell closed={closed} close={stage === 'applied'} study={study} tabs={keys.map((k) => DETAIL_TABS[k])} tab={tab} onTab={(k) => setParams({ tab: k, ...(closed && { from: 'completed' }) }, { replace: true })} bar={bar}
      aside={<RespondentCard name={r.name} card={r.card} onRate={completed && !r.rating ? () => setRating(true) : undefined} />}>
      {tab === 'screener' && <Answers answers={r.answers} />}

      {tab === 'result' && study.type === 'diary' && (
        <div className="flex flex-col gap-3">
          {r.days.map(({ day: d, answers }, i) => (
            <Fragment key={d}>
              {i > 0 && <hr className="-mx-4 mt-2 border-0 border-t-1 border-stroke-1" />}
              <p className="flex h-7 items-center justify-center rounded-full bg-bg-1 text-text-regular text-text-subtitle">{diaryWords(study.raw.diary?.unit).UNIT} {d}</p>
              <Answers answers={answers} />
            </Fragment>
          ))}
          {!p.diaryDays?.length && <p className="text-text-regular text-text-subtitle">No diary days have been filled in yet.</p>}
        </div>
      )}
      {tab === 'result' && !session && study.type !== 'diary' && <Answers answers={r.tasks} />}
      {tab === 'result' && session && !finished && r.session && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <SessionCard title={sessionTitle} date={r.session.date} time={r.session.time} address={r.session.address}>{!inPerson && <JoinNow />}</SessionCard>
            <PinCard code={r.code} text={pinFor(inPerson ? 'completion' : 'joining')} />
          </div>
          {inPerson && <Notes tall="h-[667px]" />}
        </div>
      )}
      {tab === 'result' && session && finished && r.session && (
        <div className="flex flex-col gap-3">
          {inPerson
            ? <SessionCard title={sessionTitle} date={r.session.date} time={r.session.time} address={r.session.address} />
            : <VideoResult title={`Video Recording of ${r.name} and You`} who={r.name} when={r.session.at} />}
          {inPerson && <Notes tall="h-[580px]" />}
          <PinCard wide code={r.code} text={pinFor('completion')} />
        </div>
      )}

      {tab === 'activity' && (
        <div className="flex flex-col gap-4">
          {completed && !r.rating && <RateBanner title={`Rate ${r.name} for this study`} action={`Rate ${r.first}`} onRate={() => setRating(true)} />}
          <div>
            <h2 className="pb-2 text-body-medium leading-[22px] text-text-title">Study activity</h2>
            <ActivityList items={r.activity} />
          </div>
          {study.type !== 'survey' && p.code && <PinCard wide code={r.code} text={`This PIN number is to be shared with ${r.name}. for their completion verification`} />}
        </div>
      )}

      <RatePanel study={study} person={rating ? r : null} onClose={() => setRating(false)} />
      <NoShowDialog open={asking} group={false} name={r.name} onClose={() => setAsking(false)} onConfirm={() => { setAsking(false); markNoShow(study.id, r.id) }} />
    </DetailShell>
  )
}
