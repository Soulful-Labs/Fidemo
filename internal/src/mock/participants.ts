import { useMemo } from 'react'
import { clientById, personById, shortName, tierOf, trustScoreOf } from '@shared/derive'
import { isLive } from '@shared/lifecycle'
import { count, dayOrToday } from '@shared/format'
import type { Person, PlatformState } from '@shared/types'
import type { StudyType } from '../components/app/StudyTypeTag'
import type { Tier } from '../components/app/TierTag'
import { consoleType, studyPictures, usePlatform } from '../platform'

/**
 * All Participants (Active 1992:101341, Deactivated 2003:134529), read from
 * the shared platform: every person, their score and tier from the policy,
 * active or deactivated as the platform holds them.
 */
export interface Participant { id: string; photo: string; name: string; role: string; industry: string; score: string; tier: Tier; gender: string; location: string; date: string }

const TIER_NAME: Record<'silver' | 'gold' | 'platinum', Tier> = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }

/** The ten portraits the frames were drawn with, five of each; a person keeps the same one on every screen. */
const MEN = [1, 2, 5, 7, 9], WOMEN = [3, 4, 6, 8, 10]
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0)
export const photoFor = (p: Pick<Person, 'id' | 'photo' | 'profile'>): string => {
  if (p.photo) return p.photo
  const pool = p.profile.gender === 'Female' ? WOMEN : MEN
  return `/img/participants/p${pool[hash(p.id) % pool.length]}.png`
}

export const tierName = (state: PlatformState, id: string): Tier => TIER_NAME[tierOf(state, id)]

export const participantRow = (state: PlatformState, p: Person): Participant => ({
  id: p.id, photo: photoFor(p), name: p.name, role: p.profile.occupation, industry: p.profile.industry,
  score: String(trustScoreOf(state, p.id)), tier: tierName(state, p.id), gender: p.profile.gender, location: p.location,
  date: dayOrToday(p.status === 'deactivated' ? p.statusNote?.at : p.lastActiveAt),
})

export function useParticipants(tab: 'active' | 'deactivated') {
  const state = usePlatform()
  return useMemo(() => {
    const rows = state.people
      .filter((p) => (tab === 'deactivated' ? p.status === 'deactivated' : p.status !== 'deactivated'))
      .sort((a, b) => (tab === 'deactivated' ? (b.statusNote?.at ?? '').localeCompare(a.statusNote?.at ?? '') : b.lastActiveAt.localeCompare(a.lastActiveAt)))
      .map((p) => participantRow(state, p))
    return { rows, count: `${count(rows.length)} ${tab} participants` }
  }, [state, tab])
}

/** The four dropdowns' menus, drawn loose on the section canvas (2003:133961, 2003:134036, 2003:134101, 2003:134356). */
export const FILTERS = {
  lastActive: ['Last Active: All', 'Today', 'Last 7 days', 'This Month', 'Last 30 days', 'Last 3 months'],
  profession: ['Profession verified', 'All', 'Profession Verified'],
  gender: ['Gender: All', 'Male', 'Female', 'Other'],
  tier: ['Tier: All', 'Platinum (90+ score)', 'Gold (70 to 90 score)', 'Silver (up to 70 score)'],
}

/** Advanced Filters (2003:133781): four fields, each with the values drawn as chips. */
export const ADVANCED = [
  { label: 'Roles', placeholder: 'Select roles', chips: ['Physician'] },
  { label: 'Domain', placeholder: 'Select domains', chips: ['Healthcare', 'Pharma', 'Fitness & Nutrition'] },
  { label: 'Location', placeholder: 'Select city, country', chips: ['New York, US'] },
  { label: 'Language', placeholder: 'Select languages', chips: ['English'] },
]

/**
 * Reviews of one participant: what each client said of them on a study, and
 * under it what they said of the client back. From the participations.
 */
export function useParticipantReviews(personId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const person = personId ? personById(state, personId) : undefined
    const rows = state.studies.flatMap((s) => s.participations.filter((p) => p.personId === personId && p.rating).map((p) => {
      const back = p.clientReview ? Math.round((p.clientReview.reliability + p.clientReview.communication) / 2) : 0
      return {
        study: s.title, stars: p.rating!.stars, score: p.rating!.stars.toFixed(1), at: p.rating!.at,
        date: new Date(p.rating!.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        text: p.rating!.comment ?? '', client: clientById(state, s.clientId)?.company ?? '',
        back, backScore: back ? back.toFixed(1) : '', reply: p.clientReview?.comment ?? '',
      }
    })).sort((a, b) => b.at.localeCompare(a.at))
    return { name: person?.name ?? '', rows }
  }, [state, personId])
}

/** Invite To Study: the live studies an invitation can be for. */
export function useInviteStudies() {
  const state = usePlatform()
  return useMemo(() => state.studies.filter((s) => isLive(s.state)).slice(0, 12).map((s) => ({
    id: s.id, title: s.title, type: consoleType(s.type) as StudyType, thumb: studyPictures(s.id, s.image).thumb, industry: s.industry,
  })), [state])
}

export { shortName }
