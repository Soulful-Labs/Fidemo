import { Fragment, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { MANAGED } from '../../../mock/manage'
import { applications } from '../../../mock/recruiting'
import { ANSWERS, DIARY_ANSWERS, SHORT_ACTIVITY, sessionActivity } from '../../../mock/results'
import { CompletedBar, CompletionBar, ScreenerBar } from './bars'
import type { CompletionState, ScreenerState } from './bars'
import { ActivityList, Answers, JoinNow, Notes, PinCard, RateBanner, SessionCard, VideoResult } from './content'
import DetailShell, { DETAIL_TABS, RespondentCard } from './DetailShell'
import { NoShowDialog, RatePanel } from './dialogs'

type Tab = 'screener' | 'result' | 'activity'
const PIN_ACTIVITY = 'This PIN number is to be shared with John M. for their completion verification'
const PIN_COMPLETION = 'Share this PIN number with John M. for their completion verification'

/**
 * A respondent inside a study (`/studies/:id/respondents/:rid`). Where they
 * are in the study decides what is drawn:
 * - applied (from Recruited > Applications): Screener and Activity, with the
 *   Qualify / Disqualify bar under their answers (1952:78522);
 * - booked (from Recruited > Scheduled, one-to-one studies): Study Result
 *   shows the session and its Verification PIN (1952:82213, 1961:184023);
 * - finished (from Results): Study Result shows the answers, recording or
 *   notes, and the completion bar; the card beside it asks for a rating
 *   (1932:108609, 1952:82396, 1961:184231).
 * Group studies draw only the applied page; their sessions have their own.
 */
export default function RespondentPage() {
  const { id, rid = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const study = MANAGED.find((s) => s.id === id) ?? MANAGED[0]!
  const group = study.type === 'video-group' || study.type === 'in-person-group'
  const stage = group || rid.startsWith('a') ? 'applied' : rid.startsWith('b') ? 'booked' : 'finished'
  const name = group ? 'Sarah K' : 'John M'
  const keys: Tab[] = stage === 'applied' ? ['screener', 'activity'] : ['screener', 'result', 'activity']
  const wanted = params.get('tab') as Tab | null
  const tab: Tab = wanted && keys.includes(wanted) ? wanted : stage === 'applied' ? 'screener' : 'result'
  const [rating, setRating] = useState(false)
  const [asking, setAsking] = useState(false)
  const [completion, setCompletion] = useState<CompletionState>('todo')

  const status = applications('').find((a) => a.id === rid)?.status
  const screener: ScreenerState = status === 'Qualified' ? 'settled' : status === 'Disqualified' ? 'disqualified' : 'todo'
  const finished = stage === 'finished'
  const closed = params.get('from') === 'completed'
  const session = study.type === 'video' || study.type === 'in-person'
  const inPerson = study.type === 'in-person'

  const activity = study.type === 'survey' ? SHORT_ACTIVITY : sessionActivity(name, inPerson || study.type === 'diary', study.type === 'video')
  const banner = study.type === 'survey' ? ['Rate Ferry for this study', 'Rate Ferry'] : inPerson ? ['Rate John for this study', 'Rate John'] : ['Rate John M for this study', 'Rate John']

  let bar = null
  if (tab === 'screener' && stage === 'applied' && rid.startsWith('a')) bar = <ScreenerBar initial={screener} />
  if (tab === 'result' && finished) bar = session
    ? <CompletionBar label={inPerson ? 'Completion Confirmation' : 'Final Completion Confirmation'} state={completion} onChange={setCompletion} onNoShow={() => setAsking(true)} />
    : <CompletedBar closed={closed} />

  return (
    <DetailShell closed={closed} close={stage === 'applied'} study={study} tabs={keys.map((k) => DETAIL_TABS[k])} tab={tab} onTab={(k) => setParams({ tab: k, ...(closed && { from: 'completed' }) }, { replace: true })} bar={bar}
      aside={<RespondentCard name={name} onRate={finished ? () => setRating(true) : undefined} />}>
      {tab === 'screener' && <Answers answers={ANSWERS} />}

      {tab === 'result' && study.type === 'diary' && (
        <div className="flex flex-col gap-3">
          {DIARY_ANSWERS.map(([day, answers], i) => (
            <Fragment key={day}>
              {i > 0 && <hr className="-mx-4 mt-2 border-0 border-t-1 border-stroke-1" />}
              <p className="flex h-7 items-center justify-center rounded-full bg-bg-1 text-text-regular text-text-subtitle">{day}</p>
              <Answers answers={answers} />
            </Fragment>
          ))}
        </div>
      )}
      {tab === 'result' && !session && study.type !== 'diary' && <Answers answers={ANSWERS} />}
      {tab === 'result' && session && !finished && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {inPerson
              ? <SessionCard title="In-person interview of Liam K. and Client" date="August 12, 2026, Wednesday" time="10:00 AM - 11:00 AM" address />
              : <SessionCard title="Scheduled For" date="August 12, 2026, Wednesday" time="10:00 AM"><JoinNow /></SessionCard>}
            <PinCard text={inPerson ? PIN_COMPLETION : 'Share this PIN number with John M. for their joining verification'} />
          </div>
          {inPerson && <Notes tall="h-[667px]" />}
        </div>
      )}
      {tab === 'result' && session && finished && (
        <div className="flex flex-col gap-3">
          {inPerson
            ? <SessionCard title="In-person interview of Liam K. and Client" date="August 12, 2026, Wednesday" time="10:00 AM - 11:00 AM" address />
            : <VideoResult title="Video Recording of John M and You" who="John M" />}
          {inPerson && <Notes tall="h-[580px]" />}
          <PinCard wide text={PIN_COMPLETION} />
        </div>
      )}

      {tab === 'activity' && (
        <div className="flex flex-col gap-4">
          {finished && <RateBanner title={banner[0]!} action={banner[1]!} onRate={() => setRating(true)} />}
          <div>
            <h2 className="pb-2 text-body-medium leading-[22px] text-text-title">Study activity</h2>
            <ActivityList items={activity} />
          </div>
          {study.type !== 'survey' && <PinCard wide text={PIN_ACTIVITY} />}
        </div>
      )}

      <RatePanel person={rating ? name : null} onClose={() => setRating(false)} />
      <NoShowDialog open={asking} group={false} onClose={() => setAsking(false)} onConfirm={() => { setAsking(false); setCompletion('noshow') }} />
    </DetailShell>
  )
}
