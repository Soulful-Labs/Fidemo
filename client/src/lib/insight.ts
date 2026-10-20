import { billing, counts, paceOf, recruits, sessionSeats, sessionStartOf, unpaidStudies } from '@shared/derive'
import { isLive } from '@shared/lifecycle'
import type { PlatformState } from '@shared/types'
import type { ClientStudy } from '../platform'
import type { StudyType } from './studyTypes'

/**
 * What the client app can honestly say about how things are going, worked out
 * from records the platform already holds: completions against time, bookings,
 * applications waiting, ratings not given and balances owed. Nothing here is
 * a forecast model and nothing is written into the seed; where there is not
 * enough to say something, it says nothing.
 */
/** A study's pace (shared/derive.ts, so the console's Overview says the same). */
export { paceOf }

export interface SessionRow { key: string; at: Date; title: string; type: StudyType; study: string; details: string; start: string }

/** Every session still to come on the client's live studies, soonest first: each booked one-to-one, and each group session. */
export function upcomingSessions(state: PlatformState, studies: ClientStudy[], now: Date = new Date()): SessionRow[] {
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const rows: SessionRow[] = []
  for (const s of studies.filter((x) => isLive(x.state))) {
    if (s.sessions) {
      sessionSeats(s).forEach((x, i) => rows.push({
        key: `${s.id}-${x.id}`, at: sessionStartOf({ date: x.date, slot: x.slot }), type: s.type, study: s.title,
        title: `Session ${i + 1} with ${x.taken} participant${x.taken === 1 ? '' : 's'}`,
        details: `/studies/${s.id}/recruited`, start: `/studies/${s.id}/recruited`,
      }))
    } else {
      for (const r of recruits(state, s)) {
        const b = r.participation.booking
        if (r.participation.state !== 'scheduled' || !b) continue
        const page = `/studies/${s.id}/respondent/${r.id}/result`
        rows.push({
          key: `${s.id}-${r.id}`, at: sessionStartOf(b), type: s.type, study: s.title,
          title: `${s.type === 'in_person' ? 'In-person session' : 'Video Call'} with ${r.name}.`,
          details: page, start: `${page}?session=running`,
        })
      }
    }
  }
  return rows.filter((r) => r.at >= today).sort((a, b) => a.at.getTime() - b.at.getTime())
}

/** "$26.8K", "$950": a figure short enough for a tile. */
export const compactMoney = (n: number): string => (n >= 10_000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : `$${n.toLocaleString('en-US')}`)

export interface Attention { key: string; figure: string; suffix?: string; title: string; sub: string; to: string; headline: string; body: string; cta: string }

/** The things waiting on the client, most pressing first. Only what is actually waiting is listed. */
export function attention(state: PlatformState, studies: ClientStudy[], now: Date = new Date()): Attention[] {
  const live = studies.filter((s) => isLive(s.state))
  const out: Attention[] = []
  const waiting = live.map((s) => ({ s, n: counts(s).applied })).filter((x) => x.n > 0)
  const applied = waiting.reduce((n, x) => n + x.n, 0)
  if (applied > 0) {
    const first = waiting.sort((a, b) => b.n - a.n)[0]!
    out.push({
      key: 'applied', figure: String(applied), title: 'Applicants awaiting review', sub: `Review the screeners of ${waiting.length} ${waiting.length === 1 ? 'study' : 'studies'}`, to: `/studies/${first.s.id}/recruited`,
      headline: `${first.n} ${first.n === 1 ? 'person is' : 'people are'} waiting on a screener decision for ${first.s.title}.`, body: 'An application can only move on once it is qualified or disqualified.', cta: 'Review Screeners',
    })
  }
  const behind = live.map((s) => ({ s, c: counts(s).completed, p: paceOf(s, counts(s).completed, now) })).filter((x) => x.p?.state === 'behind').sort((a, b) => b.p!.daysToFinish - a.p!.daysToFinish)[0]
  if (behind) {
    out.push({
      key: 'pace', figure: String(behind.c), suffix: `/${behind.s.required}`, title: 'Study is behind pace', sub: behind.s.title, to: `/studies/${behind.s.id}`,
      headline: `${behind.s.title} is behind pace: ${behind.c} of ${behind.s.required} completed with ${behind.s.daysRemaining} days left.`,
      body: `About ${behind.p!.perWeek} completions a week would finish it in time.`, cta: 'Open Study',
    })
  }
  const unpaid = unpaidStudies(studies)
  const owed = unpaid.reduce((n, s) => n + billing(s).outstanding, 0)
  if (unpaid.length > 0) {
    out.push({
      key: 'due', figure: compactMoney(owed), title: `${unpaid.length} ${unpaid.length === 1 ? 'Invoice is' : 'Invoices are'} due`, sub: `Pay the dues of ${unpaid.length} ${unpaid.length === 1 ? 'study' : 'studies'}`, to: '/payments',
      headline: `${compactMoney(owed)} is due on ${unpaid.length} completed ${unpaid.length === 1 ? 'study' : 'studies'}.`, body: 'The balance on a completed study is what is still owed on the people delivered.', cta: 'Pay Invoices',
    })
  }
  const unrated = studies.map((s) => ({ s, n: counts(s).completed - counts(s).rated })).filter((x) => x.n > 0)
  const toRate = unrated.reduce((n, x) => n + x.n, 0)
  if (toRate > 0) {
    out.push({
      key: 'rate', figure: String(toRate), title: 'Participants not rated yet', sub: 'Rate to improve future matching', to: `/studies/${unrated[0]!.s.id}/results`,
      headline: `${toRate} completed ${toRate === 1 ? 'participant has' : 'participants have'} not been rated.`, body: 'A rating feeds the Trust Score that ranks who you are matched with next.', cta: 'Rate Participants',
    })
  }
  const today = upcomingSessions(state, studies, now).filter((r) => r.at.toDateString() === now.toDateString()).length
  if (today > 0) {
    out.push({
      key: 'today', figure: String(today), title: 'Sessions Today', sub: 'Be ready to attend all on-time', to: '/studies/sessions',
      headline: `You have ${today} ${today === 1 ? 'session' : 'sessions'} today.`, body: 'Each one is listed under Studies, Sessions, with its time and who it is with.', cta: 'View Sessions',
    })
  }
  return out
}
