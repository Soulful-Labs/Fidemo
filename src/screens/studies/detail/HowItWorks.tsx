import { useState } from 'react'
import { ChevronDown } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

/** Accordion, copy quoted from PRD 6.6. */
const STEPS = [
  'Apply and answer screener questions to see if qualify. The researcher will review your application and invite you if selected.',
  'Complete a project and get paid! Once approved, take part in the project and receive payment directly for your time and insights.',
]

export default function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-lg border-1 border-stroke-2 bg-bg-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-title-s text-text-title">How It Works</span>
        <ChevronDown className={cn('text-text-body transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ol className="flex flex-col gap-3 px-4 pb-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-2 text-label text-brand-primary">
                {i + 1}
              </span>
              <span className="text-text-regular text-text-body">{step}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
