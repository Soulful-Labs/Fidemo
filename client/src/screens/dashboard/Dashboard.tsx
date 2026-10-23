import { useNewStudy } from '../create/useNewStudy'
import { useRef, useState } from 'react'
import { money } from '@shared/format'
import { useNavigate } from 'react-router-dom'
import AppShell, { ViewAll } from '../../app/AppShell'
import RespondentCard from '../../components/client/RespondentCard'
import type { Respondent } from '../../components/client/RespondentCard'
import StatTile from '../../components/client/StatTile'
import Button from '../../components/ui/Button'
import { ChevronRight, Clock, DollarCircle, ShieldIcon, UsersIcon } from '../../components/ui/icons'
import { DASHBOARD_STUDY_IDS } from '../../mock/dashboard'
import { useOpenProfile } from '../../app/ProfileHost'
import { NeedRow, StepArrow, StudyCarousel, usePerRow } from './DashboardParts'
import { InvitePanel } from '../pool/PoolPanels'
import { SentModal } from '../pool/PoolModals'
import { useStudies } from '../../platform'
import { useSession } from '../../mock/session'
import { counts, dashboardStats, rankedPool } from '@shared/derive'
import { isLive, studyTab } from '@shared/lifecycle'
import { attention, upcomingSessions } from '../../lib/insight'
import { STUDY_TYPE } from '../../lib/studyTypes'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="m10.5 4 1.9 4.6L17 10.5l-4.6 1.9L10.5 17l-1.9-4.6L4 10.5l4.6-1.9L10.5 4Zm8 9.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

/** A section that has nothing in it yet says so in the card it would fill. */
function Blank({ line, cta, onClick }: { line: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <p className="text-text-regular text-text-subtitle">{line}</p>
      {cta && <Button size="row" onClick={onClick}>{cta}</Button>}
    </div>
  )
}

const greeting = (now: Date = new Date()) => (now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening')

/**
 * Dashboard, as redrawn in the 13 Oct 2026 export: four figures, the next
 * sessions, an insight, what needs the client's attention, the ongoing
 * studies and the recommended respondents. Every figure, session, insight and
 * attention row is counted off the study list (lib/insight.ts, shared/derive);
 * a card with nothing behind it says so.
 */
export default function Dashboard({ empty = false }: { empty?: boolean }) {
  const newStudy = useNewStudy()
  const navigate = useNavigate()
  const openProfile = useOpenProfile()
  const [inviting, setInviting] = useState<Respondent | null>(null)
  const [sent, setSent] = useState<{ name?: string; study: string } | null>(null)
  const [insightAt, setInsightAt] = useState(0)
  /** Recommended Respondents: one row, three cards at least and more on wider screens (22 Oct 2026). */
  const recRow = useRef<HTMLDivElement>(null)
  const perRow = usePerRow(recRow)
  const { studies: every, state: world } = useStudies()
  const { account } = useSession()
  const all = empty ? [] : every
  const live = all.filter((s) => studyTab(s.state) === 'ongoing')
  /** The frame puts these three first; the rest follow in their own order. */
  const studies = DASHBOARD_STUDY_IDS
    .map((id) => live.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .concat(live.filter((s) => !DASHBOARD_STUDY_IDS.includes(s.id)))
  const d = dashboardStats(world, all)
  const toHire = all.filter((s) => isLive(s.state)).reduce((n, s) => n + Math.max(0, s.required - counts(s).delivered), 0)
  /** Two here; View All opens the Scheduled Sessions tab with the rest. */
  const sessions = upcomingSessions(world, all).slice(0, 2)
  const needs = attention(world, all)
  const insight = needs[Math.min(insightAt, needs.length - 1)]
  /** Step 24: the pool ranked by score and tier. */
  const recommended: Respondent[] = empty ? [] : rankedPool(world).slice(0, 9)
  const stats = [
    { label: 'Ongoing Studies', value: String(d.ongoing), tint: 'yellow' as const, Icon: Clock },
    { label: 'Remaining To Hire', value: toHire.toLocaleString('en-US'), tint: 'green' as const, Icon: UsersIcon },
    { label: 'Avg. Trust Score', value: d.avgScore ? String(d.avgScore) : '—', tint: 'purple' as const, Icon: ShieldIcon },
    { label: 'Avg. Session Incentive', value: money(d.avgIncentive), tint: 'blue' as const, Icon: DollarCircle },
  ]
  const today = new Date().toDateString()

  return (
    <AppShell heading={`${greeting()}, ${(account?.name ?? 'there').split(' ')[0]}!`} crumbs={[{ label: 'Dashboard' }]}>
      <div className="min-h-[881px] rounded-lg bg-bgAlt-0 p-4">
        {/* Three equal columns (22 Oct 2026): the figures and Upcoming Sessions / Super Insights take two, Needs Your
            Attention the third, so the three cards in that row are the same width and none moves. */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex min-w-0 flex-col gap-6">
            <div className="grid grid-cols-4 gap-3">
              {stats.map((t) => <StatTile key={t.label} label={t.label} value={t.value} tint={t.tint} icon={<t.Icon className="h-6 w-6" />} />)}
            </div>

            <div className="grid h-[292px] grid-cols-2 gap-4">
              <section className="flex flex-col rounded-lg border-1 border-stroke-1 px-4 pt-4">
                <div className="flex items-center justify-between pb-[5px]">
                  <h2 className="text-body-medium text-text-title">Upcoming Sessions</h2>
                  <ViewAll to="/studies/sessions" />
                </div>
                {sessions.length === 0 && <Blank line="No sessions are booked yet." />}
                {sessions.map((r) => (
                  <button key={r.key} type="button" onClick={() => navigate(r.details)}
                    className="flex h-[59px] items-center gap-0 border-t-1 border-stroke-1 text-left first-of-type:border-t-0">
                    <span className="flex w-[76px] shrink-0 flex-col gap-0.5 text-text-medium text-text-title">
                      <span>{r.at.toDateString() === today ? 'Today' : r.at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{r.at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-text-regular text-text-title"><span className="truncate">{r.title}</span><ChevronRight className="h-4 w-4 shrink-0" /></span>
                      <span className="truncate text-text-regular text-text-body">{STUDY_TYPE[r.type].label}<span className="px-2">&bull;</span>{r.study}</span>
                    </span>
                  </button>
                ))}
              </section>

              <section className="flex flex-col rounded-lg bg-gradient-to-b from-green-50 to-bgAlt-1 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-body-medium text-brand-secondary">{SPARKLE}Super Insights</h2>
                  <span className="flex items-center gap-1.5">
                    <StepArrow dir={-1} label="Previous insight" disabled={insightAt <= 0} onClick={() => setInsightAt(insightAt - 1)} />
                    <StepArrow dir={1} label="Next insight" disabled={insightAt + 1 >= needs.length} onClick={() => setInsightAt(insightAt + 1)} />
                  </span>
                </div>
                {insight ? (
                  <>
                    <p className="pt-[19px] text-title-s leading-[25px] text-text-title">{insight.headline}</p>
                    <p className="pt-[11px] text-body-regular text-text-subtitle">{insight.body}</p>
                    <span className="pt-[14px]">
                      <Button variant="secondary" size="row" className="px-3" onClick={() => navigate(insight.to)}
                        rightIcon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}>
                        {insight.cta}
                      </Button>
                    </span>
                  </>
                ) : <Blank line="Nothing stands out right now. Insights appear as your studies run." />}
              </section>
            </div>
          </div>

          <section className="flex h-[400px] min-w-0 flex-col rounded-lg border-1 border-stroke-1 bg-gradient-to-b from-yellow-30 to-transparent to-40% px-4 pt-[17px]">
            <h2 className="flex items-center gap-2.5 pb-[10px] pl-1 text-body-medium text-text-title">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-100"><span className="h-2 w-2 rounded-full bg-cta-primary" /></span>
              Needs Your Attention
            </h2>
            {needs.length === 0 && <Blank line="Nothing needs you right now." />}
            {needs.slice(0, 3).map((n) => <NeedRow key={n.key} n={n} />)}
          </section>
        </div>

        <section className="pt-[25px]">
          {studies.length === 0 ? (
            <>
              <div className="flex items-center justify-between pb-2.5"><h2 className="text-body-medium text-text-title">Ongoing Studies</h2><ViewAll to="/studies" /></div>
              <div className="flex rounded-lg border-1 border-stroke-1 bg-bg-1"><Blank line="No ongoing studies yet." cta="Create Study" onClick={newStudy} /></div>
            </>
          ) : (
            <StudyCarousel studies={studies} head={(arrows) => (
              <div className="flex items-center justify-between gap-4 pb-2.5">
                <h2 className="text-body-medium text-text-title">Ongoing Studies</h2>
                <span className="flex items-center gap-4">{arrows}<ViewAll to="/studies" /></span>
              </div>
            )} />
          )}
        </section>

        <section className="pt-[26px]">
          <div className="flex items-center justify-between pb-2.5">
            <h2 className="text-body-large text-text-title">Recommended Respondents</h2>
            <ViewAll to="/pool" />
          </div>
          {recommended.length === 0 ? (
            <div className="flex rounded-lg border-1 border-stroke-1 bg-bg-1"><Blank line="Recommendations appear once your first study is live." cta="Browse the pool" onClick={() => navigate('/pool')} /></div>
          ) : (
            <div ref={recRow} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))` }}>
              {recommended.slice(0, perRow).map((r) => <RespondentCard key={r.id} respondent={r} onView={() => openProfile(r.id)} onInvite={() => setInviting(r)} />)}
            </div>
          )}
        </section>
      </div>

      <InvitePanel open={inviting !== null} name={inviting?.name.split(' ')[0]} personId={inviting?.id} onClose={() => setInviting(null)}
        onSent={(study) => { setSent({ name: inviting?.name.split(' ')[0], study }); setInviting(null) }} />
      <SentModal open={sent !== null} name={sent?.name} study={sent?.study} onClose={() => setSent(null)} />
    </AppShell>
  )
}
