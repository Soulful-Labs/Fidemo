import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell, { ViewAll } from '../../app/AppShell'
import { SectionHead } from '../../components/client/PageHead'
import StudyCard from '../../components/client/StudyCard'
import RespondentCard from '../../components/client/RespondentCard'
import type { Respondent } from '../../components/client/RespondentCard'
import StatTile from '../../components/client/StatTile'
import Button from '../../components/ui/Button'
import { CheckCircle, Clock, DollarCircle, ShieldIcon, UsersIcon } from '../../components/ui/icons'
import { DASHBOARD_STUDY_IDS, GREETING, RECOMMENDED } from '../../mock/dashboard'
import RespondentPanel from './RespondentPanel'
import { useStudies } from '../../mock/store'
import { billing, dashboardStats, rankedPool, unpaidStudies } from '../../lib/derive'
import { studyTab } from '../../lib/lifecycle'
import { scoreOf, tierOf } from '../../mock/db'

const TILE_ICON = [Clock, CheckCircle, UsersIcon, ShieldIcon, DollarCircle]

/**
 * The no-studies state. Figma draws no empty dashboard (826:86322 is a hidden
 * older copy of the populated one), so this keeps the frame's own chrome and
 * says plainly that there is nothing yet. Stage two replaces it if a frame
 * appears.
 */
function Blank({ line, cta, onClick }: { line: string; cta: string; onClick: () => void }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-3 rounded-lg border-1 border-stroke-1 bg-bg-1 px-4 py-10">
      <p className="text-text-regular text-text-subtitle">{line}</p>
      <Button size="row" onClick={onClick}>{cta}</Button>
    </div>
  )
}

/**
 * Dashboard (826:85021): the greeting, five figures, the three ongoing
 * studies and the recommended respondents. Every figure is counted off the
 * study list; the frame's own 4 / 72 / 1,786 / 91 / $124.8 were literals
 * that no other screen agreed with.
 */
export default function Dashboard({ empty = false }: { empty?: boolean }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Respondent | null>(null)
  const { studies: all } = useStudies()
  const live = empty ? [] : all.filter((s) => studyTab(s.state) === 'ongoing')
  /** The frame puts these three first; the rest follow in their own order. */
  const studies = DASHBOARD_STUDY_IDS
    .map((id) => live.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .concat(live.filter((s) => !DASHBOARD_STUDY_IDS.includes(s.id)))
    .slice(0, 3)
  /** Step 53: "The client's screen shows a red alert on login while incentives are unpaid." */
  const unpaid = empty ? [] : unpaidStudies(all)
  const owed = unpaid.reduce((n, st) => n + billing(st).net, 0)
  const d = dashboardStats(empty ? [] : all)
  /**
   * Step 24: the pool ranked by score and tier. The frame's own nine cards,
   * with their scores and tiers derived from the policy rather than printed.
   */
  const pool = rankedPool()
  const recommended = RECOMMENDED.map((r) => {
    const p = pool.find((x) => x.id === r.id)
    return p ? { ...r, score: scoreOf(p), tier: tierOf(p) } : r
  })
  const stats = [
    { label: 'Ongoing Studies', value: String(d.ongoing), tint: 'yellow' as const },
    { label: 'Completed Studies', value: String(d.completed), tint: 'yellow' as const },
    { label: 'Total Respondents Hired', value: d.hired.toLocaleString('en-US'), tint: 'green' as const },
    { label: 'Avg. Trust Score', value: String(d.avgScore), tint: 'purple' as const },
    { label: 'Avg. Session Incentive', value: `$${d.avgIncentive % 1 === 0 ? d.avgIncentive : d.avgIncentive.toFixed(1)}`, tint: 'blue' as const },
  ]

  return (
    <AppShell crumbs={[{ label: 'Dashboard' }]}>
      <div className="min-h-[881px] rounded-lg bg-bgAlt-0 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title-l leading-[31px] text-text-title">{GREETING.title}</h1>
          <p className="text-body-regular text-text-subtitle">{GREETING.sub}</p>
        </div>

        {unpaid.length > 0 && (
          /* No frame draws this banner. Workflow step 53 requires it. */
          <button type="button" onClick={() => navigate(`/studies/${unpaid[0].id}/pay`)}
            className="mt-6 flex w-full items-center gap-3 rounded-md border-1 border-[#ffd1c7] bg-[#fff0ed] px-4 py-3 text-left">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#e33a38]" />
            <span className="flex-1 text-body-medium text-text-title">
              ${owed.toLocaleString('en-US')} of participant incentives is unpaid
              <span className="text-text-regular text-text-subtitle">
                {' '}across {unpaid.length} completed {unpaid.length === 1 ? 'study' : 'studies'}
              </span>
            </span>
            <span className="text-body-medium text-[#e33a38]">Settle now</span>
          </button>
        )}

        <div className="grid grid-cols-5 gap-3 pt-6">
          {stats.map((t, i) => {
            const Icon = TILE_ICON[i]
            return <StatTile key={t.label} label={t.label} value={t.value} tint={t.tint} icon={<Icon className="h-6 w-6" />} />
          })}
        </div>

        <section className="pt-6">
          <SectionHead title="Ongoing Studies" action={<ViewAll to="/studies" />} />
          {studies.length === 0 ? (
            <Blank line="No ongoing studies yet." cta="Create Study" onClick={() => navigate('/studies/create/about')} />
          ) : (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {studies.map((s) => (
              <StudyCard key={s.id} onOpen={() => navigate(`/studies/${s.id}`)} onMenu={() => navigate('/studies')}
                study={s} />
            ))}
          </div>
          )}
        </section>

        <section className="pt-[25px]">
          <SectionHead title="Recommended Respondents" action={<ViewAll to="/pool" />} />
          {empty ? (
            <Blank line="Recommendations appear once your first study is live." cta="Browse the pool" onClick={() => navigate('/pool')} />
          ) : (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {recommended.map((r) => (
              <RespondentCard key={r.id} respondent={r} saveable onView={() => setProfile(r)} />
            ))}
          </div>
          )}
        </section>
      </div>

      <RespondentPanel open={profile !== null} onClose={() => setProfile(null)} respondent={profile} />
    </AppShell>
  )
}
