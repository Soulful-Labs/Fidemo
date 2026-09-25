import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import RespondentRail, { RatePrompt } from '../../components/client/RespondentRail'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import RatePanel from './RatePanel'
import NoShowModal from './NoShowModal'
import { ActivityList, DayBar, NotesCard, PinCard, QARow, SessionCard } from './respondentBits'
import { CheckCircle, Clock, Close, DiaryBookIcon, NoteIcon, SurveyIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { DIARY_DAYS, RESPONDENT, SCREENER_ANSWERS } from '../../mock/respondent'
import { useToast } from '../../components/ui/Toast'
import { useStudy } from '../../mock/store'
import type { Study } from '../../mock/db'

type Tab = 'screener' | 'result' | 'activity'

/** The study, in the compact strip above a respondent's result. */
function StudyStrip({ s }: { s: Study }) {
  return (
    <div className="flex h-[102px] items-center gap-4 rounded-lg bg-bgAlt-1 p-4">
      <img src={s.image} alt="" className="h-[70px] w-[92px] shrink-0 rounded-md object-cover" />
      <div className="flex flex-col gap-3">
        <p className="text-title-s leading-[22px] text-text-title">{s.title}</p>
        <div className="flex items-center gap-2">
          <StudyTypeTag type={s.type} icon={s.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
          <span className="flex h-8 items-center gap-2 rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
            <Clock className="h-4 w-4" />{s.duration}
          </span>
          <span className="flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
            {s.industry}
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
  const { id } = useParams()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const s = useStudy(id)
  const [rate, setRate] = useState(params.get('rate') === '1' || params.get('rate') === 'rated')
  const [noShow, setNoShow] = useState<'one' | 'all' | null>((params.get('noshow') as 'one' | 'all') ?? null)

  const session = s.type !== 'survey' && s.type !== 'diary'
  /** The recruited state is judged on the screener alone; the completed one has a result. */
  const done = params.get('state') !== 'recruited'
  /** booked -> running -> finished, the three states the frames draw the slot in. */
  const slot = (params.get('session') ?? 'booked') as 'booked' | 'running' | 'finished'
  const running = slot !== 'booked'
  /** A session study is only rated once its slot has been sat. */
  const rated = session ? running : done
  const crumbTab = done ? 'Results' : 'Recruited'

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'screener', label: 'Screener', icon: <SurveyIcon className="h-4 w-4" /> },
    ...(done ? [{ key: 'result' as Tab, label: 'Study Result', icon: <NoteIcon className="h-4 w-4" /> }] : []),
    { key: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4" /> },
  ]

  const to = (t: Tab) => `/studies/${s.id}/respondent/${RESPONDENT.id}${t === 'screener' ? '' : `/${t}`}`
    + (done ? '' : '?state=recruited')

  return (
    <AppShell crumbs={[
      { label: 'Studies', to: '/studies' },
      { label: 'GLP-1 Care…' },
      { label: crumbTab, to: `/studies/${s.id}/${done ? 'results' : 'recruited'}` },
      { label: session ? RESPONDENT.name : RESPONDENT.rowName },
    ]}>
      <div className={cn('rounded-lg bg-bg-0 p-4', session ? 'min-h-[1173px]' : 'min-h-[1286px]')}>
        <div className="flex flex-col gap-3">
          <StudyStrip s={s} />

          <div className="flex gap-6">
            <section className={cn('flex flex-1 flex-col overflow-hidden rounded-lg border-1 border-stroke-input',
                session ? (running ? 'min-h-[1028px]' : 'min-h-[945px]') : 'min-h-[1129px]')}>
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
                  {done && <RatePrompt wide onRate={() => setRate(true)} />}
                  <ActivityList />
                  <div className="pt-[14px]"><PinCard variant="activity" /></div>
                </div>
              )}

              {tab === 'screener' && SCREENER_ANSWERS.map((qa, i) => (
                <QARow key={i} n={i + 1} qa={qa} first={i === 0} />
              ))}

              {tab === 'result' && !session && DIARY_DAYS.map((d) => (
                <div key={d.label}>
                  <DayBar label={d.label} />
                  {d.answers.map((qa, i) => <QARow key={i} n={i + 1} qa={qa} first={i === 0} />)}
                </div>
              ))}

              {tab === 'result' && session && (
                <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-5">
                  {running
                    ? <SessionCard state={slot === 'finished' ? 'done' : 'running'} />
                    : (
                      <div className="grid grid-cols-2 gap-3">
                        <SessionCard state="booked" />
                        <PinCard variant="session" />
                      </div>
                    )}
                  <NotesCard download={running} className="flex-1" />
                  {running && <PinCard variant="activity" />}
                </div>
              )}

              {tab !== 'activity' && (session ? running : true) && (
                <div className={cn('flex items-center justify-between gap-4 bg-bgAlt-1 px-4', session ? 'h-[73px]' : 'mt-[11px] h-[81px]')}>
                  {!done && (
                    <>
                      <p className="flex flex-col text-text-regular">
                        <span className="text-text-subtitle">Choose Qualify for further study or Disqualify to reject from here.</span>
                        <span className="text-text-title">The action can be undone within 1 hour only after it is taken.</span>
                      </p>
                      <span className="flex items-center gap-3">
                        <Button variant="ghost" size="none" className="h-12 w-[154px] bg-[#fee9e7] text-[#e33a38] hover:text-[#e33a38]"
                          onClick={() => toast('Respondent disqualified')} leftIcon={<Close className="h-4 w-4" />}>Disqualify</Button>
                        <Button size="none" className="h-12 w-[154px]" onClick={() => toast('Respondent qualified')} leftIcon={<CheckCircle className="h-4 w-4" />}>Qualify</Button>
                      </span>
                    </>
                  )}
                  {done && !session && (
                    <>
                      <p className="flex flex-col">
                        <span className="text-text-medium text-brand-secondary">Marked as completed!</span>
                        <span className="text-text-regular text-text-subtitle">The diary study has been successfully completed by {RESPONDENT.first}.</span>
                      </p>
                      <span className="flex h-11 items-center gap-2 rounded-sm bg-green-50 px-4 text-text-medium text-brand-secondary">
                        <CheckCircle className="h-4 w-4" />Completed
                      </span>
                    </>
                  )}
                  {done && session && (
                    <>
                      <p className="flex flex-col">
                        <span className="text-text-regular text-text-subtitle">Completion Confirmation</span>
                        <span className="text-text-regular text-text-title">Mark as completed for an additional confirmation</span>
                      </p>
                      <span className="flex items-center gap-3">
                        <Button variant="tertiary" size="none" className="h-11 px-4" onClick={() => setNoShow('one')} leftIcon={<Close className="h-4 w-4" />}>Mark No-show</Button>
                        <Button variant="secondary" size="none" className="h-11 px-4" onClick={() => toast('Marked completed')} leftIcon={<CheckCircle className="h-4 w-4" />}>Mark Completed</Button>
                      </span>
                    </>
                  )}
                </div>
              )}
            </section>

            <RespondentRail rate={rated} onRate={() => setRate(true)} />
          </div>
        </div>
      </div>

      <RatePanel open={rate} onClose={() => setRate(false)} study={s} rated={params.get('rate') === 'rated'} />
      <NoShowModal open={!!noShow} scope={noShow ?? 'one'} onClose={() => setNoShow(null)} />
    </AppShell>
  )
}
