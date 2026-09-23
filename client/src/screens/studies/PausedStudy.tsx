import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Tag from '../../components/ui/Tag'
import { Clock, Copy, LinkIcon, MoreVertical } from '../../components/ui/icons'
import { PAUSED_STUDY } from '../../mock/studies'

/** The four figures under the title on the study header (1704:143783). */
function HeadStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="text-title-s text-text-title">
        {value}{suffix && <span className="text-text-regular text-text-subtitle"> {suffix}</span>}
      </span>
    </div>
  )
}

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
 * Paused Study, Study Details (1704:143783): the pink paused banner above the
 * study header, then the study tabs with Overview selected. The tabs after
 * Overview are drawn greyed while a study is paused.
 */
export default function PausedStudy() {
  const navigate = useNavigate()
  const { id = PAUSED_STUDY.id } = useParams()
  const s = PAUSED_STUDY

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <div className="min-h-[890px] rounded-lg bg-bg-0 px-4 pb-4 pt-[25px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-6 rounded-lg border-1 border-[#ffd1c7] bg-[#fff0ed] px-4 py-4">
          <div className="flex flex-col gap-1">
            <p className="text-body-medium text-text-title">You have paused this study to recruit new participants further.</p>
            <p className="text-text-regular text-text-subtitle">This study is paused now to get new participations. You can resume it back or mark completed.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="secondary" className="h-9 px-3">Mark as completed</Button>
            <Button className="h-9 px-3" onClick={() => navigate(`/studies/${id}`)}>Resume Study</Button>
          </div>
        </div>

        <section className="rounded-lg bg-bgAlt-1 p-4">
          <div className="flex items-start gap-6">
            <span className="h-[182px] w-[240px] shrink-0 overflow-hidden rounded-md bg-bg-2">
              <img src={s.image} alt="" className="h-full w-full object-cover" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <StudyTypeTag type={s.type} className="h-8" />
                <div className="flex items-center gap-2">
                  <Tag tone="neutral">{s.status}</Tag>
                  <button type="button" aria-label="Copy study link"
                    className="flex h-btn w-btn items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Study options"
                    className="flex h-btn w-btn items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-title-l text-text-title">{s.title}</h1>
              <div className="flex items-center gap-2">
                <Tag tone="neutral" icon={<Clock className="h-4 w-4" />}>{s.duration}</Tag>
                <Tag tone="neutral">{s.industry}</Tag>
              </div>

              <div className="grid grid-cols-[repeat(4,158px)] gap-6">
                <HeadStat label="Completed" value={s.completed} suffix={s.completedOf} />
                <HeadStat label="Qualified" value={s.qualified} suffix={s.qualifiedOf} />
                <HeadStat label="Days Remaining" value={s.daysRemaining} />
                <HeadStat label="Progress" value={s.progress} />
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-[520px]">
          <Tabs className="h-[45px] rounded-t-lg bg-bg-1 px-4" value="overview"
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'manage', label: 'Manage Study', muted: true },
              { key: 'matched', label: 'Matched', muted: true },
              { key: 'recruited', label: 'Recruited', muted: true },
              { key: 'results', label: 'Results', muted: true },
              { key: 'pay', label: 'Pay', muted: true },
            ]} />

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
        </section>
      </div>
      </div>
    </AppShell>
  )
}
