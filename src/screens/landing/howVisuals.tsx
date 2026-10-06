import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { Coin } from './shared'

/** Step 1: an ID card is scanned, and a green tick is stamped onto it. Everything stays inside the card. */
export function VerifyVisual() {
  return (
    <div className="relative flex h-16 w-24 gap-2 overflow-hidden rounded-sm border-2 border-text-disabled bg-bg-1 p-2">
      <span className="h-6 w-6 shrink-0 rounded-none bg-text-disabled" />
      <span className="flex flex-1 flex-col gap-1.5 pt-0.5">
        <span className="h-1.5 w-full rounded-full bg-text-disabled" />
        <span className="h-1.5 w-2/3 rounded-full bg-stroke-3" />
      </span>
      <span className="ld-stamp absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-state-success text-text-title">
        <Check className="h-4 w-4" />
      </span>
      <span data-decor aria-hidden="true" className="ld-scan absolute inset-x-0 top-0 h-0.5 bg-brand-secondary" />
    </div>
  )
}

/** Step 2: three studies on the table, and the one that fits you lifts out of the row. */
export function MatchVisual() {
  const card = 'flex h-14 w-8 flex-col gap-1 rounded-none border-2 bg-bg-1 p-1'
  const line = <span className="h-1 rounded-full bg-stroke-3" />
  return (
    <div className="flex items-center justify-center gap-2">
      <span className={cn(card, 'ld-side border-stroke-3')}><span className="h-4 bg-stroke-3" />{line}</span>
      <span className={cn(card, 'ld-pick border-brand-primary')}>
        <span className="flex h-4 items-center justify-center bg-brand-primary text-cta-primaryText"><Check className="h-3 w-3" /></span>
        {line}
      </span>
      <span className={cn(card, 'ld-side border-stroke-3')}><span className="h-4 bg-stroke-3" />{line}</span>
    </div>
  )
}

/** Step 3: three questions, answered one after another. */
export function AnswerVisual() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      {['w-10', 'w-14', 'w-8'].map((w, i) => (
        <span key={w} className="flex h-6 w-24 items-center gap-2 rounded-full border-2 border-stroke-3 bg-bg-1 px-1.5">
          <span className="ld-answer flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-brand-secondary" style={{ animationDelay: `${i * 0.55}s` }} />
          <span className={cn('h-1.5 rounded-full bg-text-disabled', w)} />
        </span>
      ))}
    </div>
  )
}

/** Step 4: a coin drops into a wallet, again and again. The drop is short, so the coin never leaves the stage. */
export function PaidVisual() {
  return (
    <div className="flex flex-col items-center pt-8">
      <span className="relative flex h-10 w-16 items-center justify-center rounded-sm border-2 border-green-700 bg-green-900">
        <span className="text-body-large text-brand-secondary">$</span>
        <span data-decor aria-hidden="true" className="ld-drop absolute -top-3 left-1/2 -ml-3"><Coin className="h-6 w-6 text-label" /></span>
      </span>
    </div>
  )
}
