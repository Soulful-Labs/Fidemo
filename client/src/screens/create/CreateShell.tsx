import type { ReactNode } from 'react'
import { SideNav } from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { DiaryIcon, Info, PoolIcon, StudiesIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

export type CreateStep = 'about' | 'audience' | 'screener' | 'study'

/** The four step chips in the Create top bar, with the rule between them. */
const STEPS: { key: CreateStep; label: string; Icon: typeof Info; to: string }[] = [
  { key: 'about', label: 'About', Icon: Info, to: '/studies/create/about' },
  { key: 'audience', label: 'Audience', Icon: PoolIcon, to: '/studies/create/audience' },
  { key: 'screener', label: 'Screener', Icon: StudiesIcon, to: '/studies/create/screener' },
  { key: 'study', label: 'Study', Icon: DiaryIcon, to: '/studies/create/study' },
]

/**
 * The Create Study frame: the same left navigation, but the top bar carries
 * "Create Study / Study Name", the four step chips and the Save Draft & Exit
 * and Publish Study buttons instead of the bell and Create Study.
 */
export default function CreateShell({ step, children }: { step: CreateStep; children: ReactNode }) {
  const index = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen bg-yellow-20">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-topbar shrink-0 items-center justify-between gap-6 border-b-1 border-stroke-1 bg-bgAlt-2 px-6">
          <span className="text-body-regular text-text-subtitle">Create Study / <span className="text-text-title">Study Name</span></span>

          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const on = s.key === step
              const done = i < index
              return (
                <li key={s.key} className="flex items-center">
                  {i > 0 && <span className="h-px w-6 bg-stroke-input" />}
                  <span className={cn('flex h-8 items-center gap-1.5 rounded-full border-1 px-3 text-text-medium',
                    on ? 'border-brand-secondary bg-bgAlt-2 text-brand-secondary'
                      : done ? 'border-stroke-input bg-bg text-text-subtitle' : 'border-stroke-input bg-bg-1 text-text-body')}>
                    <s.Icon className="h-4 w-4" />
                    {s.label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="flex items-center gap-3">
            <Button variant="tertiary">Save Draft &amp; Exit</Button>
            <Button disabled>Publish Study</Button>
          </div>
        </header>

        <main className="flex-1 px-2 pb-2 pt-px">{children}</main>
      </div>
    </div>
  )
}
