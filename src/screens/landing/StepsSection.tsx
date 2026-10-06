import type { ReactNode } from 'react'
import Marquee from './Marquee'
import { AnswerVisual, MatchVisual, PaidVisual, VerifyVisual } from './howVisuals'
import { Heading, Section } from './shared'

const STEPS: { title: string; body: string; visual: ReactNode }[] = [
  { title: 'Prove you are real', body: 'Upload your ID once.', visual: <VerifyVisual /> },
  { title: 'Get matched', body: 'See studies that fit you.', visual: <MatchVisual /> },
  { title: 'Take part', body: 'Survey, call, visit or diary.', visual: <AnswerVisual /> },
  { title: 'Get paid', body: 'Withdraw to your bank.', visual: <PaidVisual /> },
]

/**
 * What this is and how it works, on one screen: one line that says what it is,
 * then the four steps drifting past as a row of small cards. Each card acts
 * its step out in a little scene of its own.
 */
export default function StepsSection() {
  return (
    <Section id="steps" className="gap-4">
      <Heading>Companies pay for your opinion.</Heading>
      <Marquee label="How it works, four steps">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex w-full flex-col gap-3 rounded-xl bg-bg-1 p-2 pb-4">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-bg-0">{s.visual}</div>
            <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-1000 text-body-large text-brand-primary">{i + 1}</span>
            <span className="flex flex-col gap-1 px-1">
              <span className="text-title-s leading-tight text-text-title">{s.title}</span>
              <span className="text-body-regular text-text-body">{s.body}</span>
            </span>
          </div>
        ))}
      </Marquee>
    </Section>
  )
}
