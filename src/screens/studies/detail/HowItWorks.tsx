import { useState } from 'react'
import { ChevronDown } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

/** Accordion, copy quoted from PRD 6.6, drawn as two steps on a dotted line. */
const STEPS = [
  {
    title: 'Apply and answer screener questions to see if qualify',
    body: 'The researcher will review your application and invite you if selected.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8 9 1 1 2-2M8 15l1 1 2-2M13 9.5h3M13 15.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Complete a project and get paid!',
    body: 'Once approved, take part in the project and receive payment directly for your time and insights.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 2.5l2 1.6 2.5-.3.9 2.4 2.3 1-.3 2.5L21 12l-1.6 2.3.3 2.5-2.3 1-.9 2.4-2.5-.3L12 21.5l-2-1.6-2.5.3-.9-2.4-2.3-1 .3-2.5L3 12l1.6-2.3-.3-2.5 2.3-1 .9-2.4 2.5.3L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 7.5v9M14 9.5c0-.8-.9-1.3-2-1.3s-2 .5-2 1.3.9 1.3 2 1.3 2 .5 2 1.4-.9 1.3-2 1.3-2-.5-2-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function HowItWorks({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-lg bg-bg-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-title-s text-text-title">How It Works</span>
        <ChevronDown className={cn('h-6 w-6 text-text-title transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ol className="flex flex-col px-4 pb-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-900/40 text-brand-secondary">
                  {step.icon}
                </span>
                {i < STEPS.length - 1 && <span className="w-px flex-1 border-l-1 border-dashed border-stroke-3" />}
              </div>
              <div className={cn('flex flex-col gap-1', i < STEPS.length - 1 && 'pb-6')}>
                <p className="text-body-medium text-text-title">{step.title}</p>
                <p className="text-body-regular text-text-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
