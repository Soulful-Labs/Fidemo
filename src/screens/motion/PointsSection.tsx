import { useRef, useState } from 'react'
import PointsEarned from '../../app/PointsEarned'
import RollingNumber from '../../components/motion/RollingNumber'
import { PointsCoin } from '../../components/ui/icons'
import { points } from '../../lib/format'
import { POINTS } from '../../lib/rules'
import type { PointsEntry } from '../../mock/types'
import { Group, Play, Plays, Stage } from './LabBits'

const GAINS: { label: string; amount: number; kind: PointsEntry['kind']; detail: string }[] = [
  { label: `Study +${POINTS.STUDY_COMPLETION}`, amount: POINTS.STUDY_COMPLETION, kind: 'study', detail: '' },
  { label: `Streak +${POINTS.STREAK}`, amount: POINTS.STREAK, kind: 'streak', detail: '' },
  { label: `Referral +${POINTS.REFERRAL}`, amount: POINTS.REFERRAL, kind: 'referral', detail: 'Ada' },
]

/** A: points arriving. The badge, the roll-up scaled to the gain, the +X, the pulse, and the earned modal. */
export function PointsSection() {
  const [balance, setBalance] = useState(1250)
  const [earned, setEarned] = useState<PointsEntry | null>(null)
  const chip = useRef<HTMLSpanElement>(null)

  return (
    <Group letter="A" title="Points arriving">
      <Stage alt>
        <span ref={chip} className="flex h-tag items-center gap-2 self-start rounded-full border-1 border-green-900 bg-green-900/40 px-3 text-body-medium text-brand-secondary">
          <PointsCoin className="h-5 w-5 text-brand-secondary" />
          <RollingNumber value={balance} format={points} float />
        </span>
      </Stage>
      <Plays>
        {GAINS.map((g) => <Play key={g.label} onClick={() => setBalance((b) => b + g.amount)}>{g.label}</Play>)}
        <Play onClick={() => setBalance((b) => b + POINTS.REFERRAL * 10)}>Ten referrals at once</Play>
      </Plays>
      <Plays>
        {GAINS.map((g) => (
          <Play key={g.kind} onClick={() => setEarned({ id: `demo-${Date.now()}`, kind: g.kind, label: g.label, detail: g.detail, at: new Date().toISOString(), amount: g.amount })}>
            Earned modal, {g.kind}
          </Play>
        ))}
      </Plays>
      <PointsEarned entry={earned} onClose={() => setEarned(null)} />
    </Group>
  )
}
