import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { ExternalIcon, MailIcon } from '../../../components/ui/icons'
import { Avatar } from '../../../components/ui/Tag'
import { cn } from '../../../lib/cn'
import type { ManagedStudy } from '../../../mock/manage'
import { averageScore, counts, paceOf } from '@shared/derive'
import { usePlatform } from '../../../platform'

export const Tile = ({ label, value, rest, children }: { label: string; value: string; rest?: string; children?: ReactNode }) => (
  <div className="flex h-[77px] flex-1 items-center justify-between rounded-md bg-yellow-30 p-3">
    <div>
      <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
      <p className="flex items-baseline gap-0.5 pt-0.5 text-title-l leading-[31px] text-text-title">
        {value}{rest && <span className="text-body-medium leading-[22px]">{rest}</span>}
      </p>
    </div>
    {children}
  </div>
)

/** The 45px progress ring: a yellow-100 track with a brand-primary arc for two thirds. */
const Ring = ({ pct }: { pct: number }) => (
  <svg viewBox="0 0 45 45" className="mx-1 h-[45px] w-[45px] -rotate-90" aria-hidden="true">
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" strokeWidth="6" className="stroke-yellow-100" />
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray={`${pct} 100`} className={pct > 0 ? "stroke-yellow-500" : "hidden"} />
  </svg>
)

/** About Client (304 wide on bg-1): who owns the study, four facts, and a way to their profile. */
export function ClientCard({ client: C, className, wide }: { client: ManagedStudy['client']; className?: string; wide?: boolean }) {
  const navigate = useNavigate()
  return (
    <aside className={cn(wide ? 'w-full' : 'w-[304px] shrink-0 self-start', 'rounded-lg bg-bg-1 p-3 text-text-regular leading-5', className)}>
      <h3 className="text-text-body">About Client</h3>
      <div className="flex items-center gap-2 pt-3">
        <Avatar src={C.avatar} name={C.name} size={48} />
        <div>
          <p className="text-body-medium text-text-title">{C.name}</p>
          <p className="pt-1 text-text-subtitle">{C.role}</p>
        </div>
      </div>
      <p className="flex items-center gap-1 pt-3 text-text-subtitle"><MailIcon className="h-4 w-4" />{C.email}</p>
      <dl className="flex flex-col gap-2 pt-2.5">
        {C.rows.map(([label, value]) => (
          <Fragment key={label}>
            <hr className="border-0 border-t-1 border-stroke-input" />
            <div className="flex justify-between"><dt className="text-text-body">{label}</dt><dd className="text-text-subtitle">{value}</dd></div>
          </Fragment>
        ))}
      </dl>
      <Button variant="tertiary" size="md" fullWidth className="mt-6" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate(`/clients/${C.id}`)}>Go To Profile</Button>
    </aside>
  )
}

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="m10.5 4 1.9 4.6L17 10.5l-4.6 1.9L10.5 17l-1.9-4.6L4 10.5l4.6-1.9L10.5 4Zm8 9.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
const BLOCK = ['h-[126px] bg-yellow-200', 'h-[94px] bg-yellow-400', 'h-[62px] bg-brand-primary']
const BAR = ['bg-yellow-200', 'bg-yellow-400', 'bg-brand-primary']

/**
 * Overview (1932:106948, 19 Oct 2026): the client's Overview for the team. An
 * insight line on the study's pace, the recruitment funnel with About Client
 * under it, the participation forecast with three figures under it. Every
 * number is the study's own (shared/derive.ts, the same as the client app's).
 * The paused study draws the same without the client card.
 */
export default function OverviewTab({ study, paused }: { study: ManagedStudy; paused: boolean }) {
  const state = usePlatform()
  const s = study.raw
  const c = counts(s)
  const pace = paceOf(s, c.completed)
  const pct = s.required ? Math.min(100, Math.floor((c.completed / s.required) * 100)) : 0
  const steps: [string, number][] = [['Applied', c.everApplied], ['Qualified', c.everQualified], ['Completed', c.completed]]
  const top = Math.max(1, c.everApplied)
  const billed = s.payments.reduce((sum, p) => sum + (p.kind === 'refund' ? -p.amount : p.amount), 0)
  const average = averageScore(state, s)
  const days = study.figures.daysRemaining
  const tiles: [string, string, string][] = [
    ['Rated By You', String(c.rated), `/${c.completed} completed`],
    ['Billed Till Now', `$${billed.toLocaleString('en-US')}`, ''],
    ['Created On', new Date(s.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), ''],
  ]
  return (
    <div className="flex flex-col gap-6">
      {pace && pace.state !== 'done' && (
        <section className="flex flex-col gap-2 rounded-lg bg-gradient-to-r from-yellow-30 to-bg-1 px-4 py-3">
          <p className="flex items-center gap-2 text-body-medium text-brand-primary">{SPARKLE}AI Super Insight</p>
          <p className="text-body-regular text-text-subtitle">
            <span className="text-text-title">{pace.state === 'ahead' ? 'You are ahead of pace.' : 'You are behind pace.'}</span>{' '}
            {pace.state === 'ahead'
              ? `At this rate the study fills in about ${pace.daysToFinish} days, with ${days} left.`
              : `At this rate it needs about ${pace.daysToFinish} days and has ${days}. About ${pace.perWeek} completions a week would finish it in time.`}
          </p>
        </section>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col rounded-lg border-1 border-stroke-1 bg-bg-1 px-4 pb-5 pt-4">
            <h2 className="text-title-s text-text-subtitle">Recruitment Funnel</h2>
            <div className="flex h-[126px] items-center justify-center pt-6" aria-hidden="true">
              {steps.map(([label, n], i) => (
                <span key={label} className={cn('flex w-[110px] items-center justify-center text-[40px] font-semibold text-bg-0', BLOCK[i], i === 0 && 'rounded-l-sm', i === 2 && 'rounded-r-sm')}>{n}</span>
              ))}
            </div>
            <dl className="mt-8 flex flex-col gap-3 border-t-1 border-stroke-input px-2 pt-5">
              {steps.map(([label, n], i) => (
                <div key={label} className="flex h-6 items-center">
                  <dt className="w-[100px] text-body-regular text-text-title">{label}</dt>
                  <dd className="w-[44px] text-title-s text-text-title">{n}</dd>
                  <span className="h-2.5 flex-1"><span className={cn('block h-full rounded-full', BAR[i])} style={{ width: `${Math.round((n / top) * 100)}%` }} /></span>
                  <span className="w-[52px] text-right text-body-regular text-text-body">{Math.round((n / top) * 100)}%</span>
                </div>
              ))}
            </dl>
          </section>
          {!paused && <ClientCard client={study.client} wide />}
        </div>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col rounded-lg border-1 border-stroke-1 px-4 pb-2 pt-4">
            <h2 className="text-title-s text-text-subtitle">Participation Forecast</h2>
            <div className="mt-6 flex h-[87px] items-center justify-between gap-4 rounded-md bg-bgAlt-2 px-4">
              <span className="flex flex-col gap-1"><span className="text-title-m text-text-title">{pct}%</span><span className="text-body-regular text-text-subtitle">Progress</span></span>
              <Ring pct={pct} />
              <span className="flex flex-col gap-1">
                <span className={cn('text-title-m', !pace ? 'text-text-subtitle' : pace.state === 'behind' ? 'text-brand-primary' : 'text-brand-secondary')}>
                  {!pace ? 'No pace yet' : pace.state === 'done' ? 'Target reached' : pace.state === 'ahead' ? 'Going On track' : 'Behind pace'}
                </span>
                <span className="text-body-regular text-text-subtitle">
                  {!pace ? 'Waiting for the first completion' : pace.state === 'done' ? 'Every seat is completed' : `~ Approx. ${pace.daysToFinish} days more to fill`}
                </span>
              </span>
            </div>
            <dl className="mt-6 flex flex-col">
              {[['Average Trust Score', average ? String(average) : 'None yet'], ['Required Participants', String(s.required)]].map(([k, v]) => (
                <div key={k} className="flex h-[52px] items-center justify-between border-t-1 border-stroke-input text-body-regular text-text-title">
                  <dt>{k}</dt><dd className="text-body-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <dl className="grid grid-cols-3 gap-2">
            {tiles.map(([k, v, r]) => (
              <div key={k} className="flex h-[71px] flex-col justify-center gap-1 rounded-md border-1 border-stroke-1 px-3">
                <dt className="text-text-regular text-text-subtitle">{k}</dt>
                <dd className="flex items-baseline gap-1 text-title-s text-text-title">{v}{r && <span className="text-body-regular text-text-subtitle">{r}</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
