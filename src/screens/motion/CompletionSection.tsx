import { useState } from 'react'
import type { ComponentProps } from 'react'
import SuccessScreen from '../../components/app/SuccessScreen'
import SuccessBadge from '../../components/app/SuccessBadge'
import { Group, Play, Plays } from './LabBits'

type Shown = Omit<ComponentProps<typeof SuccessScreen>, 'onAction'>

/** The success screens as the app shows them, so F and G can be replayed here. */
export const SCREENS: Record<string, Shown> = {
  survey: { title: 'Completed successfully!', body: 'Your survey study has been completed successfully and submitted.' },
  pin: { title: 'Confirmed successfully!', body: 'Your joining attendance is confirmed and verified! You can complete your study if running now.' },
  applied: {
    title: 'Applied successfully!', body: 'Your application for this study has been submitted.',
    steps: [
      'Your application has been sent to be reviewed if you qualify for this study.',
      'Once you get qualified, you will be invited to complete the study.',
      'Earn reward after successful completion of the study!',
    ],
  },
  notMatch: {
    mood: 'calm', badge: <SuccessBadge tone="brand" />, actionLabel: 'Back to Explore',
    title: 'Not a match this time',
    body: "Thanks for checking. This study is looking for a slightly different group, so we won't take you through the full screener.",
    steps: [
      'Nothing has been saved and no draft was created.',
      'It does not affect your Trust Score.',
      'Other studies that match your profile are waiting in Explore.',
    ],
  },
}

/** Plays one of SCREENS full screen over /motion. */
export function useScreenPlayer() {
  const [shown, setShown] = useState<Shown | null>(null)
  const node = shown && (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-0">
      <SuccessScreen {...shown} onAction={() => setShown(null)} />
    </div>
  )
  return { play: (s: Shown) => setShown({ ...s }), node }
}

/** F: completion arrives with weight, then reveals what it earned. */
export function CompletionSection() {
  const { play, node } = useScreenPlayer()
  return (
    <Group letter="F" title="Session and study completion">
      <p className="text-text-regular text-text-body">The earnings arrive a moment later, when the client approves: replay A for that half.</p>
      <Plays>
        <Play onClick={() => play(SCREENS.survey)}>Survey completed</Play>
        <Play onClick={() => play(SCREENS.pin)}>PIN confirmed</Play>
      </Plays>
      {node}
    </Group>
  )
}
