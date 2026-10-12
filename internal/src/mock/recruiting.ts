import { useMemo } from 'react'
import { personById, profileCard, recruits, sessionSeats } from '@shared/derive'
import { money } from '@shared/format'
import type { PlatformState, Study, Tier as SharedTier } from '@shared/types'
import type { Tier } from '../components/app/TierTag'
import { usePlatform } from '../platform'

/**
 * Matched and Recruited (1952:76970, 1952:77106, 1952:77242, 1952:77337,
 * 1952:81128 and their siblings), read from the study's real participations
 * in the shared platform. Matched and Invited are the participations the
 * platform matched or invited; Applications every one who applied (Applied,
 * Qualified or Disqualified); Scheduled the booked sessions; Sessions a group
 * study's own sessions with the people booked into them.
 */
export interface Match { id: string; initial: string; name: string; role: string; score: string; tier: Tier; verified?: boolean }
export type ApplicationStatus = 'Applied' | 'Qualified' | 'Disqualified'
export interface Application { id: string; name: string; role: string; status: ApplicationStatus; score: string; tier: Tier }
export interface Booking { id: string; name: string; role: string; score: string; tier: Tier; day: string; time: string; join: boolean }
export interface Session { id: string; name: string; day: string; time: string; address?: string; seats: string; people: string }

export const TIER_NAME: Record<SharedTier, Tier> = { silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }

/** "12 Aug, Wed", as the Scheduled table writes a day. */
export const shortDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.toLocaleDateString('en-US', { weekday: 'short' })}`
}
/** "Aug 20, Friday", as a session card writes it. */
export const cardDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(iso).toLocaleDateString('en-US', { weekday: 'long' })
/** "August 12, 2026, Wednesday", as the session card on a respondent page writes it. */
export const longDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ', ' + new Date(iso).toLocaleDateString('en-US', { weekday: 'long' })

/** "10:00 AM" plus the study's length: "10:00 AM - 11:00 AM". */
export function slotRange(slot: string, mins: number): string {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim())
  if (!m) return slot
  const start = ((Number(m[1]) % 12) + (m[3]!.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m[2])
  const end = (start + mins) % (24 * 60)
  const h = Math.floor(end / 60), mm = end % 60
  return `${slot} - ${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** When a booked session starts, as a date. */
export function startOf(date: string, slot: string): Date {
  const d = new Date(date)
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim())
  if (m) d.setHours((Number(m[1]) % 12) + (m[3]!.toUpperCase() === 'PM' ? 12 : 0), Number(m[2]), 0, 0)
  return d
}

export const addressOf = (study: Study, locationId?: string) =>
  study.locations?.find((l) => l.id === locationId)?.address ?? study.locations?.[0]?.address

const statusOf = (state: string): ApplicationStatus => state === 'applied' ? 'Applied' : state === 'disqualified' ? 'Disqualified' : 'Qualified'

export function recruiting(state: PlatformState, study: Study, now = new Date()) {
  const row = (r: ReturnType<typeof recruits>[number]) => ({ id: r.id, name: r.name, role: r.role, score: String(r.score), tier: TIER_NAME[r.tier] })
  const card = (r: ReturnType<typeof recruits>[number]): Match => ({ ...row(r), initial: r.name.slice(0, 1), score: `${r.score}%`, verified: r.professionVerified })
  const byScore = <T extends { score: string }>(a: T, b: T) => Number.parseInt(b.score, 10) - Number.parseInt(a.score, 10)
  const matched = recruits(state, study, 'matched', now).map(card).sort(byScore)
  const invited = recruits(state, study, 'invited', now).map(card).sort(byScore)
  const applications: Application[] = recruits(state, study, 'recruited', now).map((r) => ({ ...row(r), status: statusOf(r.participation.state) }))
  const scheduled: Booking[] = recruits(state, study, undefined, now)
    .filter((r) => r.participation.booking && (r.participation.state === 'scheduled'))
    .sort((a, b) => startOf(a.participation.booking!.date, a.participation.booking!.slot).getTime() - startOf(b.participation.booking!.date, b.participation.booking!.slot).getTime())
    .map((r) => {
      const b = r.participation.booking!
      const start = startOf(b.date, b.slot).getTime()
      return { ...row(r), day: shortDay(b.date), time: b.slot, join: study.type === 'video_call' && now.getTime() >= start - 15 * 60_000 && now.getTime() <= start + study.durationMins * 60_000 }
    })
  const sessions: Session[] = sessionSeats(study).map((x, i) => ({
    id: x.id, name: `Session ${i + 1}`, day: cardDay(x.date), time: slotRange(x.slot, study.durationMins),
    address: study.type === 'in_person_group' ? addressOf(study, x.locationId) : undefined,
    seats: `${x.taken} / ${x.seats} Seats`, people: x.people.map((id) => personById(state, id)?.name.slice(0, 1) ?? '').join(''),
  }))
  return { matched, invited, applications, scheduled, sessions }
}

export function useRecruiting(study: Study) {
  const state = usePlatform()
  return useMemo(() => recruiting(state, study), [state, study])
}

/** Respondent Profile Details (1932:109128): the person, as shared/derive.ts profileCard describes them to the team. */
export function useRespondentProfile(personId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const c = personId ? profileCard(state, personId) : undefined
    if (!c) return undefined
    const years = (n: number) => `${n} year${n === 1 ? '' : 's'}`
    return {
      id: c.id, initial: c.name.slice(0, 1), name: c.name, role: c.role,
      meta: [c.location, `${years(c.experienceYears)} experience`, ...(c.certificateId ? [`Cert. ID: ${c.certificateId}`] : [])],
      trust: String(c.score), score: c.score, tier: TIER_NAME[c.tier],
      ratings: [
        { label: 'Expertise', value: `${c.ratings.expertise}%`, colour: 'green' }, { label: 'Reliability', value: `${c.ratings.reliability}%`, colour: 'blue' },
        { label: 'Communication', value: `${c.ratings.communication}%`, colour: 'purple' }, { label: 'Success Rate', value: `${c.ratings.successRate}%`, colour: 'yellow' },
      ] as { label: string; value: string; colour: 'green' | 'blue' | 'purple' | 'yellow' }[],
      about: [['Occupation', c.about.occupation], ['Industry', c.about.industry], ['Education', c.about.education],
        ['Gender & Age', c.about.age ? `${c.about.gender}  •  ${years(c.about.age)}` : c.about.gender], ['Experience', years(c.experienceYears)], ['Other Interests', c.about.interests || '—']] as [string, string][],
      verified: c.verified,
      metrics: [['Completed Studies', String(c.completedStudies)], ['Earned', money(c.earned)], ['Highest Streak', `${c.streaks} month${c.streaks === 1 ? '' : 's'}`]] as [string, string][],
    }
  }, [state, personId])
}
