import { personById, studyById, studyReportView } from '@shared/derive'
import type { ReportRound } from '@shared/derive'
import { clockTime, dayMonthYear } from '@shared/format'
import { platform } from '@shared/store'
import type { StudyReport } from '@shared/types'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import Button from '../../../components/ui/Button'
import { SupportIcon, VerifiedIcon } from '../../../components/ui/icons'
import Table from '../../../components/ui/Table'
import { Avatar } from '../../../components/ui/Tag'
import { photoFor } from '../../../mock/participants'
import { TEAM, say, usePlatform } from '../../../platform'
import ReportRail from './ReportRail'
import ResolveDialogs from './ResolveDialogs'
import RespondentProfile from '../manage/RespondentProfile'
import { InviteToStudy } from '../../participants/panels'

const when = (iso: string) => `${dayMonthYear(iso)}  •  ${clockTime(iso)}`

/** Total Reports and Most Reason, side by side. */
const Summary = ({ round, className = '' }: { round: ReportRound; className?: string }) => (
  <div className={`grid grid-cols-2 ${className}`}>
    <div className="flex flex-col gap-1 px-4 py-3"><span className="text-text-regular text-text-subtitle">Total Reports</span><span className="text-body-medium text-text-title">{round.total}</span></div>
    <div className="flex flex-col gap-1 border-l-1 border-stroke-input px-4 py-3"><span className="text-text-regular text-text-subtitle">Most Reason</span><span className="text-body-medium text-text-title">{round.mostReason}</span></div>
  </div>
)

function Reports({ reports }: { reports: StudyReport[] }) {
  const state = usePlatform()
  /** A reporter's name opens their profile in a pop-up (22 Oct 2026), on Pending and History alike. */
  const [viewing, setViewing] = useState<string | undefined>()
  const [inviting, setInviting] = useState<string | undefined>()
  return (
    <>
    <RespondentProfile personId={viewing} invited={false} onClose={() => setViewing(undefined)} onInvite={() => { setInviting(viewing); setViewing(undefined) }} />
    <InviteToStudy open={!!inviting} personId={inviting} onClose={() => setInviting(undefined)} />
    <Table rowHeight={52} rows={reports} rowKey={(r) => r.id} columns={[
      { key: 'name', header: 'Name', width: 200, render: (r) => { const p = personById(state, r.personId); return <span className="flex items-center gap-2">{p && <Avatar src={photoFor(p)} name={p.name} size={24} />}{p ? <button type="button" onClick={(e) => { e.stopPropagation(); setViewing(p.id) }} className="text-left hover:text-brand-primary hover:underline">{p.name}</button> : ''}</span> } },
      { key: 'reason', header: 'Reason', width: '1fr', render: (r) => <span className="block truncate" title={r.detail}>{r.reason}</span> },
      { key: 'at', header: 'Reported On', width: 220, render: (r) => when(r.at) },
    ]} />
    </>
  )
}

/**
 * A reported study (2317:156640 pending, 2314:147794 one round,
 * 2314:147851 history): the open reports with Chat With Client and Mark
 * Reports Resolved, then every resolved round with its statement. The rail
 * shows the study and its client. History opens on the resolved rounds only.
 */
export default function ReportedStudy() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const history = params.get('tab') === 'history'
  const nav = useNavigate()
  const state = usePlatform()
  const study = studyById(state, id)!
  const view = studyReportView(state, id)
  const [resolving, setResolving] = useState(false)
  const chat = () => { const res = platform().chatAboutReports(id, TEAM); if (say(res) && res.ok) nav(`/support/${res.id}`) }

  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Reported Studies', to: '/studies/reported' }, { label: history ? 'History' : 'Pending', to: history ? '/studies/reported?tab=history' : '/studies/reported' }, { label: study.title }]}>
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {!history && (
            <section className="flex flex-col gap-3">
              <h2 className="text-title-s text-text-title">Reports</h2>
              {view.open.total > 0 ? (
                <>
                  <div className="overflow-hidden rounded-lg bg-yellow-30">
                    <Summary round={view.open} className="border-b-1 border-stroke-input" />
                    <div className="flex gap-4 px-4 py-4">
                      <Button size="md" leftIcon={<SupportIcon className="h-4 w-4" />} onClick={chat}>Chat With Client</Button>
                      <Button variant="tertiary" size="md" className="text-state-success!" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={() => setResolving(true)}>Mark Reports Resolved</Button>
                    </div>
                  </div>
                  <Reports reports={view.open.reports} />
                </>
              ) : <p className="text-text-regular text-text-subtitle">This study has no open reports.</p>}
            </section>
          )}
          {view.resolved.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-title-s text-text-title">Reports History</h2>
              {view.resolved.map((r) => (
                <div key={r.resolution.id} className="overflow-hidden rounded-lg border-1 border-stroke-1">
                  <div className="flex items-start justify-between gap-4 bg-bg-1 px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-text-regular text-text-subtitle">Resolved Remark Statement</span>
                      <p className="text-body-regular text-text-title">{r.resolution.statement}</p>
                      <span className="pt-2 text-text-regular text-text-subtitle">Resolved Date</span>
                      <span className="text-text-regular text-text-title">{when(r.resolution.at)}</span>
                    </div>
                    <Button variant="tertiary" size="md" className="shrink-0" leftIcon={<SupportIcon className="h-4 w-4" />} onClick={() => {
                      const res = platform().reportRoundTicket(id, r.resolution.id, TEAM)
                      if (say(res) && res.ok) nav(`/support/${res.id}`)
                    }}>View Support Ticket</Button>
                  </div>
                  <Summary round={r} />
                  <div className="px-4 pb-4"><Reports reports={r.reports} /></div>
                </div>
              ))}
            </section>
          )}
          {history && view.resolved.length === 0 && <p className="text-text-regular text-text-subtitle">No reports on this study have been resolved yet.</p>}
        </div>
        <ReportRail study={study} />
      </div>
      <ResolveDialogs open={resolving} onClose={() => setResolving(false)} studyId={id} title={study.title} />
    </AppShell>
  )
}
