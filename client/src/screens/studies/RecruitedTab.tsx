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
import { APPLICATIONS, GROUP_SESSIONS, SCHEDULED } from '../../mock/recruiting'
import { managedStudy } from '../../mock/studies'

/**
 * Recruited (1627:96535). The study type changes what this tab is: a survey
 * or diary lists applications; an individual session study adds a Scheduled
 * table with the booked slot (1627:101612); a group session study lists the
 * sessions themselves (1627:104269).
 */
export default function RecruitedTab() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = managedStudy(id)
  const [downloads, setDownloads] = useState(params.get('panel') === 'downloads')
  const session = s.type !== 'survey' && s.type !== 'diary'
  const group = s.type === 'group_video_call' || s.type === 'in_person_group'
  const [state, setState] = useState<'booked' | 'applications'>('booked')
  const booked = session && state === 'booked'

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
              <Tabs variant="segmented" value={state} onChange={(k) => setState(k as 'booked' | 'applications')}
                items={[{ key: 'booked', label: group ? 'Sessions' : 'Scheduled' }, { key: 'applications', label: 'Applications' }]} />
            ) : <span />}
            <div className="flex items-center gap-3">
              <Select value="Status: All" h="h-[38px]" className="w-[156px] text-text-regular" />
              <Select value="Tier: All" h="h-[38px]" className="w-[156px] text-text-regular" />
            </div>
          </div>

          {group && booked ? (
            <div className="flex flex-col gap-2 pt-3">
              {GROUP_SESSIONS.map((g) => (
                <div key={g.title} className="flex justify-between gap-4 rounded-lg bg-bg-1 p-4">
                  <div className="flex flex-col gap-3.5">
                    <p className="text-title-s leading-[22px] text-text-title">{g.title}</p>
                    <p className="flex h-5 items-center gap-2 text-text-regular text-text-title">
                      <Calendar className="h-4 w-4 text-brand-primary" />{g.day}
                    </p>
                    <p className="flex h-5 items-center gap-2 text-text-regular text-text-title">
                      <Clock className="h-4 w-4 text-brand-primary" />{g.time}
                    </p>
                    <span className="inline-flex h-7 items-center self-start rounded-full bg-bgAlt-2 px-3 text-text-regular text-text-title">
                      {g.seats}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <Button variant="secondary" size="none" className="h-[38px] px-4"
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Participants</Button>
                    <span className="flex -space-x-1.5">
                      {g.participants.map((a, i) => (
                        <span key={i} className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-bgAlt-2 ring-1 ring-bg-1 text-label text-text-subtitle">{a}</span>
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
                      ? SCHEDULED.map((r, i) => (
                        <tr key={i} className="border-b-1 border-stroke-input last:border-b-0">
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">{r.name}</td>
                          <td className="h-[60px] px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-[60px] px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                          <td className="h-[60px] px-[18px] pr-2">
                            <span className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-text-regular text-text-title">
                                {r.day} <span className="text-text-body">&bull;</span> {r.time}
                              </span>
                              {r.joinable && (
                                <Button size="none" className="h-[38px] px-4" leftIcon={<VideoIcon className="h-4 w-4" />}>Join Now</Button>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))
                      : APPLICATIONS.map((r, i) => (
                        <tr key={i} className="border-b-1 border-stroke-input last:border-b-0">
                          <td className="h-row px-[18px] text-text-regular text-text-title">{r.name}</td>
                          <td className="h-row px-[18px] text-text-regular text-text-title">{r.role}</td>
                          <td className="h-row px-[18px]">
                            <StatusPill status={r.status} />
                          </td>
                          <td className="h-row px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </div>
          )}
        </div>
      </StudyFrame>
      <DownloadSessionsPanel open={downloads} onClose={() => setDownloads(false)}
        artefact={s.type === 'group_video_call' ? 'Recordings + Transcript' : 'Notes'} />
    </AppShell>
  )
}
