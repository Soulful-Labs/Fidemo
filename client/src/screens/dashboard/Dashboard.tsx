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
import { DASHBOARD_STATS, DASHBOARD_STUDY_IDS, GREETING, RECOMMENDED } from '../../mock/dashboard'
import { ONGOING } from '../../mock/studies'
import RespondentPanel from './RespondentPanel'

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
 * studies and the recommended respondents. Every figure is seeded off the
 * frame; nothing here is calculated.
 */
export default function Dashboard({ empty = false }: { empty?: boolean }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Respondent | null>(null)
  const studies = empty ? [] : DASHBOARD_STUDY_IDS.map((id) => ONGOING.find((s) => s.id === id)!).filter(Boolean)
  const stats = empty ? DASHBOARD_STATS.map((t) => ({ ...t, value: t.label === 'Avg. Session Incentive' ? '$0' : '0' })) : DASHBOARD_STATS

  return (
    <AppShell crumbs={[{ label: 'Dashboard' }]}>
      <div className="min-h-[881px] rounded-lg bg-bgAlt-0 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title-l leading-[31px] text-text-title">{GREETING.title}</h1>
          <p className="text-body-regular text-text-subtitle">{GREETING.sub}</p>
        </div>

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
                study={{
                  id: s.id, title: s.cardName ?? s.name, type: s.type, status: s.status, image: s.image,
                  dates: s.dates ?? '', daysLeft: s.daysLeft ?? '', completedPct: s.completedPct ?? 0,
                  segments: s.segments ?? [s.completedPct ?? 0, 0, 100 - (s.completedPct ?? 0)],
                  required: s.required, breakdown: s.breakdown,
                }} />
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
            {RECOMMENDED.map((r) => (
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
