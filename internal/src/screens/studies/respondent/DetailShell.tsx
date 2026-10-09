import type { ReactNode } from 'react'
import AppShell from '../../../app/AppShell'
import PanelTabs from '../../../components/app/PanelTabs'
import type { PanelTab } from '../../../components/app/PanelTabs'
import Pill from '../../../components/app/Pill'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { ClipboardIcon, ClockIcon, HistoryIcon, InfoIcon, ScreenerIcon, StarIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { ManagedStudy } from '../../../mock/manage'
import { RESPONDENT as R } from '../../../mock/results'

export const DETAIL_TABS: Record<'screener' | 'result' | 'activity', PanelTab> = {
  screener: { key: 'screener', label: 'Screener', width: 'w-[123px]', Icon: ScreenerIcon },
  result: { key: 'result', label: 'Study Result', width: 'w-[151px]', Icon: ClipboardIcon },
  activity: { key: 'activity', label: 'Activity', width: 'w-[112px]', Icon: HistoryIcon },
}

const BAR = { green: ['bg-brand-secondary', 'text-brand-secondary'], blue: ['bg-blue-600', 'text-blue-600'], purple: ['bg-purple-600', 'text-purple-600'], yellow: ['bg-yellow-500', 'text-brand-primary'] }
const Rule = () => <hr className="-mx-3 border-0 border-t-1 border-stroke-1" />

/**
 * The respondent beside their page (1952:78522, 304 wide): name, role,
 * experience, place and certificate id; trust score and tier; four ratings;
 * About, Verified and Metrics. Once they have finished, a "Rate ... for this
 * study" block sits on top.
 */
export function RespondentCard({ name, onRate }: { name: string; onRate?: () => void }) {
  const first = name.split(' ')[0]
  return (
    <aside className="flex w-[304px] shrink-0 flex-col gap-3 self-start rounded-lg border-1 border-stroke-1 p-3 text-text-regular leading-5">
      {onRate && (
        <div className="rounded-md bg-bgAlt-2 px-4 pb-4 pt-3.5">
          <p className="flex items-center gap-1 text-text-medium text-text-title"><StarIcon className="h-5 w-5 text-brand-secondary" />Rate {name} for this study</p>
          <p className="pb-2.5 pt-1.5 text-text-subtitle">Your rating helps you and other clients find better matching respondents.</p>
          <Button size="md" fullWidth onClick={onRate}>Rate {first}</Button>
        </div>
      )}
      <div>
        <p className="flex items-center gap-2 text-body-medium leading-[22px] text-text-title"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-3 text-label text-text-subtitle">{name.slice(0, 1)}</span>{name}</p>
        <p className="pt-2.5 text-title-s leading-[25px] text-text-title">{R.role}</p>
        {R.facts.map((f) => <p key={f} className="pt-2 text-text-title first-of-type:pt-0">{f}</p>)}
      </div>
      <Rule />
      <div>
        <p className="text-text-subtitle">Trust Score</p>
        <p className="flex items-center gap-3 pt-2 text-title-l leading-[31px] text-text-title">{R.trust}<TierTag tier={R.tier} size={32} /></p>
        <p className="pb-2 pt-3 text-text-subtitle">Performance Ratings</p>
        <div className="flex flex-col gap-3">
          {R.ratings.map(([label, value, colour]) => (
            <div key={label}>
              <p className="flex justify-between text-text-title"><span className="flex items-center gap-1">{label}<InfoIcon className="h-4 w-4 text-text-subtitle" /></span><span className={BAR[colour][1]}>{value}</span></p>
              <div className="mt-1 h-1 rounded-full bg-stroke-input"><div className={cn('h-1 rounded-full', BAR[colour][0])} style={{ width: value }} /></div>
            </div>
          ))}
        </div>
      </div>
      <Rule />
      <dl className="flex flex-col gap-[7px]">
        <dt className="pb-0.5 text-text-subtitle">About</dt>
        {R.about.map(([label, value], i) => (
          <div key={label} className={cn('flex justify-between', i > 0 && 'border-t-1 border-stroke-1 pt-1.5')}><span className="text-text-subtitle">{label}</span><span className="text-text-title">{value}</span></div>
        ))}
      </dl>
      <Rule />
      <ul className="flex flex-col gap-2">
        <li className="pb-1 text-text-subtitle">Verified</li>
        {R.verified.map((v) => <li key={v} className="flex items-center gap-1 text-text-title"><VerifiedIcon className="h-4 w-4 text-state-success" />{v}</li>)}
      </ul>
      <Rule />
      <dl className="flex flex-col gap-2">
        <dt className="pb-1 text-text-subtitle">Metrics</dt>
        {R.metrics.map(([label, value]) => <div key={label} className="flex justify-between"><span className="text-text-subtitle">{label}</span><span className="text-text-title">{value}</span></div>)}
      </dl>
    </aside>
  )
}

/**
 * The shell of a respondent or session page inside a study (1952:78522,
 * 1952:79052): the study's compact header (92 x 69 image, title, type,
 * duration, industry), then a panel of icon tabs with an optional bar pinned
 * under its content, and an optional card beside it.
 */
export default function DetailShell({ study, tabs, tab, onTab, bar, aside, close, closed, children }: {
  /** Reached from a completed study: the crumb reads "Completed". */
  closed?: boolean
  /** The applied respondent's frames leave 12 under the header; every other frame 16. */
  close?: boolean
  study: ManagedStudy; tabs: PanelTab[]; tab: string; onTab: (k: string) => void; bar?: ReactNode; aside?: ReactNode; children: ReactNode
}) {
  return (
    <AppShell className={cn('flex flex-col', close ? 'gap-3' : 'gap-4', study.tight && 'p-4')}
      crumbs={[{ label: 'Studies', to: '/studies' }, { label: closed ? 'Completed' : 'Ongoing', to: `/studies/${study.id}${closed ? '?state=completed' : ''}` }, { label: study.title }]}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={study.image} alt="" className="h-[69px] w-[92px] rounded-sm object-cover" />
        <div className="flex flex-col gap-3">
          <h1 className="text-title-s leading-[25px] text-text-title">{study.title}</h1>
          <div className="flex gap-2">
            <StudyTypeTag type={study.type} filled />
            <Pill className="border-stroke-3" icon={<ClockIcon className="h-4 w-4 text-text-title" />}>{study.time}</Pill>
            <Pill className="border-stroke-3">{study.industry}</Pill>
          </div>
        </div>
      </header>
      <div className="flex items-start gap-6">
        <section className="min-w-0 flex-1 overflow-hidden rounded-lg border-1 border-stroke-1">
          <PanelTabs tabs={tabs} value={tab} onChange={onTab} />
          <div role="tabpanel" className="p-4">{children}</div>
          {bar && <div className="border-t-1 border-stroke-1">{bar}</div>}
        </section>
        {aside}
      </div>
    </AppShell>
  )
}
