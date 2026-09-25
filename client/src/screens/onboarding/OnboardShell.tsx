import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CheckCircle, UsersIcon } from '../../components/ui/icons'

const QUOTE = '“HumanLayer has been the best most trusted and verified go-to platform for our every single user research of any market! It gets you structured results and summarized data in their clean client portal managing the fully customized research studies with ease.”'

/** A floating figure card in the showcase panel. */
function Figure({ label, value, icon, className }: { label: string; value: string; icon: ReactNode; className?: string }) {
  return (
    <div className={cn('absolute flex flex-col gap-2 rounded-lg bg-bg-0 p-4 shadow-[0_8px_24px_rgba(32,30,25,0.08)]', className)}>
      <span className="text-body-regular text-text-title">{label}</span>
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-30 text-brand-primary">{icon}</span>
        <span className="text-title-l text-text-title">{value}</span>
      </span>
    </div>
  )
}

/** The showcase panel the split screens put beside the form. */
function Showcase() {
  return (
    <aside className="relative w-[704px] shrink-0 overflow-hidden rounded-xl bg-bg-1">
      <div className="relative h-[732px]">
        <svg className="absolute left-[214px] top-[186px]" width="340" height="400" viewBox="0 0 340 400" fill="none" aria-hidden="true">
          <path d="M214 14h96a16 16 0 0 1 16 16v148a16 16 0 0 1-16 16H30a16 16 0 0 0-16 16v130"
            stroke="#fca311" strokeWidth="1.5" />
        </svg>
        <Figure label="Respondents Hired" value="1,786" icon={<UsersIcon className="h-[18px] w-[18px]" />}
          className="left-[231px] top-[144px] w-[218px]" />
        <div className="absolute left-[124px] top-[272px] w-[374px] rounded-lg bg-bg-0 p-4 shadow-[0_8px_24px_rgba(32,30,25,0.08)]">
          <span className="flex items-center justify-between gap-3">
            <span className="inline-flex h-7 items-center gap-2 rounded-full bg-green-50 px-2.5 text-text-regular text-brand-secondary">
              <span className="text-[11px]">▮▮▮</span>Survey
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full border-1 border-stroke-input px-2.5 text-text-regular text-text-subtitle">Recruiting</span>
              <span className="text-text-subtitle">⋮</span>
            </span>
          </span>
          <p className="pt-3 text-body-large text-text-title">E-learning platform experience data</p>
          <p className="flex items-center justify-between gap-3 pt-3">
            <span className="text-body-medium text-text-title">25% <span className="text-text-regular text-text-subtitle">completed</span></span>
            <span className="text-text-regular text-text-subtitle">required <span className="text-text-title">12</span></span>
          </p>
          <span className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full">
            <span className="h-full w-[36%] rounded-full bg-brand-secondary" />
            <span className="h-full w-[52%] rounded-full bg-cta-primary" />
            <span className="h-full flex-1 rounded-full bg-bg-2" />
          </span>
          <p className="pt-3 text-text-regular text-text-subtitle">
            <span className="pr-1">▤</span>Jan 25 – Feb 24 <span className="px-1 text-text-body">•</span> 16/60 days left
          </p>
        </div>
        <Figure label="Completed Studies" value="72" icon={<CheckCircle className="h-[18px] w-[18px]" />}
          className="left-[379px] top-[512px] w-[218px]" />
      </div>
      <div className="mx-6 border-t-1 border-stroke-input" />
      <div className="px-6 pt-6">
        <p className="max-w-[592px] text-body-regular leading-[22px] text-text-title">{QUOTE}</p>
        <span className="flex items-center gap-3 pt-4">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-md bg-bg-0 text-[15px]">🎨</span>
          <span className="flex flex-col">
            <span className="text-body-medium text-text-title">Luke M</span>
            <span className="text-text-regular text-text-subtitle">VP of Figma</span>
          </span>
        </span>
      </div>
    </aside>
  )
}

/**
 * The onboarding pages sit outside the app shell. Two layouts: Sign Up, Sign
 * In and Check Email put a 704px showcase panel beside a 458px form; the rest
 * centre a 460px column on the page.
 */
export default function OnboardShell({
  split, green, children,
}: { split?: boolean; green?: boolean; children: ReactNode }) {
  if (split) {
    return (
      <div className="min-h-screen bg-bg-0 p-4">
        <div className="flex gap-4">
          <Showcase />
          <div className="flex flex-1 justify-center">
            <div className="w-[458px] pt-[72px]">{children}</div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('min-h-screen', green ? 'bg-bgAlt-1' : 'bg-bg-0')}>
      <div className="mx-auto w-[460px] pt-[40px]">{children}</div>
    </div>
  )
}
