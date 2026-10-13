import AppShell from '../../app/AppShell'
import { StudyFrame } from '../../components/client/StudyFrame'
import { useParams } from 'react-router-dom'
import { useStudies, useStudy } from '../../platform'
import { averageScore, counts, progressPct } from '@shared/derive'
import { money } from '@shared/format'
import { cn } from '../../lib/cn'
import { paceOf } from '../../lib/insight'

/** The Overview tiles of the paused study (1704:143783), in the warm tint that frame draws them in. */
export function OverviewTile({ label, value, suffix, ring }: { label: string; value: string; suffix?: string; ring?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-yellow-30 p-3">
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

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="m10.5 4 1.9 4.6L17 10.5l-4.6 1.9L10.5 17l-1.9-4.6L4 10.5l4.6-1.9L10.5 4Zm8 9.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
/** One step of the funnel: its count on its own block, each block shorter than the last. */
function Funnel({ steps }: { steps: number[] }) {
  const BLOCK = ['h-[126px] bg-cta-secondary', 'h-[94px] bg-yellow-400', 'h-[62px] bg-brand-primary']
  const NECK = ['#fdc876', '#f1a528']
  return (
    <div className="flex h-[126px] items-center pl-[53px]" aria-hidden="true">
      {steps.map((n, i) => (
        <div key={i} className="flex items-center">
          <span className={cn('flex w-[120px] items-center justify-center text-[44px] font-semibold leading-none tracking-[-0.02em] text-bg-0',
            BLOCK[i], i === 0 && 'rounded-l-sm', i === steps.length - 1 && 'rounded-r-sm')}>{n}</span>
          {i < steps.length - 1 && (
            <svg width={i === 0 ? 31 : 16} height={126 - i * 32} viewBox={`0 0 ${i === 0 ? 31 : 16} ${126 - i * 32}`} preserveAspectRatio="none">
              <path d={`M0 0 L${i === 0 ? 31 : 16} 16 V${126 - i * 32 - 16} L0 ${126 - i * 32} Z`} fill={NECK[i]} />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * 2.1 Study Overview, as redrawn in the 13 Oct 2026 export and applied to
 * every study type: an insight line, the recruitment funnel, the participation
 * forecast and five figures. Its sibling tab, Manage Study, holds what the
 * study is; this one holds how it is going.
 */
export default function StudyOverview() {
  const { id } = useParams()
  const s = useStudy(id)
  const { state } = useStudies()
  const c = counts(s)
  const pct = progressPct(s)
  const pace = paceOf(s, c.completed)
  const funnel = [
    { label: 'Applied', n: c.everApplied, bar: 'bg-cta-secondary' },
    { label: 'Qualified', n: c.everQualified, bar: 'bg-yellow-400' },
    { label: 'Completed', n: c.completed, bar: 'bg-brand-primary' },
  ]
  const top = Math.max(1, c.everApplied)
  const billed = s.payments.reduce((sum, p) => sum + (p.kind === 'refund' ? -p.amount : p.amount), 0)
  const average = averageScore(state, s)
  const facts: [string, string][] = [
    ['Average Trust Score', average ? String(average) : '—'],
    ['Required Participants', String(s.required)],
    ['Days Remaining', String(s.daysRemaining)],
  ]
  const tiles: { label: string; value: string; suffix?: string; empty?: boolean }[] = [
    // Nothing on the platform counts who saw or opened a study, so these two say so rather than show a figure.
    { label: 'Impressions', value: 'Not tracked yet', empty: true },
    { label: 'Clicks', value: 'Not tracked yet', empty: true },
    { label: 'Rated By You', value: String(c.rated), suffix: `/${c.completed} completed` },
    { label: 'Billed Till Now', value: money(billed) },
    { label: 'Created On', value: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  ]

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="overview" minH="min-h-[1014px]" bodyMinH="min-h-[775px]">
        <div className="flex flex-col gap-6 p-4">
          {pace && pace.state !== 'done' && (
            <section className="flex min-h-[87px] flex-col justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-30 to-bg-1 px-4 py-3">
              <p className="flex items-center gap-2 text-body-medium text-brand-primary">{SPARKLE}AI Super Insight</p>
              <p className="text-[17px] leading-6 tracking-[-0.01em] text-text-subtitle">
                <span className="text-text-title">{pace.state === 'ahead' ? 'You are ahead of pace.' : 'You are behind pace.'}</span>{' '}
                {pace.state === 'ahead'
                  ? `At this rate the study fills in about ${pace.daysToFinish} days, with ${s.daysRemaining} left.`
                  : `At this rate it needs about ${pace.daysToFinish} days and has ${s.daysRemaining}. About ${pace.perWeek} completions a week would finish it in time.`}
              </p>
            </section>
          )}

          <div className="grid grid-cols-2 gap-6">
            <section className="flex h-[367px] flex-col rounded-lg border-1 border-stroke-1 bg-bg-1 px-4 pt-[17px]">
              <h2 className="text-title-s font-normal text-text-subtitle">Recruitment Funnel</h2>
              <div className="pt-[23px]"><Funnel steps={funnel.map((f) => f.n)} /></div>
              <dl className="mt-6 flex flex-col gap-[14px] border-t-1 border-stroke-input px-2 pt-[25px]">
                {funnel.map((f) => (
                  <div key={f.label} className="flex h-6 items-center">
                    <dt className="w-[108px] text-body-regular text-text-title">{f.label}</dt>
                    <dd className="w-[50px] text-title-m text-text-title">{f.n}</dd>
                    <span className="h-2.5 w-[281px]"><span className={cn('block h-full rounded-full', f.bar)} style={{ width: `${Math.round((f.n / top) * 100)}%` }} /></span>
                    <span className="flex-1 text-right text-body-regular text-text-body">{Math.round((f.n / top) * 100)}%</span>
                  </div>
                ))}
              </dl>
            </section>

            <section className="flex h-[367px] flex-col rounded-lg border-1 border-stroke-1 px-4 pt-[17px]">
              <h2 className="text-title-s font-normal text-text-subtitle">Participation Forecast</h2>
              <div className="relative mt-[29px] flex h-[87px] items-center rounded-md bg-green-50 px-4">
                <div className="flex w-[237px] flex-col gap-1.5">
                  <span className="text-title-m leading-6 text-text-title">{pct}%</span>
                  <span className="text-body-regular text-text-subtitle">Progress</span>
                </div>
                <svg viewBox="0 0 116 116" width="116" height="116" className="absolute left-[113px] top-[-15px]" aria-hidden="true">
                  <circle cx="58" cy="58" r="57" fill="#fdfdfc" stroke="#edf3f0" />
                  <circle cx="58" cy="58" r="40" fill="none" stroke="#e3edea" strokeWidth="9" />
                  <circle cx="58" cy="58" r="40" fill="none" stroke="#3fb984" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 251.3} 251.3`} transform="rotate(-90 58 58)" />
                </svg>
                {/* The export only draws the study going well. Behind pace is not an error, so it is written in the brand orange, not red. */}
                <div className="flex flex-col gap-1.5">
                  <span className={cn('text-title-m leading-6', !pace ? 'text-text-subtitle' : pace.state === 'behind' ? 'text-brand-primary' : 'text-brand-secondary')}>
                    {!pace ? 'No pace yet' : pace.state === 'done' ? 'Target reached' : pace.state === 'ahead' ? 'Going On track' : 'Behind pace'}
                  </span>
                  <span className="text-body-regular text-text-subtitle">
                    {!pace ? 'Waiting for the first completion' : pace.state === 'done' ? 'Every seat is completed' : `~ ${pace.daysToFinish} days to finish`}
                  </span>
                </div>
              </div>
              <dl className="mt-[39px] flex flex-col">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex h-[55px] items-center justify-between border-t-1 border-stroke-input text-body-regular text-text-title">
                    <dt>{label}</dt>
                    <dd className="text-body-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <dl className="grid grid-cols-5 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className="flex h-[71px] flex-col justify-center gap-1 rounded-md border-1 border-stroke-1 px-[11px]">
                <dt className="text-text-regular text-text-subtitle">{t.label}</dt>
                <dd className={cn('flex items-baseline gap-1', t.empty ? 'text-body-regular text-text-body' : 'text-title-s leading-[25px] text-text-title')}>
                  {t.value}{t.suffix && <span className="text-body-regular text-text-subtitle">{t.suffix}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
