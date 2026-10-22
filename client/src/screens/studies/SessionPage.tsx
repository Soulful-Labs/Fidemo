import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Picker from '../../components/ui/Picker'
import { Calendar, CheckCircle, Clock, NoteIcon, VideoIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useStudies, useStudy } from '../../platform'
import { recruits, sessionSeats, sessionStartOf } from '@shared/derive'
import { longDay, monthDayYear } from '@shared/format'
import { TIER_MENU, tierFromMenu } from '@shared/lifecycle'
import { VERIFICATION_PIN } from '../../mock/respondent'
import { StudyStrip } from './RespondentResult'
import { PinCard } from './respondentBits'
import SessionPeople from './SessionPeople'
import SessionActivity from './SessionActivity'

/**
 * A group video call's session (22 Oct 2026), opened by View Participants on
 * Recruited and View Result on Results. Two tabs, Study Result and Activity.
 * - Before it runs (1627:105750): Scheduled For with the seats and Join Now,
 *   the Verification PIN everyone shares, and the participants.
 * - After (1627:106074): the video result, each participant's attendance, the
 *   PIN, and Mark all as Completed (1769:91859).
 * Activity (1627:106405) lists each participant with their steps.
 * The session, its seats and its people are the study's own (sessionSeats).
 */
export default function SessionPage() {
  const { id, sid } = useParams()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const s = useStudy(id)
  const { state: world, enterCode } = useStudies()
  const [tier, setTier] = useState('All')
  const all = sessionSeats(s)
  const i = Math.max(0, all.findIndex((x) => x.id === sid))
  const x = all[i]
  const tab = params.get('tab') === 'activity' ? 'activity' : 'result'
  const fromResults = params.get('from') === 'results'
  const name = `Session ${i + 1}`

  const people = x ? recruits(world, s).filter((r) => x.people.includes(r.id)) : []
  const shown = people.filter((r) => tier === 'All' || r.tier === tier.toLowerCase())
  const starts = x ? sessionStartOf({ date: x.date, slot: x.slot }) : undefined
  /** After the session has started, or once anyone in it has an outcome, the page shows the result. */
  const done = params.get('state') === 'completed' || (!!starts && Date.now() >= starts.getTime())
    || people.some((r) => r.state === 'completed' || r.state === 'rated' || r.state === 'no_show')
  /** One PIN for the whole session, the code on its bookings. */
  const code = s.participations.find((p) => p.booking?.sessionId === x?.id && p.code)?.code?.value
  const shareCode = (c: string) => { for (const r of people) if (r.participation.code && !r.participation.code.byClient) enterCode(s.id, r.id, c) }
  const pin = { pin: code, onShared: shareCode, text: VERIFICATION_PIN.groupBody }
  const notYet = () => toast('The recording and transcript appear here once the video provider is connected')

  const tabs = [
    { key: 'result', label: 'Study Result', icon: <NoteIcon className="h-4 w-4" /> },
    { key: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4" /> },
  ]

  return (
    <AppShell hideCreate crumbs={[
      { label: 'Studies', to: '/studies' },
      { label: s.title.length > 12 ? `${s.title.slice(0, 11)}…` : s.title, to: `/studies/${s.id}` },
      { label: fromResults ? 'Results' : 'Recruited', to: `/studies/${s.id}/${fromResults ? 'results' : 'recruited'}` },
      { label: name },
    ]}>
      <div className="min-h-[874px] rounded-lg bg-bg-0 p-4">
        <div className="flex flex-col gap-3">
          <StudyStrip s={s} />
          <section className="flex flex-col overflow-hidden rounded-lg border-1 border-stroke-1">
            <div className="flex h-11 items-center gap-8 border-b-1 border-stroke-1 bg-bg-1 px-4">
              {tabs.map((t) => (
                <button key={t.key} type="button" onClick={() => setParams((p) => { if (t.key === 'activity') p.set('tab', 'activity'); else p.delete('tab'); return p }, { replace: true })}
                  className={cn('flex h-11 items-center gap-2 border-b-1 text-body-regular',
                    t.key === tab ? 'border-cta-primary text-brand-primary' : 'border-transparent text-text-subtitle hover:text-text-title')}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {!x && <p className="p-6 text-body-regular text-text-subtitle">This study has no sessions yet.</p>}

            {x && tab === 'result' && (
              <div className="flex flex-col gap-4 px-4 pb-4 pt-5">
                <h2 className="text-title-s leading-[22px] text-text-title">{name}</h2>
                {!done && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 rounded-lg bg-yellow-30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-body-large text-text-title">Scheduled For</p>
                        <span className="flex h-7 items-center rounded-full bg-bgAlt-2 px-3 text-text-regular text-text-title">{x.taken} / {x.seats} Seats</span>
                      </div>
                      <p className="flex h-5 items-center gap-2 text-text-regular text-text-title"><Calendar className="h-4 w-4 text-brand-primary" />{longDay(x.date)}</p>
                      <p className="flex h-5 items-center gap-2 text-text-regular text-text-title"><Clock className="h-4 w-4 text-brand-primary" />{x.slot}</p>
                      <Button size="none" className="mt-2 h-12 w-full" leftIcon={<VideoIcon className="h-4 w-4" />} onClick={() => {
                        const w = window.open(`https://meet.humanlayer.app/${s.id}/${x.id}`, '_blank', 'noopener')
                        toast(w ? 'Opening the session' : 'Allow pop-ups to join the session')
                      }}>Join Now</Button>
                    </div>
                    <PinCard variant="session" {...pin} />
                  </div>
                )}
                {done && (
                  <div className="flex flex-col gap-2 rounded-lg bg-yellow-30 p-4">
                    <p className="text-body-large text-text-title">Video Result</p>
                    <div className="flex gap-4">
                      <div className="flex h-[104px] w-[140px] shrink-0 flex-col items-center justify-center rounded-md border-1 border-stroke-1 bg-bg-0">
                        <VideoIcon className="h-6 w-6 text-brand-primary" />
                        <span className="pt-2 text-text-medium text-text-title">{name}</span>
                        <span className="text-label text-text-subtitle">You</span>
                      </div>
                      <div className="flex flex-col gap-2 pt-1">
                        <p className="text-body-regular text-text-title">Video Recording of all participants and You</p>
                        <p className="flex items-center gap-3 text-text-regular text-text-subtitle">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-brand-secondary" />{s.duration}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-brand-secondary" />{monthDayYear(x.date)}, {x.slot}</span>
                        </p>
                        <span className="flex gap-3 pt-1">
                          <Button variant="secondary" size="none" className="h-[38px] px-3" onClick={notYet}>View Video Recording</Button>
                          <Button variant="tertiary" size="none" className="h-[38px] px-3" onClick={notYet}>Transcript</Button>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-body-medium text-text-title">Participants</h3>
                  <Picker value={`Tier: ${tier}`} h="h-[38px]" className="w-[220px] text-text-regular" options={TIER_MENU.map((m) => m.label)}
                    onPick={(v) => { const t = tierFromMenu(v); setTier(t ? t[0]!.toUpperCase() + t.slice(1) : 'All') }} />
                </div>
                <SessionPeople study={s} people={shown} anyone={people.length > 0} done={done} />
                {done && <PinCard variant="activity" {...pin} />}
              </div>
            )}

            {x && tab === 'result' && done && (
              <MarkAllBar study={s} people={people} code={code} />
            )}

            {x && tab === 'activity' && <SessionActivity study={s} people={people} pin={pin} />}
          </section>
        </div>
      </div>
    </AppShell>
  )
}

/** Completion Confirmation (1769:91859): everyone not yet marked is marked completed; once all are, it reads back in green. */
function MarkAllBar({ study, people, code }: { study: { id: string }; people: ReturnType<typeof recruits>; code?: string }) {
  const { moveRespondent, enterCode } = useStudies()
  const toast = useToast()
  const open = people.filter((r) => r.state === 'scheduled')
  const allDone = people.length > 0 && open.length === 0
  const markAll = () => {
    let failed = ''
    for (const r of open) {
      if (code && !r.participation.code?.byClient) enterCode(study.id, r.id, code)
      const res = moveRespondent(study.id, r.id, 'completed')
      if (!res.ok && !failed) failed = `${r.name}: ${res.why}`
    }
    toast(failed || 'Everyone in this session is marked completed')
  }
  return (
    <div className="flex h-[73px] items-center justify-between gap-4 border-t-1 border-stroke-1 bg-bg-1 px-4">
      {allDone ? (
        <>
          <p className="flex flex-col text-text-regular">
            <span className="text-brand-secondary">Marked as completed!</span>
            <span className="text-text-subtitle">This study has been successfully marked as completed with PIN by the participant.</span>
          </p>
          <span className="flex h-11 items-center gap-2 rounded-sm bg-green-50 px-4 text-text-medium text-brand-secondary"><CheckCircle className="h-4 w-4" />Marked all as completed</span>
        </>
      ) : (
        <>
          <p className="flex flex-col text-text-regular">
            <span className="text-text-subtitle">Completion Confirmation</span>
            <span className="text-text-title">Mark as completed for an additional confirmation</span>
          </p>
          <Button variant="secondary" size="none" className="h-11 px-4" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={markAll}>Mark all as Completed</Button>
        </>
      )}
    </div>
  )
}
