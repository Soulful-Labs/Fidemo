import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import PanelTabs from '../../../components/app/PanelTabs'
import { MANAGED } from '../../../mock/manage'
import { CongratsBanner, PausedBanner } from './Banners'
import ManageTab from './ManageTab'
import MatchedTab from './MatchedTab'
import OverviewTab from './OverviewTab'
import PauseStudy from './PauseStudy'
import RecruitedTab from './RecruitedTab'
import StudyHeader from './StudyHeader'

/** The strip on every managed study. Results is turn 7, Pay turn 8. */
const TABS = [
  { key: 'overview', label: 'Overview', width: 'w-[101px]' },
  { key: 'manage', label: 'Manage Study', width: 'w-[139px]' },
  { key: 'matched', label: 'Matched', width: 'w-[97px]' },
  { key: 'recruited', label: 'Recruited', width: 'w-[104px]' },
  { key: 'results', label: 'Results', width: 'w-[88px]' },
  { key: 'pay', label: 'Pay', width: 'w-[60px]' },
] as const
type Tab = (typeof TABS)[number]['key']

/**
 * A managed study (`/studies/:id`, `?tab=manage`, `?state=paused`): one screen
 * for all six study types. The frames (1952:76685 and its five siblings) draw
 * a banner where one applies, the study header, then a panel with six tabs
 * that fills the window. The type changes the header's tag and the Study
 * block's summary; the rest is the study's own content.
 *
 * Built as drawn: the video 1:1 frames sit 16 inside the shell, every other
 * frame 24; and "Congrats!" shows on the tabs whose frames draw it.
 */
export default function ManageStudy() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [pausing, setPausing] = useState(false)
  const study = MANAGED.find((s) => s.id === id) ?? MANAGED[0]!
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview') as Tab
  const paused = params.get('state') === 'paused'
  const congrats = !paused && (study.congrats ?? []).includes(tab)
  const invited = params.get('seg') === 'invited'
  const view = params.get('view') === 'applications' ? 'applications' : 'first'

  const go = (next: { tab?: Tab; paused?: boolean; invited?: boolean; view?: 'first' | 'applications' }) => {
    const t = next.tab ?? tab
    const p = next.paused ?? paused
    setParams({
      ...(t !== 'overview' && { tab: t }), ...(p && { state: 'paused' }),
      ...(t === 'matched' && (next.invited ?? (next.tab ? false : invited)) && { seg: 'invited' }),
      ...(t === 'recruited' && (next.view ?? (next.tab ? 'first' : view)) === 'applications' && { view: 'applications' }),
    }, { replace: true })
  }

  return (
    <AppShell className={study.tight && !paused ? 'flex flex-col gap-3 p-4 pb-6' : 'flex flex-col gap-3 pb-8'}
      crumbs={[{ label: 'Studies', to: '/studies' }, { label: 'Ongoing', to: '/studies?tab=ongoing' }, { label: study.title }]}>
      {congrats && <CongratsBanner />}
      {paused && <PausedBanner onResume={() => go({ paused: false })} onComplete={() => navigate('/studies?tab=completed')} />}
      <StudyHeader study={study} onPause={() => setPausing(true)} />
      <section className="flex-1 overflow-hidden rounded-lg border-1 border-stroke-1">
        <PanelTabs tabs={TABS} value={tab} onChange={(k) => go({ tab: k as Tab })} />
        <div role="tabpanel" className="p-4">
          {tab === 'overview' && <OverviewTab study={study} paused={paused} />}
          {tab === 'manage' && <ManageTab study={study} />}
          {tab === 'matched' && <MatchedTab study={study} invited={invited} onSegment={(v) => go({ invited: v })} />}
          {tab === 'recruited' && <RecruitedTab study={study} view={view} onView={(v) => go({ view: v })} />}
        </div>
      </section>
      <PauseStudy open={pausing} onClose={() => setPausing(false)} onPause={() => { setPausing(false); go({ paused: true }) }} />
    </AppShell>
  )
}
