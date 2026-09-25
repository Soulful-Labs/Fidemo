import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
import { useStudy } from '../../mock/store'
import { pageLabels, paginate, recruits } from '../../lib/derive'
import { RESPONDENT_TAG } from '../../lib/lifecycle'

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
  const [downloads, setDownloads] = useState(params.get('panel') === 'downloads')
  const session = s.type !== 'survey' && s.type !== 'diary'
  const group = s.type === 'group_video_call' || s.type === 'in_person_group'
  const [state, setState] = useState<'booked' | 'applications'>('booked')
  const [status, setStatus] = useState('All')
  const [tier, setTier] = useState('All')
  const [page, setPage] = useState(1)
  const booked = session && state === 'booked'

  const all = recruits(s, 'recruited')
  const applications = all
    .filter((r) => status === 'All' || RESPONDENT_TAG[r.state] === status)
    .filter((r) => tier === 'All' || r.tier === tier.toLowerCase())
  const shownApplications = paginate(applications, page)
  const scheduled = all.filter((r) => r.state === 'scheduled' && r.participation.slot)
  /** The group frames draw ten seats a session. */
  const SEATS = 10
  /** The frame puts Join Now on the session about to start, which is the first. */
  const sessions = Object.values(
    scheduled.reduce<Record<string, { key: string; day: string; time: string; people: typeof scheduled }>>((acc, r) => {
      const slot = r.participation.slot!
      const key = `${slot.day} ${slot.time}`
      acc[key] = acc[key] ?? { key, day: slot.day, time: slot.time, people: [] }
      acc[key].people.push(r)
      return acc
    }, {}),
  )

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
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
                      {g.people.length} / {SEATS} Seats
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <Button variant="secondary" size="none" className="h-[38px] px-4"
                      onClick={() => { setState('applications'); toast(`${g.people.length} booked into this session`) }}
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Participants</Button>
                    <span className="flex -space-x-1.5">
                      {g.people.slice(0, 6).map((r) => (
                        <span key={r.id} className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-bgAlt-2 ring-1 ring-bg-1 text-label text-text-subtitle">
                          {r.name.charAt(0)}
                        </span>
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
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">{r.name}</td>
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-[60px] px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                          <td className="h-[60px] px-[18px] pr-2">
                            <span className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-text-regular text-text-title">
                                {r.participation.slot?.day} <span className="text-text-body">&bull;</span> {r.participation.slot?.time}
                              </span>
                              {i === 0 && (
                                <Button size="none" className="h-[38px] px-4" onClick={() => toast('Joining the call')} leftIcon={<VideoIcon className="h-4 w-4" />}>Join Now</Button>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))
                      : shownApplications.rows.map((r) => (
                        <tr key={r.id} className="border-b-1 border-stroke-input last:border-b-0">
                          <td className="h-row px-[18px] text-text-regular text-text-title">{r.name}</td>
                          <td className="h-row px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-row px-[18px]">
                            <StatusPill status={RESPONDENT_TAG[r.state]} />
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
      <DownloadSessionsPanel open={downloads} onClose={() => setDownloads(false)}
        artefact={s.type === 'group_video_call' ? 'Recordings + Transcript' : 'Notes'} />
    </AppShell>
  )
}
