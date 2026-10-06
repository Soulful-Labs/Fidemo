import { PointsCoin } from '../../components/ui/icons'
import { REDEEM } from '../../lib/rules'
import { WAYS } from '../points/HowPointsWork'
import { Coin, CountUp, Heading, Lead, Pager, Section, at, useRowIndex } from './shared'

const plus = (n: number) => `+${n}`

/** The app's five ways to earn (HowPointsWork), leading with the one every member does: finishing a study. */
const ORDERED = [...WAYS].sort((a, b) => Number(b.title === 'Study Completion') - Number(a.title === 'Study Completion'))

/**
 * What you earn, part one: money and points. The five ways to earn points are
 * the app's own (and the policy's own values), as a row you swipe; under it,
 * what points are worth. Every figure here comes from lib/rules.ts.
 */
export default function EarnSection() {
  const { row, index, onScroll } = useRowIndex(ORDERED.length)
  return (
    <Section id="earn" className="justify-center gap-5 bg-bg-0 bg-yellow-fade pb-28 pt-12">
      <div className="flex flex-col gap-3">
        <Heading>Cash for the study. Points on top.</Heading>
        <Lead i={1}>Every study pays a cash reward. You also collect reward points.</Lead>
      </div>

      <div ref={row} onScroll={onScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 pt-1">
        {ORDERED.map((w, i) => (
          <div key={w.title} style={at(2 + i)} className="ld-in ld-right flex w-3/5 shrink-0 snap-start scroll-ml-4 flex-col gap-2 rounded-xl bg-bg-1 p-4">
            <span className="flex items-center gap-2 text-display-s text-brand-secondary">
              <PointsCoin className="h-8 w-8" />
              <CountUp to={w.value} format={plus} />
            </span>
            <span className="text-body-large text-text-title">{w.title}</span>
            <span className="text-body-regular text-text-body">{w.sub}</span>
          </div>
        ))}
      </div>
      <Pager count={ORDERED.length} index={index} />

      <div style={at(4)} className="ld-in ld-pop mx-4 flex items-center gap-4 rounded-xl bg-bg-1 p-4">
        <span className="flex shrink-0 items-center gap-2">
          <PointsCoin className="h-10 w-10 text-brand-secondary" />
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-text-body" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <Coin className="h-10 w-10 text-title-m" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-title-m leading-tight text-text-title">{REDEEM.PER_USD} points = $1</span>
          <span className="text-body-regular text-text-body">Redeem from {REDEEM.MINIMUM.toLocaleString('en-US')} points.</span>
        </span>
      </div>
    </Section>
  )
}
