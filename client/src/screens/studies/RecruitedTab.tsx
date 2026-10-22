import { Avatar } from '../../components/client/RespondentCard'
import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import Pagination from '../../components/client/Pagination'
import { StudyFrame } from '../../components/client/StudyFrame'
import DownloadSessionsPanel from './DownloadSessionsPanel'
import { ScoreCell, StatusPill, Th } from '../../components/client/RespondentTable'
import { Calendar, ChevronRight, Clock, VideoIcon } from '../../components/ui/icons'
import { useToast } from '../../components/ui/Toast'
import { slotOf, usePlatform, useStudies, useStudy } from '../../platform'
import { CancelSessionModal } from './StudyMenus'
import { pageLabels, paginate, recruits, sessionSeats } from '@shared/derive'
import { slotDay } from '@shared/format'
import { CLIENT_TAG } from '@shared/lifecycle'

/**
 * Recruited (1627:96535). The study type changes what this tab is: a survey
 * or diary lists applications; an individual session study adds a Scheduled
 * table with the booked slot (1627:101612); a group session study lists the
 * sessions themselves (1627:104269).
 *
 * All three read the study's own participant list. The sessions are the
 * booked slots grouped by time, so the seat counts and the avatars are the
 * people actually in them rather than two separate seeded arrays.
 */
export default function RecruitedTab() {
  const toast = useToast()
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = useStudy(id)
  const world = usePlatform()
  const [downloads, setDownloads] = useState(params.get('panel') === 'downloads')
  /** The booked session the client is about to cancel. */
  const [cancelling, setCancelling] = useState<{ id: string; name: string } | null>(null)
  const { cancelSession } = useStudies()
  const session = s.type !== 'survey' && s.type !== 'diary'
  const group = s.type === 'group_video_call' || s.type === 'in_person_group'
  const [state, setState] = useState<'booked' | 'applications'>('booked')
  const [status, setStatus] = useState('All')
  const [tier, setTier] = useState('All')
  const [page, setPage] = useState(1)
  const booked = session && state === 'booked'

  const all = recruits(world, s, 'recruited')
  const applications = all
    .filter((r) => status === 'All' || CLIENT_TAG[r.state] === status)
    .filter((r) => tier === 'All' || r.tier === tier.toLowerCase())
  const shownApplications = paginate(applications, page)
  const scheduled = all.filter((r) => r.state === 'scheduled' && r.participation.booking)
  /**
   * A group study's sessions are the study's own, each with its seats and the
   * people booked into it; the seat count is no longer a constant.
   */
  const everyone = recruits(world, s)
  const sessions = sessionSeats(s).map((x) => ({
    key: x.id, day: slotDay(x.date), time: x.slot, seats: x.seats,
    people: everyone.filter((r) => x.people.includes(r.id)),
  }))

  return (
    <AppShell hideCreate crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="recruited"
        minH={session ? 'min-h-[1186px]' : 'min-h-[1090px]'}
        bodyMinH={session ? 'min-h-[928px]' : 'min-h-[832px]'}>
        <div className="flex flex-col px-4 pt-4">
          <h2 className="text-title-s leading-[22px] text-text-title">Recruited Respondents</h2>
          <p className="pt-2 text-text-regular text-text-subtitle">List of respondents applied on this study and track their statuses</p>

          <div className="flex items-center justify-between gap-4 pt-[22px]">
            {session ? (
              <Tabs variant="segmented" className="w-[238px]" value={state} onChange={(k) => setState(k as 'booked' | 'applications')}
                items={[{ key: 'booked', label: group ? 'Sessions' : 'Scheduled' }, { key: 'applications', label: 'Applications' }]} />
            ) : <span />}
            <div className="flex items-center gap-3">
              <Select value={`Status: ${status}`} h="h-[38px]" className="w-[156px] text-text-regular"
                onClick={() => setStatus((v) => (v === 'All' ? 'Applied' : v === 'Applied' ? 'Qualified' : v === 'Qualified' ? 'Disqualified' : 'All'))} />
              <Select value={`Tier: ${tier}`} h="h-[38px]" className="w-[156px] text-text-regular"
                onClick={() => setTier((v) => (v === 'All' ? 'Platinum' : v === 'Platinum' ? 'Gold' : v === 'Gold' ? 'Silver' : 'All'))} />
            </div>
          </div>

          {group && booked ? (
            <div className="flex flex-col gap-2 pt-3">
              {sessions.length === 0 && (
                <p className="py-10 text-center text-body-regular text-text-subtitle">No sessions have been booked yet.</p>
              )}
              {sessions.map((g, gi) => (
                <div key={g.key} className="flex justify-between gap-4 rounded-lg bg-bg-1 p-4">
                  <div className="flex flex-col gap-3.5">
                    <p className="text-title-s leading-[22px] text-text-title">Session {gi + 1}</p>
                    <p className="flex h-5 items-center gap-2 text-text-regular text-text-title">
                      <Calendar className="h-4 w-4 text-brand-primary" />{g.day}
                    </p>
                    <p className="flex h-5 items-center gap-2 text-text-regular text-text-title">
                      <Clock className="h-4 w-4 text-brand-primary" />{g.time}
                    </p>
                    <span className="inline-flex h-7 items-center self-start rounded-full bg-bgAlt-2 px-3 text-text-regular text-text-title">
                      {g.people.length} / {g.seats} Seats
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <Button variant="secondary" size="none" className="h-[38px] px-4"
                      onClick={() => { setState('applications'); toast(`${g.people.length} booked into this session`) }}
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Participants</Button>
                    <span className="flex -space-x-1.5">
                      {g.people.slice(0, 6).map((r) => (
                        r.photo
                          ? <img key={r.id} src={r.photo} alt="" className="h-[22px] w-[22px] rounded-full object-cover ring-1 ring-bg-1" />
                          : <span key={r.id} className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-bgAlt-2 ring-1 ring-bg-1 text-label text-text-subtitle">{r.name.charAt(0)}</span>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-3">
              <div className="overflow-hidden rounded-md border-1 border-stroke-input">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b-1 border-stroke-input bg-bg-1">
                      <Th label="Name" className={booked ? 'w-[14.3%]' : 'w-[16.1%]'} />
                      <Th label="Role" className={booked ? 'w-[28.6%]' : 'w-[32.1%]'} />
                      {booked ? <Th label="Score" sortable className="w-[17%]" /> : <Th label="Status" sortable className="w-[14.3%]" />}
                      {booked ? <Th label="Session Time" className="w-[40.1%]" /> : <Th label="Score" sortable className="w-[37.5%]" />}
                    </tr>
                  </thead>
                  <tbody>
                    {booked
                      ? paginate(scheduled, page).rows.map((r, i) => (
                        <tr key={r.id} className="border-b-1 border-stroke-input last:border-b-0">
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">
                            <span className="flex items-center gap-2"><Avatar name={r.name} photo={r.photo} size={28} /><Link to={`/studies/${s.id}/respondent/${r.id}?state=recruited`} className="hover:underline">{r.name}</Link></span>
                          </td>
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-[60px] px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                          <td className="h-[60px] px-[18px] pr-2">
                            <span className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-text-regular text-text-title">
                                {slotOf(r.participation)?.day} <span className="text-text-body">&bull;</span> {slotOf(r.participation)?.time}
                                {r.participation.state === 'scheduled' && (
                                  <button type="button" onClick={() => setCancelling({ id: r.id, name: r.name })}
                                    className="ml-2 text-text-regular text-text-subtitle underline hover:text-red-600">Cancel</button>
                                )}
                              </span>
                              {i === 0 && (
                                <Button size="none" className="h-[38px] px-4" leftIcon={<VideoIcon className="h-4 w-4" />}
                                  onClick={() => {
                                    /* Step 39: the link is always a Focus Insite one, issued
                                       by the team. There is no room to open here, so the
                                       session opens in a new tab as it would. */
                                    const w = window.open(`https://meet.humanlayer.app/${s.id}/${r.id}`, '_blank', 'noopener')
                                    toast(w ? 'Opening the session' : 'Allow pop-ups to join the session')
                                  }}>Join Now</Button>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))
                      : shownApplications.rows.map((r) => (
                        <tr key={r.id} className="border-b-1 border-stroke-input last:border-b-0">
                          <td className="h-row px-[18px] text-text-regular text-text-title">
                            <span className="flex items-center gap-2"><Avatar name={r.name} photo={r.photo} size={28} /><Link to={`/studies/${s.id}/respondent/${r.id}?state=recruited`} className="hover:underline">{r.name}</Link></span>
                          </td>
                          <td className="h-row px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-row px-[18px]">
                            <StatusPill status={CLIENT_TAG[r.state]} />
                          </td>
                          <td className="h-row px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={shownApplications.page}
                pages={pageLabels(booked ? paginate(scheduled, page).total : shownApplications.total, shownApplications.page)}
                onPage={setPage} />
            </div>
          )}
        </div>
      </StudyFrame>
      <CancelSessionModal open={cancelling !== null} name={cancelling?.name.split(' ')[0] ?? ''} onClose={() => setCancelling(null)}
        onConfirm={(reason) => { if (!cancelling) return; const res = cancelSession(s.id, cancelling.id, reason); setCancelling(null); toast(res.ok ? 'Session cancelled. They have been told, at no cost to them.' : res.why) }} />
      <DownloadSessionsPanel study={s} open={downloads} onClose={() => setDownloads(false)}
        artefact={s.type === 'group_video_call' ? 'Recordings + Transcript' : 'Notes'} />
    </AppShell>
  )
}
