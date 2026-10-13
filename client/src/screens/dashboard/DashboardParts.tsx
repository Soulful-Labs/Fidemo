import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/client/StudyCard'
import SidePanel from '../../components/ui/SidePanel'
import { ChevronLeft, ChevronRight } from '../../components/ui/icons'
import type { attention } from '../../lib/insight'
import { cn } from '../../lib/cn'

/** The small square arrow the dashboard's steppers share (Super Insights draws it first). */
export function StepArrow({ dir, disabled, onClick, label }: { dir: -1 | 1; disabled: boolean; onClick: () => void; label: string }) {
  const Icon = dir < 0 ? ChevronLeft : ChevronRight
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick}
      className={cn('flex h-7 w-7 items-center justify-center rounded-sm border-1 border-stroke-3', disabled ? 'text-text-disabled' : 'text-text-title hover:bg-bg-0')}>
      <Icon className="h-4 w-4" />
    </button>
  )
}

/**
 * Ongoing Studies as a carousel: the same cards, two at a time, every ongoing
 * study reachable with the arrows. Moving is tier 1, getting around: a 160ms
 * slide on ease-out, no overshoot, and none at all under reduced motion.
 */
export function StudyCarousel({ studies, head }: { studies: React.ComponentProps<typeof StudyCard>['study'][]; head: (arrows: ReactNode) => ReactNode }) {
  const navigate = useNavigate()
  const [at, setAt] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const last = Math.max(0, studies.length - 2)
  const index = Math.min(at, last)
  // One step is one card and the gap after it, measured so the slide lands exactly on a card edge.
  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => { const first = el.children[0] as HTMLElement | undefined; setStep(first ? first.offsetWidth + 12 : 0) }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [studies.length])
  const arrows = studies.length > 2 && (
    <span className="flex items-center gap-1.5">
      <span className="pr-1.5 text-text-regular text-text-subtitle" aria-live="polite">{index + 1}–{Math.min(index + 2, studies.length)} of {studies.length}</span>
      <StepArrow dir={-1} label="Previous studies" disabled={index === 0} onClick={() => setAt(index - 1)} />
      <StepArrow dir={1} label="Next studies" disabled={index >= last} onClick={() => setAt(index + 1)} />
    </span>
  )
  return (
    <>
      {head(arrows)}
      <div className="overflow-hidden">
        <div ref={track} className="flex gap-3 transition-transform duration-[160ms] ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * step}px)` }}>
          {studies.map((s, i) => (
            <div key={s.id} className="w-[calc((100%-12px)/2)] shrink-0" aria-hidden={i < index || i > index + 1 || undefined}
              inert={i < index || i > index + 1 || undefined}>
              <StudyCard onOpen={() => navigate(`/studies/${s.id}`)} onMenu={() => navigate('/studies')} study={s} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

type Need = ReturnType<typeof attention>[number]

/** One Needs Your Attention row, as drawn. */
export function NeedRow({ n }: { n: Need }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(n.to)}
      className="flex h-[69px] w-full items-center border-t-1 border-stroke-input pl-1 text-left first-of-type:border-t-0">
      <span className="flex w-[100px] shrink-0 items-baseline gap-0.5 text-title-l font-medium text-text-title">
        {n.figure}{n.suffix && <span className="text-text-regular text-text-body">{n.suffix}</span>}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1 text-text-medium text-text-title">{n.title}<ChevronRight className="h-4 w-4 text-brand-primary" /></span>
        <span className="truncate text-text-regular text-text-body">{n.sub}</span>
      </span>
    </button>
  )
}

/** Every row, for "View all": the dashboard shows the top three. */
export function AttentionPanel({ open, onClose, needs }: { open: boolean; onClose: () => void; needs: Need[] }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Needs Your Attention" headerClassName="h-14" bodyClassName="flex flex-col px-4 py-2">
      {needs.map((n) => <NeedRow key={n.key} n={n} />)}
    </SidePanel>
  )
}
