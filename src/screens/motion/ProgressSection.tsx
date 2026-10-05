import { useState } from 'react'
import ProgressBar from '../../components/app/ProgressBar'
import ScoreDial from '../../components/app/ScoreDial'
import { RATING_DELTA, TIERS, TRUST } from '../../lib/rules'
import { forgetSeen } from '../../lib/seen'
import { Avatar } from '../profile/Profile'
import { Group, Play, Plays, Stage } from './LabBits'

const STUDY = TRUST.STUDY_COMPLETION + RATING_DELTA[5]

/** D: progress. Bars, the dial and the ring move from where they were, stagger, and mark a threshold. */
export function ProgressSection() {
  const [bar, setBar] = useState(40)
  const [score, setScore] = useState(TIERS.gold - 3)
  const [ring, setRing] = useState(60)
  const [batch, setBatch] = useState(0)

  return (
    <Group letter="D" title="Progress">
      <Stage>
        <ProgressBar value={bar} label="A bar" caption={`${bar} of 100`} />
        <Plays>
          <Play onClick={() => setBar((b) => Math.min(100, b + 15))}>+15</Play>
          <Play onClick={() => setBar(100)}>Reach the end</Play>
          <Play onClick={() => setBar(40)}>Back to 40</Play>
        </Plays>
      </Stage>
      <Stage>
        <div key={batch} className="flex flex-col gap-3">
          {[72, 88, 64, 95].map((v, i) => <ProgressBar key={i} value={v} tone="green" size="sm" memory={`lab-batch-${i}`} />)}
        </div>
        <Plays>
          <Play onClick={() => setBatch((n) => n + 1)}>Remount, from where they were</Play>
          <Play onClick={() => { forgetSeen(':lab-batch-'); setBatch((n) => n + 1) }}>Remount, first sight</Play>
        </Plays>
      </Stage>
      <Stage>
        <div className="flex items-center gap-4">
          <ScoreDial score={score} size="sm" memory="lab-dial" />
          <Avatar name="Ada Lovelace" completion={ring} />
        </div>
        <Plays>
          <Play onClick={() => setScore((s) => Math.min(TRUST.MAX, s + STUDY))}>5 star study +{STUDY}</Play>
          <Play onClick={() => setScore(TIERS.gold - 3)}>Reset dial</Play>
          <Play onClick={() => setRing((r) => Math.min(100, r + 20))}>Profile +20%</Play>
          <Play onClick={() => setRing(60)}>Reset ring</Play>
        </Plays>
      </Stage>
    </Group>
  )
}
