import { useEffect, useRef, useState } from 'react'
import CoinRain from '../../components/motion/CoinRain'
import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { Coin, useSection } from './shared'

/** Step 1: an ID card is scanned, and a green tick is stamped on it. */
export function VerifyVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative flex h-24 w-40 gap-3 overflow-hidden rounded-md border-2 border-text-disabled bg-bg-1 p-3">
        <span className="h-10 w-10 shrink-0 rounded-sm bg-text-disabled" />
        <span className="flex flex-1 flex-col gap-2 pt-1">
          <span className="h-2 w-full rounded-full bg-text-disabled" />
          <span className="h-2 w-2/3 rounded-full bg-stroke-3" />
          <span className="h-2 w-5/6 rounded-full bg-stroke-3" />
        </span>
        <span data-decor aria-hidden="true" className="ld-scan absolute inset-x-0 top-0 h-1 bg-brand-secondary shadow-glow shadow-brand-secondary" />
      </div>
      <span className="ld-stamp absolute left-1/2 top-1/2 ml-12 mt-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-bg-0 bg-state-success text-text-title">
        <Check className="h-7 w-7" />
      </span>
    </div>
  )
}

/** Step 2: three studies on the table, and the one that fits you lifts out of the row. */
export function MatchVisual() {
  const card = 'flex h-24 w-16 flex-col gap-2 rounded-md border-2 bg-bg-1 p-2'
  const lines = <><span className="h-6 rounded-sm bg-stroke-3" /><span className="h-1.5 rounded-full bg-stroke-3" /><span className="h-1.5 w-2/3 rounded-full bg-stroke-3" /></>
  return (
    <div className="flex h-full items-center justify-center gap-3">
      <span className={cn(card, 'ld-side -rotate-6 border-stroke-3')}>{lines}</span>
      <span className={cn(card, 'ld-pick relative border-brand-primary')}>
        {lines}
        <span className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-cta-primaryText"><Check className="h-4 w-4" /></span>
      </span>
      <span className={cn(card, 'ld-side rotate-6 border-stroke-3')}>{lines}</span>
    </div>
  )
}

/** Step 3: three questions, answered one after another. */
export function AnswerVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      {['w-24', 'w-32', 'w-20'].map((w, i) => (
        <span key={w} className="flex h-9 w-52 items-center gap-3 rounded-full border-2 border-stroke-3 bg-bg-1 px-3">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-text-disabled">
            <span className="ld-answer absolute -inset-0.5 flex items-center justify-center rounded-full bg-brand-secondary text-green-900" style={{ animationDelay: `${i * 0.55}s` }}>
              <Check className="h-3 w-3" />
            </span>
          </span>
          <span className={cn('h-2 rounded-full bg-text-disabled', w)} />
        </span>
      ))}
    </div>
  )
}

/** Step 4: coins drop into a wallet, again and again while the card is on screen. */
export function PaidVisual() {
  const purse = useRef<HTMLSpanElement>(null)
  const { live } = useSection()
  const [round, setRound] = useState(0)
  useEffect(() => {
    if (!live) return
    const t = window.setInterval(() => setRound((n) => n + 1), 2400)
    return () => window.clearInterval(t)
  }, [live])
  return (
    <div className="flex h-full items-center justify-center pt-10">
      <span ref={purse} className="relative flex h-20 w-28 items-center justify-center rounded-lg border-2 border-green-700 bg-green-900 will-change-transform">
        <span className="absolute -top-2 left-3 right-3 h-3 rounded-t-md border-2 border-b-0 border-green-700 bg-bg-0" />
        <Coin className="h-10 w-10 text-title-m" />
        <CoinRain key={round} target={purse} delay={0.3} />
      </span>
    </div>
  )
}
