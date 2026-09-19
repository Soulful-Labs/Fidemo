import { useState } from 'react'
import Button from '../../components/ui/Button'
import type { ButtonVariant } from '../../components/ui/Button'
import { ChevronRight, Info } from '../../components/ui/icons'
import Section, { Row } from './Section'

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger', 'ghost']

export default function ButtonsSection({ toast }: { toast: (msg: string) => void }) {
  const [loading, setLoading] = useState(false)

  const runLoading = () => {
    setLoading(true)
    // 600ms is the brief's "feels like a server" delay.
    setTimeout(() => {
      setLoading(false)
      toast('Finished loading')
    }, 600)
  }

  return (
    <Section title="Button">
      <Row label="Variants, size lg (48px)">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v} onClick={() => toast(`${v} pressed`)}>
            {v}
          </Button>
        ))}
      </Row>

      <Row label="Disabled">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v} disabled onClick={() => toast('unreachable')}>
            {v}
          </Button>
        ))}
      </Row>

      <Row label="Sizes">
        <Button size="lg" onClick={() => toast('lg pressed')}>
          lg 48px
        </Button>
        <Button size="md" variant="secondary" onClick={() => toast('md pressed')}>
          md 38px
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast('sm pressed')}>
          sm 24px
        </Button>
      </Row>

      <Row label="With icons, loading, full width">
        <Button size="md" leftIcon={<Info />} variant="tertiary" onClick={() => toast('Left icon')}>
          Left icon
        </Button>
        <Button size="md" rightIcon={<ChevronRight />} variant="secondary" onClick={() => toast('Right icon')}>
          Right icon
        </Button>
        <Button loading={loading} onClick={runLoading} fullWidth>
          {loading ? 'Loading' : 'Tap to load 600ms'}
        </Button>
      </Row>

      <Row label="Disabled but explains itself on tap (rule 7)">
        <Button
          size="md"
          variant="tertiary"
          disabled
          onBlocked={() => toast('Can be rescheduled twice only, before at least 24 hours')}
        >
          Reschedule
        </Button>
      </Row>
    </Section>
  )
}
