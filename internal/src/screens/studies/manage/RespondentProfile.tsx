import type { ReactNode } from 'react'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { ChevronRight, InfoIcon, VerifiedIcon } from '../../../components/ui/icons'
import { SidePanel } from '../../../components/ui/Overlay'
import { cn } from '../../../lib/cn'
import { PROFILE as P } from '../../../mock/recruiting'

const BAR = { green: 'bg-brand-secondary text-brand-secondary', blue: 'bg-blue-600 text-blue-600', purple: 'bg-purple-600 text-purple-600', yellow: 'bg-yellow-500 text-brand-primary' }

const Box = ({ title, className, children }: { title: string; className?: string; children: ReactNode }) => (
  <section className={cn('rounded-lg border-1 border-stroke-1 p-4 text-text-regular leading-5', className)}>
    <h3 className="text-text-subtitle">{title}</h3>
    {children}
  </section>
)

/** The 116px trust gauge: a three-quarter arc, the score in the middle, "/100" under it. */
const Gauge = () => (
  <div className="relative mx-auto h-[100px] w-[116px]">
    <svg viewBox="0 0 116 116" className="h-[116px] w-[116px]" aria-hidden="true">
      <path d="M21.2 94.800A52 52 0 1 1 94.800 94.800" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-stroke-input" />
      <path d="M21.2 94.800A52 52 0 1 1 94.800 94.800" fill="none" strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray="95 100" className="stroke-yellow-500" />
    </svg>
    <p className="absolute inset-x-0 top-[26px] text-center text-[40px] font-semibold leading-[52px] tracking-[-0.02em] text-brand-primary">{P.trust}</p>
    <p className="absolute inset-x-0 top-[78px] text-center text-body-regular leading-[22px] text-text-subtitle">/100</p>
  </div>
)

/**
 * Respondent Profile Details (1932:109128, the 600 panel, 913 tall): who the
 * person is, their trust score and tier, four performance ratings, About,
 * Verified and Metrics. One button: "Invite To Study", or a disabled "Invited
 * to this study" once they are (1932:109286). Everything else is read only.
 */
export default function RespondentProfile({ open, invited, onClose, onInvite }: { open: boolean; invited: boolean; onClose: () => void; onInvite: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title={P.name}
      footer={invited
        ? <p aria-disabled="true" className="flex h-12 items-center justify-center rounded-md bg-stroke-input text-body-medium text-text-disabled">Invited to this study</p>
        : <Button onClick={onInvite}>Invite To Study</Button>}>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bg-3 text-title-m text-text-subtitle">{P.initial}</span>
        <div>
          <p className="text-title-s leading-[25px] text-text-title">{P.role}</p>
          <p className="flex gap-2 pt-1.5 text-text-regular leading-5 text-text-subtitle">
            {P.meta.map((m, i) => <span key={m} className="flex gap-2">{i > 0 && <span aria-hidden="true">•</span>}{m}</span>)}
          </p>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <section className="flex h-56 flex-1 flex-col rounded-lg bg-bgAlt-1 p-4">
          <div className="flex h-7 items-center justify-between">
            <h3 className="text-text-regular text-text-subtitle">Trust Score</h3>
            <button type="button" className="flex items-center gap-1 text-text-medium text-text-title">Reviews <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="pt-3.5"><Gauge /></div>
          <div className="flex justify-center pt-4"><TierTag tier={P.tier} size={32} /></div>
        </section>
        <section className="h-56 flex-1 rounded-lg bg-bg-1 p-4 text-text-regular leading-5">
          <h3 className="text-text-subtitle">Performance Ratings</h3>
          <div className="flex flex-col gap-4 pt-3">
            {P.ratings.map((r) => (
              <div key={r.label}>
                <p className="flex justify-between text-text-title">
                  <span className="flex items-center gap-1">{r.label}<InfoIcon className="h-4 w-4 text-text-subtitle" /></span>
                  <span className={cn('bg-transparent', BAR[r.colour].split(' ')[1])}>{r.value}</span>
                </p>
                <div className="mt-1 h-1 rounded-full bg-stroke-input"><div className={cn('h-1 rounded-full', BAR[r.colour].split(' ')[0])} style={{ width: r.value }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="flex flex-col gap-3 pt-3">
        <Box title="About">
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3 pt-3">
            {P.about.map(([label, value]) => <div key={label}><dt className="text-text-subtitle">{label}</dt><dd className="whitespace-pre pt-1 text-text-title">{value}</dd></div>)}
          </dl>
        </Box>
        <Box title="Verified">
          <ul className="grid grid-cols-2 gap-x-2 gap-y-2 pt-3">
            {P.verified.map((v) => <li key={v} className="flex items-center gap-1 text-text-title"><VerifiedIcon className="h-4 w-4 text-state-success" />{v}</li>)}
          </ul>
        </Box>
        <Box title="Metrics">
          <dl className="grid grid-cols-3 gap-x-4 pt-3">
            {P.metrics.map(([label, value]) => <div key={label}><dt className="text-text-subtitle">{label}</dt><dd className="pt-1 text-title-s leading-[25px] text-brand-primary">{value}</dd></div>)}
          </dl>
        </Box>
      </div>
      <div className="h-6" />
    </SidePanel>
  )
}
