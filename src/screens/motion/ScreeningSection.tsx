import { useState } from 'react'
import StateBanner, { bannerFor } from '../../screens/studies/detail/StateBanner'
import { useStore } from '../../mock/store'
import type { StudyStatus } from '../../mock/types'
import { SCREENS, useScreenPlayer } from './CompletionSection'
import { Group, Play, Plays } from './LabBits'

const KINDS = { invited_to_schedule: 'qualified', paid: 'earned', rejected: 'calm' } as const

/**
 * G: the screening result, both ways. Qualified pops in with a band of
 * light; not qualified settles in slowly and never reads as a failure.
 * The banners use a real study from the store with its status swapped.
 */
export function ScreeningSection() {
  const { studies } = useStore()
  const { play, node } = useScreenPlayer()
  const [shown, setShown] = useState<{ status: keyof typeof KINDS; n: number } | null>(null)
  const study = studies[0]
  const content = shown && bannerFor({ ...study, status: shown.status as StudyStatus })

  return (
    <Group letter="G" title="Screening result">
      <Plays>
        <Play onClick={() => play(SCREENS.applied)}>Applied successfully</Play>
        <Play onClick={() => play(SCREENS.notMatch)}>Not a match this time</Play>
      </Plays>
      {shown && content && <StateBanner key={shown.n} content={content} replay={KINDS[shown.status]} />}
      <Plays>
        <Play onClick={() => setShown((s) => ({ status: 'invited_to_schedule', n: (s?.n ?? 0) + 1 }))}>Qualified banner</Play>
        <Play onClick={() => setShown((s) => ({ status: 'rejected', n: (s?.n ?? 0) + 1 }))}>Rejected banner</Play>
        <Play onClick={() => setShown((s) => ({ status: 'paid', n: (s?.n ?? 0) + 1 }))}>Paid banner (F)</Play>
      </Plays>
      {node}
    </Group>
  )
}
