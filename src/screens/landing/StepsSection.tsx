import type { ReactNode } from 'react'
import { AnswerVisual, MatchVisual, PaidVisual, VerifyVisual } from './howVisuals'
import { Carousel, Heading, Section } from './shared'

const STEPS: { title: string; body: string; visual: ReactNode }[] = [
  { title: 'Prove you are real', body: 'Upload your ID once.', visual: <VerifyVisual /> },
  { title: 'Get matched', body: 'See studies that fit you.', visual: <MatchVisual /> },
  { title: 'Take part', body: 'A survey, a call, a visit or a diary.', visual: <AnswerVisual /> },
  { title: 'Get paid', body: 'Withdraw to your bank.', visual: <PaidVisual /> },
]

/**
 * What this is and how it works, on one screen: one line that says what it is,
 * then the four steps as whole cards, one at a time. Each card acts its step
 * out in a small scene of its own.
 */
export default function StepsSection() {
  return (
    <Section id="steps" className="gap-4">
      <Heading>Companies pay for your opinion.</Heading>
      <Carousel label="How it works, four steps">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex flex-col gap-4 rounded-xl bg-bg-1 p-4">
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-bg-0">{s.visual}</div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-1000 text-title-m text-brand-primary">{i + 1}</span>
              <span className="flex min-w-0 flex-col">
                <span className="text-title-m leading-tight text-text-title">{s.title}</span>
                <span className="text-body-regular text-text-body">{s.body}</span>
              </span>
            </div>
          </div>
        ))}
      </Carousel>
    </Section>
  )
}
