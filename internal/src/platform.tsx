import { useEffect, useSyncExternalStore } from 'react'
import { platform } from '@shared/store'
import type { Actor } from '@shared/store'
import { notice } from './components/app/Notice'
import { currentMemberId } from './session'
import type { PlatformState, StudyType as SharedType } from '@shared/types'
import type { StudyType } from './components/app/StudyTypeTag'

/**
 * The internal console's window onto the shared platform (../../shared).
 *
 * The console holds no data of its own. Every study, person, client,
 * payment, ticket and team member is the shared store's, every count and
 * total is shared/derive.ts, and every decision the team takes goes through
 * shared/store.ts, which refuses an illegal one with a reason and writes it
 * to the activity log under the team member's name.
 */
export function usePlatform(): PlatformState {
  const p = platform()
  return useSyncExternalStore(p.subscribe, p.getState)
}

/** Runs the platform's simulated server steps while the console is open (shared/platform.ts, TIMINGS). */
export function PlatformClock() {
  useEffect(() => {
    const t = setInterval(() => platform().tick(), 1000)
    return () => clearInterval(t)
  }, [])
  return null
}

/**
 * Who is acting: the team member signed in to the console (session.ts).
 * Every decision is taken as them, and shared/store.ts writes it to the
 * activity log under their name. The id is read at the moment of the action.
 */
export const TEAM: Actor = { kind: 'team', get id() { return currentMemberId() } }

/** The console's study type names, as its type tag draws them. */
export const consoleType = (t: SharedType): StudyType =>
  ({ survey: 'survey', video_call: 'video', group_video_call: 'video-group', in_person: 'in-person', in_person_group: 'in-person-group', diary: 'diary' } as const)[t]

/** The six studies the console's frames were drawn around have their own crops; any other study shows its own picture. */
const CROPS: Record<string, { thumb: string; image: string; small: string }> = {
  'st-goal': { thumb: '/img/manage/st-goal-thumb.png', image: '/img/manage/st-goal.png', small: '/img/studies/goal-tracking-40.png' },
  'st-pay': { thumb: '/img/manage/st-pay-thumb.png', image: '/img/manage/st-pay.png', small: '/img/studies/digital-payments-40.png' },
  'st-sleep': { thumb: '/img/manage/st-sleep-thumb.png', image: '/img/manage/st-sleep.png', small: '/img/studies/sleep-cycle-40.png' },
  'st-fitness': { thumb: '/img/manage/st-fitness-thumb.png', image: '/img/manage/st-fitness.png', small: '/img/studies/fitness-tracker-40.png' },
  'st-travel': { thumb: '/img/manage/st-travel-thumb.png', image: '/img/manage/st-travel.png', small: '/img/studies/travel-preferences-40.png' },
  'st-social': { thumb: '/img/manage/st-social-thumb.png', image: '/img/manage/st-social.png', small: '/img/studies/social-media-40.png' },
}
/** A study with no drawn picture gets the review thumbnail, never an empty src. */
const NO_PICTURE = '/img/review/thumbnail.png'
export const studyPictures = (id: string, fallback?: string) => CROPS[id] ?? { thumb: fallback || NO_PICTURE, image: fallback || NO_PICTURE, small: fallback || NO_PICTURE }

/** A refused move says why. */
export const say = (res: { ok: boolean; why?: string }, toast?: (m: string) => void): boolean => {
  if (!res.ok && res.why) (toast ?? notice)(res.why)
  return res.ok
}
