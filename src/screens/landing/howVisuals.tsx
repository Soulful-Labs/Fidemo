import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { Coin } from './shared'

/** Step 1: an ID card is scanned, and a green tick is stamped onto it. Everything stays inside the card. */
export function VerifyVisual() {
  return (
    <div className="relative flex h-24 w-40 gap-3 overflow-hidden rounded-md border-2 border-text-disabled bg-bg-1 p-3">
      <span className="h-10 w-10 shrink-0 rounded-sm bg-text-disabled" />
      <span className="flex flex-1 flex-col gap-2 pt-1">
        <span className="h-2 w-full rounded-full bg-text-disabled" />
        <span className="h-2 w-2/3 rounded-full bg-stroke-3" />
      </span>
      <span className="ld-stamp absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-state-success text-text-title">
        <Check className="h-5 w-5" />
      </span>
      <span data-decor aria-hidden="true" className="ld-scan absolute inset-x-0 top-0 h-1 bg-brand-secondary" />
    </div>
  )
}

/** Step 2: three studies on the table, and the one that fits you lifts out of the row. */
export function MatchVisual() {
  const card = 'flex h-24 w-16 flex-col gap-2 rounded-md border-2 bg-bg-1 p-2'
  const lines = <><span className="h-1.5 rounded-full bg-stroke-3" /><span className="h-1.5 w-2/3 rounded-full bg-stroke-3" /></>
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={cn(card, 'ld-side border-stroke-3')}><span className="h-8 rounded-sm bg-stroke-3" />{lines}</span>
      <span className={cn(card, 'ld-pick border-brand-primary')}>
        <span className="flex h-8 items-center justify-center rounded-sm bg-brand-primary text-cta-primaryText"><Check className="h-5 w-5" /></span>
        {lines}
      </span>
      <span className={cn(card, 'ld-side border-stroke-3')}><span className="h-8 rounded-sm bg-stroke-3" />{lines}</span>
    </div>
  )
}

/** Step 3: three questions, answered one after another. */
export function AnswerVisual() {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {['w-24', 'w-32', 'w-20'].map((w, i) => (
        <span key={w} className="flex h-9 w-52 items-center gap-3 rounded-full border-2 border-stroke-3 bg-bg-1 px-3">
          <span className="ld-answer flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-green-900" style={{ animationDelay: `${i * 0.55}s` }}>
            <Check className="h-3 w-3" />
          </span>
          <span className={cn('h-2 rounded-full bg-text-disabled', w)} />
        </span>
      ))}
    </div>
  )
}

/** Step 4: a coin drops into a wallet, again and again. The drop is short, so the coin never leaves the stage. */
export function PaidVisual() {
  return (
    <div className="flex flex-col items-center pt-12">
      <span className="relative flex h-16 w-28 items-center justify-center rounded-lg border-2 border-green-700 bg-green-900">
        <span className="text-title-l text-brand-secondary">$</span>
        <span data-decor aria-hidden="true" className="ld-drop absolute -top-4 left-1/2 -ml-4"><Coin className="h-8 w-8 text-body-large" /></span>
      </span>
    </div>
  )
}
