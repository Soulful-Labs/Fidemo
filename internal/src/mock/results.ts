import { useMemo } from 'react'
import { averageScore, personById, profileCard, recruit, recruits, sessionSeats, studyCertificate } from '@shared/derive'
import { monthDayYear, monthDayYearTime } from '@shared/format'
import { DEMO_SESSION_CODE } from '@shared/platform'
import type { Participation, PlatformState, Question, Study } from '@shared/types'
import type { Tier } from '../components/app/TierTag'
import { usePlatform } from '../platform'
import { TIER_NAME, addressOf, longDay, slotRange, startOf } from './recruiting'

/**
 * Results, the respondent page and the session page (turn 7 frames), read
 * from the study's real participations: who completed, who was a no-show,
 * their answers, their activity, their rating, and the study's own session
 * code and certificate.
 */
export interface ResultRow { id: string; name: string; first: string; role: string; date: string; score: string; tier: Tier; rated: boolean; session: string; time: string; rating?: Participation['rating'] }
export type Tile = [label: string, value: string, rest?: string]

export type Answer =
  | { q: string; prompt: string; text: string }
  | { q: string; prompt: string; bullets: string[] }
  | { q: string; prompt: string; ordered: string[] }
  | { q: string; prompt: string; file: [string, string] }
  | { q: string; prompt: string; matrix: { cols: string[]; rows: [string, number][] } }

export interface ActivityItem { text: string; bold?: string; when: string; sub?: [string, string][]; strong?: boolean }

const isGroup = (s: Study) => s.type === 'group_video_call' || s.type === 'in_person_group'
const isInPerson = (s: Study) => s.type === 'in_person' || s.type === 'in_person_group'

/** The session code a participation carries; the platform's code until a booking generates one. */
export const codeOf = (p?: Participation) => p?.code?.value ?? DEMO_SESSION_CODE

export function results(state: PlatformState, study: Study) {
  const done = recruits(state, study, 'results').filter((r) => r.participation.state === 'completed')
  const sessions = sessionSeats(study).map((x, i) => ({ id: x.id, code: `S${i + 1}`, when: `${monthDayYear(x.date)}, ${x.slot}`, people: x.people, date: x.date, slot: x.slot }))
  const rows: ResultRow[] = done.map((r) => ({
    id: r.id, name: r.name, first: r.name.split(' ')[0] ?? r.name, role: r.role, date: monthDayYear(r.participation.completedAt), score: String(r.score), tier: TIER_NAME[r.tier],
    rated: Boolean(r.participation.rating), rating: r.participation.rating, time: r.participation.booking?.slot ?? '',
    session: sessions.find((x) => x.id === r.participation.booking?.sessionId)?.code ?? '',
  }))
  const rated = rows.filter((r) => r.rated).length
  const avg = String(averageScore(state, study))
  const needed = `/${study.required} required`
  const heldSessions = sessionSeats(study)
  const sessionsDone = heldSessions.filter((x) => study.participations.some((p) => p.booking?.sessionId === x.id && p.state === 'completed')).length
  const tiles: Tile[] = isGroup(study)
    ? [['Completed', String(rows.length), needed], ['Avg. Trust Score', avg]]
    : study.type === 'in_person'
      ? [['Sessions Completed', String(sessionsDone || rows.length), `/${heldSessions.length || study.required}`], ['Participants Completed', String(rows.length), needed], ['Avg. Trust Score', avg]]
      : [['Completed', String(rows.length), needed], ['Avg. Trust Score', avg], ['Rated By You', String(rated), `/${rows.length} completed`]]
  const summary: [string, string] = isInPerson(study) ? ['Notes Summaries', 'Get all the Notes results archive'] : ['Results Summaries', 'Get AI Summaries of all the results']
  const cert = studyCertificate(state, study)
  const certificate = {
    eyebrow: 'STUDY VERIFICATION CERTIFICATE', title: `${cert.verified} of ${cert.total} completions verified human`,
    body: 'A sealed, signed proof that every respondent in this study passed identity and duplicate checks. Share the check link so your own stakeholders can confirm it independently — no need to trust Focus Insite’s word for it.',
    foot: [`CERT ID · ${cert.id}`, `Issued ${monthDayYear(cert.issuedAt)}`],
  }
  const downloads = sessions.map((x, i) => ({ name: `Session ${i + 1}`, when: `${monthDayYear(x.date)}, ${x.slot}`, detail: [`${x.people.length} participant${x.people.length === 1 ? '' : 's'}`, 'Recordings + Transcript'] }))
  return { rows, sessions, tiles, summary, chevron: study.type !== 'survey' && study.type !== 'video_call', certificate, downloads }
}

export function useResults(study: Study) {
  const state = usePlatform()
  return useMemo(() => results(state, study), [state, study])
}

const answerOf = (q: Question, i: number, prefix: string, value: string | string[] | number | undefined, missing = 'Not answered'): Answer => {
  const base = { q: `${prefix}${i + 1}`, prompt: q.prompt }
  if (Array.isArray(value)) return { ...base, bullets: value }
  // A number question's answer is stored as a number (shared/store.ts); 0 is an answer.
  if (typeof value === 'number') return { ...base, text: String(value) }
  if (value) return { ...base, text: value }
  return { ...base, text: missing }
}

/** One respondent inside one study: who they are, where they are, what they answered and what happened. */
export function respondent(state: PlatformState, study: Study, personId: string) {
  const r = recruit(state, study, personId)
  const person = personById(state, personId)
  const card = profileCard(state, personId)
  if (!r || !person || !card) return undefined
  const p = r.participation
  const years = (n: number) => `${n} year${n === 1 ? '' : 's'}`
  const answers: Answer[] = [
    ...study.preScreener.map((q, i) => answerOf({ id: q.id, kind: 'single', prompt: q.prompt, options: q.options }, i, 'Pre-screener - Q', p.preAnswers?.[q.id] ?? (p.prescreener === 'passed' ? 'Passed' : undefined))),
    ...study.screener.map((q, i) => answerOf(q, i, 'Q', p.answers?.[q.id])),
  ]
  /** A survey's answers, and a diary's for each day filled in, as the participant submitted them (shared/questions.ts). */
  const tasks: Answer[] = (study.tasks ?? []).map((q, i) => answerOf(q, i, 'Q', p.taskAnswers?.[q.id]))
  const days = (p.diaryDays ?? []).map((day) => ({ day, answers: (study.tasks ?? []).map((q, i) => answerOf(q, i, 'Q', p.diaryAnswers?.[String(day)]?.[q.id])) }))
  const activity: ActivityItem[] = p.events.map((e) => ({ text: e.label, when: monthDayYearTime(e.at) }))
  const booking = p.booking
  return {
    id: personId, name: r.name, fullName: r.fullName, first: r.name.split(' ')[0] ?? r.name, role: r.role,
    state: p.state, participation: p, decidedAt: p.decidedAt, rating: p.rating,
    stage: p.state === 'applied' || p.state === 'qualified' || p.state === 'disqualified' || p.state === 'recruited' ? 'applied' as const
      : p.state === 'scheduled' && !(p.booking && Date.now() >= startOf(p.booking.date, p.booking.slot).getTime()) ? 'booked' as const : 'finished' as const,
    answers, tasks, days, activity,
    code: codeOf(p), codeConfirmed: Boolean(p.code?.byParticipant),
    session: booking && {
      date: longDay(booking.date), time: study.type === 'in_person' ? slotRange(booking.slot, study.durationMins) : booking.slot,
      at: `${monthDayYear(booking.date)}, ${booking.slot}`,
      address: isInPerson(study) ? addressOf(study, booking.locationId) : undefined,
    },
    card: {
      role: card.role, facts: [`${years(card.experienceYears)} experience`, card.location, ...(card.certificateId ? [`Cert. ID: ${card.certificateId}`] : [])],
      trust: String(card.score), tier: TIER_NAME[card.tier],
      ratings: [['Expertise', `${card.ratings.expertise}%`, 'green'], ['Reliability', `${card.ratings.reliability}%`, 'blue'], ['Communication', `${card.ratings.communication}%`, 'purple'], ['Success Rate', `${card.ratings.successRate}%`, 'yellow']] as [string, string, 'green' | 'blue' | 'purple' | 'yellow'][],
      about: [['Education', card.about.education || '—'], ['Gender', card.about.gender || '—'], ['Age', card.about.age ? years(card.about.age) : '—']] as [string, string][],
      verified: card.verified,
      metrics: [['Completed Studies', String(card.completedStudies)], ['Earned', `$${card.earned.toLocaleString('en-US')}`], ['Highest Streak', `${card.streaks} month${card.streaks === 1 ? '' : 's'}`]] as [string, string][],
    },
  }
}
export type RespondentView = NonNullable<ReturnType<typeof respondent>>

export function useRespondent(study: Study, personId: string) {
  const state = usePlatform()
  return useMemo(() => respondent(state, study, personId), [state, study, personId])
}

/** A group session: when and where, its seats, the people booked into it and the study's code for them. */
export function session(state: PlatformState, study: Study, sessionId?: string) {
  const all = sessionSeats(study)
  const i = Math.max(0, all.findIndex((x) => x.id === sessionId))
  const x = all[i]
  if (!x) return undefined
  const people = x.people.flatMap((id) => {
    const r = recruit(state, study, id)
    return r ? [{ id, name: r.name, role: r.role, score: String(r.score), tier: TIER_NAME[r.tier], state: r.participation.state, codeConfirmed: Boolean(r.participation.code?.byParticipant), rated: Boolean(r.participation.rating), participation: r.participation }] : []
  })
  const first = study.participations.find((p) => p.booking?.sessionId === x.id && p.code)
  return {
    id: x.id, name: `Session ${i + 1}`, startsAt: x.date, slot: x.slot, date: longDay(x.date), time: isInPerson(study) ? slotRange(x.slot, study.durationMins) : x.slot,
    address: isInPerson(study) ? addressOf(study, x.locationId) : undefined, seats: `${x.taken} / ${x.seats} Seats`,
    code: codeOf(first), people,
  }
}
export type SessionView = NonNullable<ReturnType<typeof session>>

export function useSession(study: Study, sessionId?: string) {
  const state = usePlatform()
  return useMemo(() => session(state, study, sessionId), [state, study, sessionId])
}
