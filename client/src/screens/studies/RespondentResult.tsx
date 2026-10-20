import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import RespondentRail, { RatePrompt } from '../../components/client/RespondentRail'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import RatePanel from './RatePanel'
import ReportParticipant from '../../components/client/ReportParticipant'
import { STUDY_TYPE } from '../../lib/studyTypes'
import NoShowModal from './NoShowModal'
import { ActivityList, DayBar, NotesCard, PinCard, QARow, SessionCard } from './respondentBits'
import { CheckCircle, Clock, Close, DiaryBookIcon, NoteIcon, SurveyIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { answersOf, resultsOf } from '../../mock/respondent'
import { clockTime, longDay, monthDayYearTime } from '@shared/format'
import { sessionStart } from '@shared/store'
import { DECISION_UNDO_MS } from '@shared/platform'
import { useToast } from '../../components/ui/Toast'
import { useStudy } from '../../platform'
import type { ClientStudy as Study } from '../../platform'
import { useStudies } from '../../platform'
import { recruit, recruits } from '@shared/derive'

type Tab = 'screener' | 'result' | 'activity'

/** The study, in the compact strip above a respondent's result. */
function StudyStrip({ s }: { s: Study }) {
  return (
    <div className="flex h-[102px] items-center gap-4 rounded-lg bg-bgAlt-1 p-4">
      {s.image ? <img src={s.image} alt="" className="h-[70px] w-[92px] shrink-0 rounded-md object-cover" /> : <span className="h-[70px] w-[92px] shrink-0 rounded-md bg-bg-2" />}
      <div className="flex flex-col gap-3">
        <p className="text-title-s leading-[22px] text-text-title">{s.title}</p>
        {/* The duration and industry are plain text beside the type tag in the 13 Oct 2026 export, not pills of their own. */}
        <div className="flex items-center gap-3">
          <StudyTypeTag type={s.type} className="h-8 px-3" icon={s.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
          <span className="flex items-center gap-1 text-text-regular text-text-subtitle">
            <Clock className="h-[18px] w-[18px] text-text-title" />{s.duration}
            {s.industry && <><span className="px-1.5 text-text-title">&bull;</span>{s.industry}</>}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * A respondent's result (1627:97305 recruited, 1627:97609 completed,
 * 1627:97901 activity). Survey and diary show the answers; a session study
 * shows the booked slot, the PIN and the interview notes instead
 * (1627:102694, 1627:102902). Everything else about the screen is shared.
 */
export default function RespondentResult({ tab = 'screener' }: { tab?: Tab }) {
  const toast = useToast()
  const { id, rid } = useParams()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const s = useStudy(id)
  const { moveRespondent, enterCode, reportParticipant, state: world } = useStudies()
  const [reporting, setReporting] = useState(false)
  const [rate, setRate] = useState(params.get('rate') === '1' || params.get('rate') === 'rated')
  const [noShow, setNoShow] = useState<'one' | 'all' | null>((params.get('noshow') as 'one' | 'all') ?? null)

  /** Whose result this is. Everything on the screen follows their state. */
  const person = recruit(world, s, rid ?? '') ?? recruits(world, s, 'results')[0]
  const state = person?.state

  const session = s.type !== 'survey' && s.type !== 'diary'
  /** The recruited state is judged on the screener alone; the completed one has a result. */
  const done = params.get('state') === 'recruited' ? false
    : params.get('state') === 'completed' || state === 'completed' || state === 'rated' || state === 'no_show'
      // A booked session has a result page: the slot, the PIN, then the verdict once it has been sat.
      || (session && state === 'scheduled')
  /**
   * booked -> running -> finished, the three states the frames draw the slot
   * in. The booking's own time decides it; Start Interview and Finish move it
   * on for this page (a frame can still force one with `?session=`).
   */
  const begins = person?.participation.booking ? sessionStart(person.participation.booking).getTime() : undefined
  const now = Date.now()
  const timed = begins === undefined || now < begins ? 'booked' : now < begins + s.durationMins * 60_000 ? 'running' : 'finished'
  const slot = (params.get('session') ?? timed) as 'booked' | 'running' | 'finished'
  const running = slot !== 'booked'
  const phase = (to: 'running' | 'finished') => setParams((p) => { p.set('session', to); return p }, { replace: true })
  /** A session study is only rated once its slot has been sat. */
  const rated = session ? running : done
  const crumbTab = done ? 'Results' : 'Recruited'
  const decidedAt = person?.participation.decidedAt
  const undoable = !!decidedAt && Date.now() - new Date(decidedAt).getTime() <= DECISION_UNDO_MS

  /**
   * Sharing the PIN is the client's half of the session code (step 42). Without
   * it `Mark Completed` refused every time with "No code, no payment" and the
   * client had no way to satisfy it: the card printed a PIN and nothing read it.
   */
  const shared = (code: string) => {
    if (!person) return
    const res = enterCode(s.id, person.id, code)
    if (!res.ok && res.why) toast(res.why)
  }
  const pinProps = { pin: person?.participation.code?.value, name: person?.name, onShared: shared }

  /** The booking on this participation: who, when and where. */
  const booking = person?.participation.booking
  const starts = booking ? sessionStart(booking) : undefined
  const venue = s.locations?.find((l) => l.id === booking?.locationId)
  const sessionInfo = booking && starts ? {
    title: `${s.type === 'in_person' || s.type === 'in_person_group' ? 'In-person interview' : 'Video call'} of ${person?.name} and You`,
    date: longDay(booking.date),
    time: `${booking.slot} - ${clockTime(new Date(starts.getTime() + s.durationMins * 60_000).toISOString())}`,
    address: venue?.address,
  } : undefined
  /** What has happened on this participation, as the platform recorded it. */
  const events = (person?.participation.events ?? []).map((e) => ({ label: e.label, at: monthDayYearTime(e.at) }))

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'screener', label: 'Screener', icon: <SurveyIcon className="h-4 w-4" /> },
    ...(done ? [{ key: 'result' as Tab, label: 'Study Result', icon: <NoteIcon className="h-4 w-4" /> }] : []),
    { key: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4" /> },
  ]

  // The person you opened, not the frame's seeded one: a constant here sent
  // every tab switch to the same respondent whoever you had opened.
  const to = (t: Tab) => `/studies/${s.id}/respondent/${person?.id ?? rid ?? ''}${t === 'screener' ? '' : `/${t}`}`
    + (done ? '' : '?state=recruited')

  return (
    <AppShell hideCreate crumbs={[
      { label: 'Studies', to: '/studies' },
      { label: s.title.length > 12 ? `${s.title.slice(0, 11)}…` : s.title, to: `/studies/${s.id}` },
      { label: crumbTab, to: `/studies/${s.id}/${done ? 'results' : 'recruited'}` },
      // The person you opened. The frames name John M here and someone else
      // in the row that opens it; a live build cannot show both.
      { label: person?.name ?? '' },
    ]}>
      <div className="min-h-[874px] rounded-lg bg-bg-0 p-4">
        <div className="flex flex-col gap-3">
          <StudyStrip s={s} />

          <div className="flex items-start gap-6">
            {/* The card is as tall as what it holds, with the decision bar closing it (13 Oct 2026 export). */}
            <section className="flex flex-1 flex-col overflow-hidden rounded-lg border-1 border-stroke-1">
              <div className="flex h-11 items-center gap-8 border-b-1 border-stroke-1 bg-bg-1 px-4">
                {tabs.map((t) => (
                  <button key={t.key} type="button" onClick={() => nav(to(t.key))}
                    className={cn('flex h-11 items-center gap-2 border-b-1 text-body-regular',
                      t.key === tab ? 'border-cta-primary text-brand-primary' : 'border-transparent text-text-subtitle hover:text-text-title')}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              {tab === 'activity' && (
                <div className="flex flex-col px-4 pb-4 pt-5">
                  {done && <RatePrompt name={person?.name} wide onRate={() => setRate(true)} />}
                  <ActivityList events={events} />
                  <div className="pt-[14px]"><PinCard variant="activity" {...pinProps} /></div>
                </div>
              )}

              {tab === 'screener' && answersOf(s, person?.participation).map((qa, i) => (
                <QARow key={i} n={i + 1} qa={qa} first={i === 0} />
              ))}

              {tab === 'result' && !session && resultsOf(s, person?.participation).map((d, k) => (
                <div key={d.label ?? k}>
                  {d.label && <DayBar label={d.label} />}
                  {d.answers.map((qa, i) => <QARow key={i} n={i + 1} qa={qa} first={i === 0} />)}
                </div>
              ))}

              {tab === 'result' && session && (
                <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-5">
                  {running
                    ? <SessionCard state={slot === 'finished' ? 'done' : 'running'} session={sessionInfo} onFinish={() => phase('finished')} />
                    : (
                      <div className="grid grid-cols-2 gap-3">
                        <SessionCard state="booked" session={sessionInfo} onStart={() => phase('running')} />
                        <PinCard variant="session" {...pinProps} />
                      </div>
                    )}
                  <NotesCard download={running} className="flex-1" />
                  {running && <PinCard variant="activity" {...pinProps} />}
                </div>
              )}

              {/* Qualify / Disqualify is judged on the screener alone (1627:97609),
                  so it does not wait for a slot to be sat. Only the completed
                  bar on a session study does, which is what `running` gates. */}
              {tab !== 'activity' && (!done || (session ? running : true)) && (
                <div className={cn('flex items-center justify-between gap-4 border-t-1 border-stroke-1 bg-bg-1 px-4', session ? 'h-[73px]' : 'mt-[11px] h-20')}>
                  {/* The decision is only open while they are waiting on it. Someone
                      already qualified, disqualified, recruited or scheduled is past
                      this point, so their standing is stated rather than offered
                      again — the store refused it, which read as a broken button. */}
                  {/* Screener CTAs (1769:80372): a decision reads back in its colour, with Undo for the hour the store allows (DECISION_UNDO_MS). */}
                  {!done && (state === 'qualified' || state === 'disqualified') && (
                    <>
                      <p className="flex flex-col text-text-regular">
                        <span className={state === 'qualified' ? 'text-brand-secondary' : 'text-red-600'}>
                          {state === 'qualified' ? 'You have qualified this respondent for the further study.' : 'You have disqualified this respondent for the further study.'}
                        </span>
                        <span className="text-text-title">The action can be undone within 1 hour only after it is taken.</span>
                      </p>
                      <span className="flex items-center gap-3">
                        {undoable && (
                          <Button variant="tertiary" size="none" className="h-12 px-5 text-body-medium" onClick={() => {
                            const res = moveRespondent(s.id, person.id, 'applied')
                            toast(res.ok ? 'Decision undone' : res.why)
                          }}>Undo</Button>
                        )}
                        <span className={cn('flex h-12 items-center gap-2 rounded-md px-5 text-body-medium',
                          state === 'qualified' ? 'bg-green-50 text-brand-secondary' : 'bg-red-50 text-red-600')}>
                          {state === 'qualified' ? <><CheckCircle className="h-5 w-5" />Qualified</> : <><Close className="h-5 w-5" />Disqualified</>}
                        </span>
                      </span>
                    </>
                  )}
                  {!done && state !== 'applied' && state !== 'qualified' && state !== 'disqualified' && (
                    <p className="flex flex-col text-text-regular">
                      <span className="text-text-subtitle">This application has already been decided.</span>
                      <span className="text-text-title">
                        {state === 'scheduled' ? `${person.name} is qualified and has booked a session.` : `${person.name} is qualified for this study.`}
                      </span>
                    </p>
                  )}
                  {!done && state === 'applied' && (
                    <>
                      <p className="flex flex-col text-text-regular">
                        <span className="text-text-subtitle">Choose Qualify for further study or Disqualify to reject from here.</span>
                        <span className="text-text-title">The action can be undone within 1 hour only after it is taken.</span>
                      </p>
                      <span className="flex items-center gap-3">
                        <Button variant="ghost" size="none" className="h-12 w-[154px] bg-red-50 text-body-medium text-red-600 hover:text-red-600"
                          onClick={() => {
                            const res = moveRespondent(s.id, person.id, 'disqualified')
                            toast(res.ok ? `${person.name} disqualified` : res.why)
                          }} leftIcon={<Close className="h-5 w-5" />}>Disqualify</Button>
                        <Button size="none" className="h-12 w-[154px] text-body-medium" onClick={() => {
                          const res = moveRespondent(s.id, person.id, 'qualified')
                          toast(res.ok ? `${person.name} qualified` : res.why)
                        }} leftIcon={<CheckCircle className="h-5 w-5" />}>Qualify</Button>
                      </span>
                    </>
                  )}
                  {done && !session && (
                    <>
                      <p className="flex flex-col">
                        <span className="text-text-medium text-brand-secondary">Marked as completed!</span>
                        <span className="text-text-regular text-text-subtitle">The {STUDY_TYPE[s.type].label.toLowerCase()} study has been successfully completed by {person?.name.split(' ')[0] ?? 'the respondent'}.</span>
                      </p>
                      <span className="flex h-11 items-center gap-2 rounded-sm bg-green-50 px-4 text-text-medium text-brand-secondary">
                        <CheckCircle className="h-4 w-4" />Completed
                      </span>
                    </>
                  )}
                  {/* The verdict is only open while the session is sat and nothing
                      has been decided. Someone already completed, rated or marked
                      no-show is past it, so their outcome is stated rather than
                      offered again; the store refused it and the buttons read as
                      broken. Same rule as Qualify above. */}
                  {done && session && (state === 'completed' || state === 'rated' || state === 'no_show') && (
                    <p className="flex flex-col text-text-regular">
                      <span className="text-text-subtitle">Completion Confirmation</span>
                      <span className="text-text-title">
                        {state === 'no_show'
                          ? `${person.name} was marked a no-show and is not paid for this session.`
                          : `${person.name} completed this session.${state === 'rated' ? ' Rated.' : ''}`}
                      </span>
                    </p>
                  )}
                  {done && session && state === 'scheduled' && (
                    <>
                      <p className="flex flex-col">
                        <span className="text-text-regular text-text-subtitle">Completion Confirmation</span>
                        <span className="text-text-regular text-text-title">Mark as completed for an additional confirmation</span>
                      </p>
                      <span className="flex items-center gap-3">
                        <Button variant="tertiary" size="none" className="h-11 px-4" onClick={() => setNoShow('one')} leftIcon={<Close className="h-4 w-4" />}>Mark No-show</Button>
                        <Button variant="secondary" size="none" className="h-11 px-4" onClick={() => {
                          /* Step 42: no code, no payment. The store refuses when
                             either side has not entered it. */
                          const res = moveRespondent(s.id, person.id, 'completed')
                          toast(res.ok ? `${person.name} marked completed` : res.why)
                        }} leftIcon={<CheckCircle className="h-4 w-4" />}>Mark Completed</Button>
                      </span>
                    </>
                  )}
                </div>
              )}
            </section>

            <RespondentRail rate={rated} onRate={() => setRate(true)} onReport={() => setReporting(true)}
              person={person && { id: person.id, name: person.name, role: person.role, score: person.score, tier: person.tier }} />
          </div>
        </div>
      </div>

      <ReportParticipant open={reporting} onClose={() => setReporting(false)}
        onSubmit={(reason, detail) => reportParticipant(person.id, reason, detail, s.id)} />
      <RatePanel open={rate} onClose={() => setRate(false)} study={s} personId={person?.id}
        rated={params.get('rate') === 'rated'} />
      <NoShowModal open={!!noShow} scope={noShow ?? 'one'} onClose={() => setNoShow(null)}
        name={person?.name.split(' ')[0]} full={person?.name}
        onConfirm={() => {
          const res = moveRespondent(s.id, person.id, 'no_show')
          toast(res.ok ? `${person.name} marked as a no-show` : res.why)
          setNoShow(null)
        }} />
    </AppShell>
  )
}
