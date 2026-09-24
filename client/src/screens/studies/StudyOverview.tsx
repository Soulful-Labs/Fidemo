import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { Copy } from '../../components/ui/icons'
import { useParams } from 'react-router-dom'
import { MANAGED_STUDY, MANAGED_SURVEY } from '../../mock/studies'

/** The Overview tiles, in the warm tint the frame draws them in. */
function OverviewTile({ label, value, suffix, ring }: { label: string; value: string; suffix?: string; ring?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-yellow-30 px-4 py-4">
      <div className="flex flex-col">
        <span className="text-text-regular text-text-subtitle">{label}</span>
        <span className="text-title-s text-text-title">
          {value}{suffix && <span className="text-text-regular text-text-subtitle"> {suffix}</span>}
        </span>
      </div>
      {ring != null && (
        <svg viewBox="0 0 36 36" width="44" height="44" aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f2f1" strokeWidth="5" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#fca311" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${(ring / 100) * 97.4} 97.4`} transform="rotate(-90 18 18)" />
        </svg>
      )}
    </div>
  )
}

/**
 * 2.1 Study Overview (1627:95956): how the study is running. Its sibling tab,
 * Manage Study, holds what the study is; this one holds how it is going.
 */
export default function StudyOverview() {
  const { id } = useParams()
  const s = id === MANAGED_SURVEY.id ? MANAGED_SURVEY : MANAGED_STUDY

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="overview">
        <div className="flex flex-col gap-6 px-4 pt-4">
          <div className="grid grid-cols-4 gap-2">
            <OverviewTile label="Progress" value={s.progress} ring={66} />
            <OverviewTile label="Completed" value={s.completed} suffix={s.completedOf} />
            <OverviewTile label="Qualified" value={s.qualified} suffix={s.qualifiedOf} />
            <OverviewTile label="Days Remaining" value={s.daysRemaining} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Study Description</span>
            <p className="text-body-regular text-text-title">{s.description}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Share Link</span>
            <div className="flex items-center gap-3">
              <span className="flex h-input flex-1 items-center rounded-sm border-1 border-stroke-input bg-bg-1 px-3 text-body-regular text-text-subtitle">
                {s.shareLink}
              </span>
              <Button variant="tertiary" className="px-5" leftIcon={<Copy className="h-4 w-4" />}
                onClick={() => void navigator.clipboard?.writeText(s.shareLink).catch(() => undefined)}>
                Copy
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">Active Since</span>
            <p className="text-body-regular text-text-title">{s.activeSince}</p>
          </div>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
