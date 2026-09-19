import { useState } from 'react'
import Button from '../../components/ui/Button'
import Stepper from '../../components/ui/Stepper'
import Tag from '../../components/ui/Tag'
import type { TagTone } from '../../components/ui/Tag'
import Section, { Row } from './Section'

const TONES: TagTone[] = ['neutral', 'yellow', 'green', 'danger', 'blue', 'purple', 'gold', 'platinum', 'silver']

export default function TagsSection({ toast }: { toast: (msg: string) => void }) {
  const [chips, setChips] = useState(['Healthcare', 'Wellness', 'Nutritionist'])
  const [step, setStep] = useState(1)
  const [streak, setStreak] = useState(1)

  return (
    <Section title="Tag and Stepper">
      <Row label="Tones — danger is only ever for something wrong">
        {TONES.map((tone) => (
          <Tag key={tone} tone={tone}>
            {tone}
          </Tag>
        ))}
      </Row>

      <Row label="Statuses in use">
        <Tag tone="yellow">In Review</Tag>
        <Tag tone="green">Paid</Tag>
        <Tag tone="danger">No Show</Tag>
        <Tag tone="danger">Rejected</Tag>
        <Tag tone="blue">In Process</Tag>
        <Tag tone="gold" size="md">Gold, In Top 20%</Tag>
      </Row>

      <Row label="Removable filter chips">
        {chips.length === 0 ? (
          <p className="text-text-regular text-text-body">No filters applied</p>
        ) : (
          chips.map((chip) => (
            <Tag
              key={chip}
              tone="yellow"
              onRemove={() => { setChips((c) => c.filter((x) => x !== chip)); toast(`${chip} removed`) }}
            >
              {chip}
            </Tag>
          ))
        )}
        <Button size="sm" variant="ghost" onClick={() => { setChips(['Healthcare', 'Wellness', 'Nutritionist']); toast('Filters reset') }}>
          Reset
        </Button>
      </Row>

      <Row label={`Stepper bar — step ${step} of 3`}>
        <div className="w-full">
          <Stepper current={step} total={3} />
        </div>
        <Button size="sm" variant="tertiary" onClick={() => setStep((s) => Math.max(1, s - 1))}>
          Back
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setStep((s) => Math.min(3, s + 1))}>
          Next
        </Button>
      </Row>

      <Row label={`Stepper pills — ${streak} of 4 studies`}>
        <div className="w-full">
          <Stepper current={streak} total={4} variant="pills" tone="green" />
        </div>
        <Button size="sm" variant="tertiary" onClick={() => setStreak((s) => (s >= 4 ? 0 : s + 1))}>
          Advance streak
        </Button>
      </Row>
    </Section>
  )
}
