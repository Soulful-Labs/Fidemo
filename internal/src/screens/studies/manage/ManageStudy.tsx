import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import PanelTabs from '../../../components/app/PanelTabs'
import { platform } from '@shared/store'
import { useManagedStudy } from '../../../mock/manage'
import { TEAM, say } from '../../../platform'
import { CongratsBanner, PausedBanner } from './Banners'
import CompletedStudy from './CompletedStudy'
import ManageTab from './ManageTab'
import MatchedTab from './MatchedTab'
import OverviewTab from './OverviewTab'
import PauseStudy from './PauseStudy'
import PayTab from './PayTab'
import RecruitedTab from './RecruitedTab'
import ResultsTab from './ResultsTab'
import StudyHeader from './StudyHeader'

/** The strip on every managed study. */
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
  const [params, setParams] = useSearchParams()
  const [pausing, setPausing] = useState(false)
  const study = useManagedStudy(id)
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview') as Tab
  /** Paused and completed are the study's own state (shared/store.ts), not the URL. */
  const paused = study.paused
  const congrats = !paused && (study.congrats ?? []).includes(tab)
  const invited = params.get('seg') === 'invited'
  const view = params.get('view') === 'applications' ? 'applications' : 'first'

  const go = (next: { tab?: Tab; invited?: boolean; view?: 'first' | 'applications' }) => {
    const t = next.tab ?? tab
    setParams({
      ...(t !== 'overview' && { tab: t }),
      ...(t === 'matched' && (next.invited ?? (next.tab ? false : invited)) && { seg: 'invited' }),
      ...(t === 'recruited' && (next.view ?? (next.tab ? 'first' : view)) === 'applications' && { view: 'applications' }),
    }, { replace: true })
  }

  if (study.completed || params.get('state') === 'completed') {
    const t = params.get('tab')
    return <CompletedStudy study={study} tab={t === 'results' || t === 'payments' ? t : 'overview'}
      onTab={(k) => setParams({ state: 'completed', ...(k !== 'overview' && { tab: k }) }, { replace: true })} />
  }

  return (
    <AppShell className={study.tight && !paused ? 'flex flex-col gap-3 p-4 pb-6' : 'flex flex-col gap-3 pb-8'}
      crumbs={[{ label: 'Studies', to: '/studies' }, { label: 'Ongoing', to: '/studies?tab=ongoing' }, { label: study.title }]}>
      {congrats && <CongratsBanner />}
      {paused && <PausedBanner onResume={() => platform().moveStudy(study.id, 'recruiting', TEAM)} onComplete={() => { platform().moveStudy(study.id, 'completed', TEAM); setParams({}, { replace: true }) }} />}
      <StudyHeader study={study} onPause={() => setPausing(true)}
        onComplete={() => { if (say(platform().moveStudy(study.id, 'completed', TEAM))) setParams({}, { replace: true }) }} />
      <section className="flex-1 overflow-hidden rounded-lg border-1 border-stroke-1">
        <PanelTabs tabs={TABS} value={tab} onChange={(k) => go({ tab: k as Tab })} />
        <div role="tabpanel" className="p-4">
          {tab === 'overview' && <OverviewTab study={study} paused={paused} />}
          {tab === 'manage' && <ManageTab study={study} />}
          {tab === 'matched' && <MatchedTab study={study} invited={invited} onSegment={(v) => go({ invited: v })} />}
          {tab === 'pay' && <PayTab study={study} />}
          {tab === 'results' && <ResultsTab study={study} />}
          {tab === 'recruited' && <RecruitedTab study={study} view={view} onView={(v) => go({ view: v })} />}
        </div>
      </section>
      <PauseStudy open={pausing} onClose={() => setPausing(false)} onPause={(reason) => { setPausing(false); platform().moveStudy(study.id, 'paused', TEAM, reason) }} />
    </AppShell>
  )
}
