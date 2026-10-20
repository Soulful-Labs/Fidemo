import { useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { useStudyActions } from '../../components/client/StudyActions'
import { useStudy } from '../../platform'
import { OverviewBody } from './StudyOverview'

/**
 * Paused Study, Study Details (19 Oct 2026 export, replacing 1704:143783):
 * the pink paused banner above the study header, then the same Overview body
 * a running study has. Mark as completed asks first (Stop and Mark Study
 * Completed?), and Resume Study asks Re-Publish to recruit more?.
 */
export default function PausedStudy() {
  const { id = 'st-goal' } = useParams()
  const s = useStudy(id)
  const { act, dialogs } = useStudyActions(s)

  return (
    <AppShell hideCreate crumbs={[{ label: 'My Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="overview" muted minH="min-h-[1014px]" bodyMinH="min-h-[660px]" banner={
        <div className="flex items-center justify-between gap-6 rounded-lg border-1 border-[#ffd1c7] bg-[#fff0ed] px-4 py-4">
          <div className="flex flex-col gap-1">
            <p className="text-body-medium text-text-title">You have paused this study with stopping recruit new participants further.</p>
            <p className="text-text-regular text-text-subtitle">This study is paused now to get new participations. You can resume it back or mark completed.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="secondary" size="none" className="h-9 px-3" onClick={act.stop}>Mark as completed</Button>
            <Button size="none" className="h-9 px-3" onClick={act.resume}>Resume Study</Button>
          </div>
        </div>
      }>
        <OverviewBody s={s} daysRow />
      </StudyFrame>
      {dialogs}
    </AppShell>
  )
}
