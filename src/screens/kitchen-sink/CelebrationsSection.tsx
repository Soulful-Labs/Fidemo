import { useState } from 'react'
import PointsEarned from '../../app/PointsEarned'
import TierUpgrade from '../../app/TierUpgrade'
import Button from '../../components/ui/Button'
import type { PointsEntry, User } from '../../mock/types'
import Section, { Row } from './Section'

const SAMPLE: PointsEntry = { id: 'ks', kind: 'bonus', label: 'Bonus', detail: 'Joined by referral', at: new Date().toISOString(), amount: 100 }

/** The tier upgrade screens (Silver is never reached in the app, so it lives here) and the points earned modal. */
export default function CelebrationsSection() {
  const [tier, setTier] = useState<User['tier'] | null>(null)
  const [points, setPoints] = useState<PointsEntry | null>(null)
  return (
    <Section title="Celebrations">
      <Row label="Tier upgrade">
        <div className="flex gap-2">
          {(['silver', 'gold', 'platinum'] as const).map((t) => (
            <Button key={t} size="md" variant="secondary" onClick={() => setTier(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Button>
          ))}
        </div>
      </Row>
      <Row label="Points earned">
        <Button size="md" variant="secondary" onClick={() => setPoints(SAMPLE)}>Open</Button>
      </Row>
      <TierUpgrade tier={tier} score={tier === 'platinum' ? 90 : tier === 'gold' ? 70 : 50} onClose={() => setTier(null)} />
      <PointsEarned entry={points} onClose={() => setPoints(null)} />
    </Section>
  )
}
