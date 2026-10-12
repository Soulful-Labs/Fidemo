import { createContext, useContext, useMemo } from 'react'
import { billing, clientById, durationLabel, paymentStats, sessionSeats, studiesOf, studyById, teamById } from '@shared/derive'
import { monthDayYear, monthDayYearTime, money } from '@shared/format'
import type { PlatformState, PreScreenQuestion, Question as SharedQuestion, Study } from '@shared/types'
import { consoleType, studyPictures, usePlatform } from '../platform'
import { clientPhoto } from './clients'
import { addressOf, cardDay, slotRange } from './recruiting'

/**
 * Review a new study (section 1982:104844), read from the study under review
 * in the shared platform: what the client entered on each of the Create
 * flow's steps, its price, its deposit and the changes already asked for.
 * Approving it or sending it back moves this study (shared/store.ts).
 */
export type AudiencePill = { label?: string; value: string; icon?: 'users' | 'pin' }
export type Verdict = 'Correct' | 'Incorrect' | 'May Select' | 'Must Select'
export interface Question { kind: string; prompt: string; answers?: [string, Verdict][]; placeholder?: string }

const KIND: Record<SharedQuestion['kind'], string> = { single: 'Single-select', multi: 'Multi-select', text: 'Single-line input', image: 'Image upload', scale: 'Rating scale' }

/** A pre-screener question marks its passing answers Correct and the rest Incorrect (workflow 28). */
const preQuestion = (q: PreScreenQuestion): Question => ({ kind: 'Single-select', prompt: q.prompt, answers: q.options.map((o) => [o, q.passing.includes(o) ? 'Correct' : 'Incorrect']) })
/** A screener or task question: the options the participant will choose from; none is right or wrong. */
const question = (q: SharedQuestion): Question => q.kind === 'text'
  ? { kind: KIND.text, prompt: q.prompt, placeholder: q.placeholder ?? 'Participants will enter a short text response here…' }
  : q.kind === 'image'
    ? { kind: KIND.image, prompt: q.prompt, placeholder: 'Participants will upload an image here…' }
    : { kind: KIND[q.kind], prompt: q.prompt, answers: q.options.map((o) => [o, 'May Select'] as [string, Verdict]) }

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function review(state: PlatformState, s: Study) {
  const client = clientById(state, s.clientId)
  const bill = billing(s)
  const deposit = s.payments.filter((p) => p.kind === 'deposit')
  const depositPaid = deposit.reduce((a, p) => a + p.amount, 0)
  const pics = studyPictures(s.id, s.image)
  const stats = paymentStats(studiesOf(state, s.clientId))
  const audience = s.setup?.audience ?? [{ value: String(s.required), icon: 'people' }, { label: 'Roles', value: s.targetProfession }]
  const pill = (a: { label?: string; value: string; icon?: string }): AudiencePill => ({ label: a.label ? `${a.label}:` : undefined, value: a.value, icon: a.icon === 'people' ? 'users' : a.icon === 'pin' ? 'pin' : undefined })
  const work = new Set(['Work Functions', 'Roles', 'Industry', 'Skills'])
  const conditions = new Set(['Profile Tiers', 'Condition'])
  const group = (f: (label?: string) => boolean) => audience.filter((a) => f(a.label)).map(pill)

  /** One-to-one availability: the open days, by weekday, from the first slot to the end of the last. */
  const byDay = new Map<string, string[]>()
  for (const a of s.availability ?? []) {
    const day = WEEKDAYS[(new Date(a.date).getDay() + 6) % 7]!
    if (a.slots.length) byDay.set(day, [...(byDay.get(day) ?? []), `${a.slots[0]}|${slotRange(a.slots.at(-1)!, s.durationMins).split(' - ')[1]}`])
  }
  const week = WEEKDAYS.filter((d) => byDay.has(d)).map((d) => [d, [...new Set(byDay.get(d))].map((r) => r.split('|') as [string, string])] as [string, [string, string][]])
  const location = s.locations?.[0]
  const seats = sessionSeats(s)

  return {
    REVIEW: {
      title: s.title, thumb: pics.thumb, participants: String(s.required), cost: money(bill.totalCost),
      submitted: monthDayYearTime(s.submittedAt ?? s.createdAt),
      about: { description: s.description, studyTime: durationLabel(s.durationMins), thumbnail: pics.thumb },
    },
    type: consoleType(s.type),
    CLIENT: {
      id: s.clientId, name: client?.name ?? '', role: client?.role ?? '', email: client?.email ?? '', avatar: clientPhoto(state, s.clientId),
      workspace: [['Company Name', client?.company ?? ''], ['VAT No.', client?.vat ?? ''], ['Website', client?.website ?? ''], ['Industry', client?.industry ?? ''], ['Location', client?.location ?? '']],
      metrics: [['Completed studies', String(stats.spentStudies)], ['Total spent', money(stats.spent)],
        ['Verification', client?.business.state === 'verified' ? 'Business Verified' : client?.business.state === 'flagged' ? 'Business check pending' : 'Not verified'],
        ['Member since', monthDayYear(client?.joinedAt)]],
    },
    AUDIENCE: [
      { heading: 'Target Audience', gap: 'tight' as const, pills: group((l) => !l || (!work.has(l) && !conditions.has(l))) },
      { heading: 'Work details', gap: 'loose' as const, pills: group((l) => Boolean(l && work.has(l))) },
      { heading: 'Conditions to apply', gap: 'tight' as const, pills: group((l) => Boolean(l && conditions.has(l))) },
    ].filter((g) => g.pills.length > 0),
    screener: [...s.preScreener.map(preQuestion), ...s.screener.map(question)],
    screenerLabels: [...s.preScreener.map((_, i) => `Pre-screener - Q${i + 1}`), ...s.screener.map((_, i) => `Q${s.preScreener.length + i + 1}`)],
    tasks: (s.tasks ?? []).map(question),
    DIARY: s.diary && {
      setup: [['Duration Unit:', 'Days'], ['Frequency:', 'Every day'], ['Study Duration:', `${s.diary.totalDays} days`], ['Minimum Required:', `${s.diary.minDays} days`]],
      days: Array.from({ length: s.diary.totalDays }, (_, i) => `DAY ${i + 1}`),
    },
    week,
    dates: (s.availability ?? []).map((a) => [cardDay(a.date), `${a.slots.length} slot${a.slots.length === 1 ? '' : 's'}`] as [string, string]),
    ADDRESS: location && { name: location.label, line: location.address },
    GROUP: {
      seats: `${s.sessions?.[0]?.seats ?? 0} seats`,
      sessions: seats.map((x, i) => [`Session ${i + 1}`, cardDay(x.date), slotRange(x.slot, s.durationMins), addressOf(s, x.locationId) ?? ''] as [string, string, string, string]),
    },
    PAYMENT: {
      totalCost: money(bill.totalCost), depositPaid: money(depositPaid), incentive: money(s.rates.incentivePer), suggested: `Suggested: ${money(s.rates.incentivePer)}`,
      card: client?.cards.find((c) => c.isDefault)?.last4 ?? client?.cards[0]?.last4 ?? '—',
      billing: [
        { label: 'Platform Fee', amount: money(s.rates.platformFee) },
        { label: 'Recruiting Fee', detail: `${money(s.rates.recruitingPer)} x ${s.required} participants`, amount: money(s.rates.recruitingPer * s.required), info: true },
        { label: 'Incentives', detail: `${money(s.rates.incentivePer)} x ${s.required} participants`, amount: money(s.rates.incentivePer * s.required), info: true },
        { label: 'Moderation Fee', detail: `${money(s.rates.moderationPer)} x ${s.required} participants`, amount: money(s.rates.moderationPer * s.required), info: true },
      ],
      totals: [
        { label: 'Total cost', amount: money(bill.totalCost) },
        { label: 'Less: Incentive Deposit', detail: `${money(s.rates.incentivePer)} x ${s.required} participants`, amount: `-${money(depositPaid)}`, info: true },
      ],
      net: { label: 'Net payable cost', amount: money(Math.max(0, bill.totalCost - depositPaid)) },
      transactions: deposit.map((p) => ({ title: 'Incentive Deposit Paid', amount: money(p.amount), when: monthDayYearTime(p.at), detail: `${money(s.rates.incentivePer)} x ${s.required} participants` })),
    },
    REVISIONS: {
      requested: [...s.revisions].reverse().map((r) => ({ title: 'Requested changes.', by: teamById(state, r.by)?.name, greeting: `Hey ${client?.name.split(' ')[0] ?? ''},`, text: r.text, when: monthDayYearTime(r.at) })),
      created: { title: 'Created and submitted the study for review.', when: monthDayYearTime(s.submittedAt ?? s.createdAt) },
    },
  }
}
export type ReviewView = ReturnType<typeof review>

export function useReviewData(id?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const s = studyById(state, id) ?? state.studies.find((x) => x.state === 'in_review') ?? state.studies[0]!
    return review(state, s)
  }, [state, id])
}

export const ReviewContext = createContext<ReviewView | null>(null)
/** The study under review, for the tabs inside ReviewStudy. */
export const useReview = (): ReviewView => useContext(ReviewContext)!
