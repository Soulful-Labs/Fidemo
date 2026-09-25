import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { Copy } from '../../components/ui/icons'
import { useParams } from 'react-router-dom'
import { useStudy } from '../../mock/store'
import { counts, progressPct } from '../../lib/derive'

/** The Overview tiles, in the warm tint the frame draws them in. */
export function OverviewTile({ label, value, suffix, ring }: { label: string; value: string; suffix?: string; ring?: number }) {
  return (
    /* 1643:125424: a 77px tile, which is 12px of padding around the 53px
       label-and-figure block, not the 16 it was drawn with. */
    <div className="flex items-center justify-between gap-3 rounded-md bg-yellow-30 p-3">
      {/* 1643:125425: a 20px label box, a 2px gap, then a 31px box with a
          24px figure and a 16px suffix on the same baseline. */}
      <div className="flex flex-col gap-0.5">
        <span className="text-text-regular text-text-subtitle">{label}</span>
        <span className="flex items-baseline gap-1 text-title-l text-text-title">
          {value}{suffix && <span className="text-body-regular text-text-subtitle">{suffix}</span>}
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
  const s = useStudy(id)
  const c = counts(s)
  const pct = progressPct(s)

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="overview">
        <div className="flex flex-col gap-6 px-4 pt-4">
          <div className="grid grid-cols-4 gap-2">
            <OverviewTile label="Progress" value={`${pct}%`} ring={pct} />
            <OverviewTile label="Completed" value={String(c.completed)} suffix={`/${s.required}`} />
            <OverviewTile label="Qualified" value={String(c.everQualified)} suffix={`/${c.everApplied} applied`} />
            <OverviewTile label="Days Remaining" value={String(s.daysRemaining)} />
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
                onClick={() => void navigator.clipboard?.writeText(s.shareLink ?? '').catch(() => undefined)}>
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
