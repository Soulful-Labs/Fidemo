import { sharedPhoto } from '@shared/derive'
import { initialFor } from '@shared/avatar'
import { useMemo } from 'react'
import { participantReviews, personById, shortName, tierOf, trustScoreOf } from '@shared/derive'
import { isLive } from '@shared/lifecycle'
import { count, dayOrToday } from '@shared/format'
import type { Person, PlatformState } from '@shared/types'
import type { StudyType } from '../components/app/StudyTypeTag'
import type { Tier } from '../components/app/TierTag'
import { consoleType, studyPictures, usePlatform } from '../platform'
import { TIER_MENU } from '@shared/lifecycle'

/**
 * All Participants (Active 1992:101341, Deactivated 2003:134529), read from
 * the shared platform: every person, their score and tier from the policy,
 * active or deactivated as the platform holds them.
 */
export interface Participant {
  id: string; photo: string; name: string; role: string; industry: string; score: string; tier: Tier; gender: string; location: string; date: string
  /** What the list's filters read (22 Oct 2026): the date shown, whether the profession is verified, and the languages. */
  at: string; professionVerified: boolean; languages: string[]
}

const TIER_NAME: Record<'silver' | 'gold' | 'platinum', Tier> = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }

/**
 * The picture the console shows for a participant: theirs only while they
 * consent to share it (sharedPhoto), and otherwise their initial. It used to
 * fall back to the portraits the frames were drawn with; a stock face beside
 * a real participant's name is neither theirs nor consented to.
 */
export const photoFor = (p: Pick<Person, 'name' | 'photo' | 'photoConsent'>): string => sharedPhoto(p) ?? initialFor(p.name)

export const tierName = (state: PlatformState, id: string): Tier => TIER_NAME[tierOf(state, id)]

export const participantRow = (state: PlatformState, p: Person): Participant => ({
  id: p.id, photo: photoFor(p), name: p.name, role: p.profile.occupation, industry: p.profile.industry,
  score: String(trustScoreOf(state, p.id)), tier: tierName(state, p.id), gender: p.profile.gender, location: p.location,
  date: dayOrToday(p.status === 'deactivated' ? p.statusNote?.at : p.lastActiveAt),
  at: (p.status === 'deactivated' ? p.statusNote?.at : p.lastActiveAt) ?? '',
  professionVerified: p.profession.state === 'verified', languages: p.profile.languages,
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
  tier: ['Tier: All', ...TIER_MENU.filter((m) => m.tier).map((m) => m.label)],
}

/** Advanced Filters (2003:133781): four fields, each with the values drawn as chips. */
export const ADVANCED = [
  { label: 'Roles', placeholder: 'Select roles', chips: [] as string[] },
  { label: 'Domain', placeholder: 'Select domains', chips: [] as string[] },
  { label: 'Location', placeholder: 'Select city, country', chips: [] as string[] },
  { label: 'Language', placeholder: 'Select languages', chips: [] as string[] },
]

/**
 * Reviews of one participant: what each client said of them on a study, and
 * under it what they said of the client back. From the participations.
 */
export function useParticipantReviews(personId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const person = personId ? personById(state, personId) : undefined
    const rows = (personId ? participantReviews(state, personId) : []).map((r) => ({
      study: r.study, stars: r.stars, score: r.stars.toFixed(1), at: r.at,
      date: new Date(r.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      text: r.comment, client: r.client, back: r.back, backScore: r.back ? r.back.toFixed(1) : '', reply: r.reply,
    }))
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
