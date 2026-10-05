import { useState } from 'react'
import ScoreDial from '../../components/app/ScoreDial'
import ProgressBar from '../../components/app/ProgressBar'
import { TIERS, TRUST, applyTrustDelta } from '../../lib/rules'
import { Group, Play, Plays, Stage } from './LabBits'

const DEDUCTIONS = [
  { label: 'No show', delta: TRUST.NO_SHOW },
  { label: 'Cancelled session', delta: TRUST.CANCELLED_SESSION },
  { label: 'Late show up', delta: TRUST.LATE_SHOW_UP },
  { label: 'Fraud', delta: TRUST.FRAUD },
]

/**
 * E: the four policy deductions. The figure falls into place rather than
 * counting down, the dots go out quickly, a quiet -X settles under the
 * number in the body colour, and nothing shakes, flashes or pulses.
 */
export function DeductionSection() {
  const [score, setScore] = useState(TIERS.gold + 2)
  return (
    <Group letter="E" title="Deductions">
      <Stage>
        <div className="flex items-center gap-4">
          <ScoreDial score={score} size="sm" memory="lab-deduct" />
          <div className="flex flex-1 flex-col gap-2">
            <ProgressBar value={score - TRUST.MIN} max={TRUST.MAX - TRUST.MIN} size="sm" />
          </div>
        </div>
      </Stage>
      <Plays>
        {DEDUCTIONS.map((d) => (
          <Play key={d.label} onClick={() => setScore((s) => applyTrustDelta(s, d.delta))}>{d.label} {d.delta}</Play>
        ))}
        <Play onClick={() => setScore(TIERS.gold + 2)}>Reset to {TIERS.gold + 2}</Play>
      </Plays>
    </Group>
  )
}
