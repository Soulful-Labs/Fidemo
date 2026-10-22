import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/client/StudyCard'
import SidePanel from '../../components/ui/SidePanel'
import { ChevronLeft, ChevronRight } from '../../components/ui/icons'
import type { attention } from '../../lib/insight'
import { cn } from '../../lib/cn'
import { StudyCardMenu } from '../studies/StudyMenus'

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
/**
 * How many cards fit across a box (22 Oct 2026): at least three, and one more for every further card's
 * width the screen allows, so wide screens show more.
 */
export function usePerRow(box: React.RefObject<HTMLElement | null>, cardMin = 340, gap = 12, least = 3): number {
  const [n, setN] = useState(least)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setN(Math.max(least, Math.floor((el.clientWidth + gap) / (cardMin + gap))))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [box, cardMin, gap, least])
  return n
}

export function StudyCarousel({ studies, head }: { studies: React.ComponentProps<typeof StudyCard>['study'][]; head: (arrows: ReactNode) => ReactNode }) {
  const navigate = useNavigate()
  const [at, setAt] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  /** Cards in view: three at least, more on wider screens (22 Oct 2026). */
  const perView = usePerRow(frame)
  /** Which card's three-dot menu is open: the same Ongoing study options as the Studies list. */
  const [menu, setMenu] = useState<string | null>(null)
  const last = Math.max(0, studies.length - perView)
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
  }, [studies.length, perView])
  const arrows = studies.length > perView && (
    <span className="flex items-center gap-1.5">
      <span className="pr-1.5 text-text-regular text-text-subtitle" aria-live="polite">{index + 1}–{Math.min(index + perView, studies.length)} of {studies.length}</span>
      <StepArrow dir={-1} label="Previous studies" disabled={index === 0} onClick={() => setAt(index - 1)} />
      <StepArrow dir={1} label="Next studies" disabled={index >= last} onClick={() => setAt(index + 1)} />
    </span>
  )
  return (
    <>
      {head(arrows)}
      <div ref={frame} className="overflow-hidden">
        <div ref={track} className="flex gap-3 transition-transform duration-[160ms] ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * step}px)` }}>
          {studies.map((s, i) => (
            <div key={s.id} className="shrink-0" style={{ width: `calc((100% - ${(perView - 1) * 12}px) / ${perView})` }}
              aria-hidden={i < index || i >= index + perView || undefined} inert={i < index || i >= index + perView || undefined}>
              <StudyCard onOpen={() => navigate(`/studies/${s.id}`)} onMenu={() => setMenu(s.id)} study={s} className="h-full"
                menu={<StudyCardMenu study={s} open={menu === s.id} onClose={() => setMenu(null)} />} />
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
