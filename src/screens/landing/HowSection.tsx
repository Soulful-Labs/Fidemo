import type { ReactNode } from 'react'
import { AnswerVisual, MatchVisual, PaidVisual, VerifyVisual } from './howVisuals'
import { Heading, Pager, Section, at, useRowIndex } from './shared'

const STEPS: { title: string; body: string; visual: ReactNode }[] = [
  { title: 'Prove you are real', body: 'Upload your ID once. It earns you a Human Certificate.', visual: <VerifyVisual /> },
  { title: 'Get matched', body: 'We show you studies that fit your work and background.', visual: <MatchVisual /> },
  { title: 'Take part', body: 'Answer a survey, join a call, show up in person or keep a diary.', visual: <AnswerVisual /> },
  { title: 'Get paid', body: 'Your reward lands in your wallet. Withdraw it to your bank.', visual: <PaidVisual /> },
]

/**
 * How it works: four steps as a row of cards you swipe through, each with a
 * small scene that acts the step out instead of an icon. The next card always
 * peeks in from the right edge, so the swipe is discoverable without a hint.
 */
export default function HowSection() {
  const { row, index, onScroll } = useRowIndex(STEPS.length)
  return (
    <Section id="how" className="justify-center gap-6 bg-bg-0 pb-28 pt-12">
      <Heading>How it works</Heading>

      <div ref={row} onScroll={onScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 pt-1">
        {STEPS.map((s, i) => (
          <div key={s.title} style={at(1 + i)} className="ld-in ld-right flex w-5/6 shrink-0 snap-center flex-col gap-4 rounded-xl bg-bg-1 p-4">
            <div className="relative h-56 overflow-hidden rounded-lg bg-bg-0">
              <span aria-hidden="true" className="absolute left-3 top-2 text-display text-yellow-1000">{i + 1}</span>
              {s.visual}
            </div>
            <div className="flex flex-col gap-2 pb-1">
              <h3 className="text-title-l text-text-title">{s.title}</h3>
              <p className="text-body-regular text-text-body">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <Pager count={STEPS.length} index={index} />
    </Section>
  )
}
