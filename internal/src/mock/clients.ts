import { avatarFor } from '@shared/avatar'
import { useMemo } from 'react'
import {
  billing, businessDecided, businessPending, clientById, clientRating, clientReviews, counts, invoices, paymentStats, studiesOf, studyById, teamById,
} from '@shared/derive'
import { count, dayMonthYear, dayOrToday, money, monthDayYear } from '@shared/format'
import type { Client as PlatformClient, PlatformState } from '@shared/types'
import type { StudyType } from '../components/app/StudyTypeTag'
import { consoleType, studyPictures, usePlatform } from '../platform'
import { billView } from './money'

/**
 * Clients (section 2045:115869) and client business verifications (section
 * 2051:143182), read from the shared platform. Every figure, bill and
 * invoice is shared/derive.ts.
 */
export interface Client { id: string; photo: string; name: string; role: string; company: string; industry: string; location: string; date: string }

/** A client's picture: a drawn, faceless figure from their id, the same on every screen. The frames' portraits were photographs of real faces. */
export const clientPhoto = (_state: PlatformState, id: string): string => avatarFor(id)

const row = (state: PlatformState, c: PlatformClient): Client => ({
  id: c.id, photo: clientPhoto(state, c.id), name: c.name, role: c.role, company: c.company, industry: c.industry, location: c.location,
  date: dayOrToday(c.status === 'deactivated' ? c.statusNote?.at : c.lastActiveAt),
})

export function useClients(tab: 'active' | 'deactivated') {
  const state = usePlatform()
  return useMemo(() => {
    const rows = state.clients.filter((c) => (tab === 'deactivated' ? c.status === 'deactivated' : c.status !== 'deactivated'))
      .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)).map((c) => row(state, c))
    return { rows, count: `${count(rows.length)} ${tab} clients` }
  }, [state, tab])
}

export interface ClientStudy { id: string; name: string; thumb: string; type: StudyType | string; billed: string; required: string; completed: string; date: string }

/** One client: account details, reviews, studies, invoices and cards. */
export function useClientView(id?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const c = (id && clientById(state, id)) || state.clients[0]!
    const studies = studiesOf(state, c.id).filter((s) => s.state !== 'draft')
    const studyRow = (s: (typeof studies)[number]): ClientStudy => ({
      id: s.id, name: s.title, thumb: studyPictures(s.id, s.image).small, type: consoleType(s.type), billed: money(billing(s).totalCost),
      required: String(s.required), completed: String(counts(s).completed), date: dayMonthYear(s.state === 'completed' ? s.completedAt : s.createdAt),
    })
    const all = invoices(studies)
    const stats = paymentStats(studies)
    const rating = clientRating(state, c.id)
    const invoiceRow = (i: (typeof all)[number]) => ({ key: i.number, number: i.number, study: i.study, studyId: i.studyId, date: monthDayYear(i.paid ? i.paidAt ?? i.date : i.date), amount: money(i.amount) })
    return {
      client: c,
      header: { name: c.name, role: c.role, place: c.location, photo: clientPhoto(state, c.id), lastActive: `Last active on ${monthDayYear(c.lastActiveAt)}`, email: c.email },
      ACCOUNT: [['Work Email', c.email], ['Role', c.role || 'N/A'], ['Company Name', c.company || 'N/A'], ['Tax ID', c.taxId || 'Not given (optional)'],
        ['Company Website', c.website || 'N/A'], ['Industry', c.industry || 'N/A'], ['Location', c.location || 'N/A']],
      rating: { score: rating.rating.toFixed(1), of: `of ${count(rating.reviewCount)} reviews` },
      REVIEWS: clientReviews(state, c.id).map((r) => ({
        study: r.study, stars: r.stars, score: r.stars.toFixed(1), date: new Date(r.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        text: r.comment ?? '', to: r.participant.name, toId: r.participant.id, back: r.participant.stars, backScore: r.participant.stars.toFixed(1), reply: r.participant.comment ?? '',
      })),
      ONGOING: studies.filter((s) => s.state !== 'completed' && s.state !== 'cancelled').map(studyRow),
      COMPLETED: studies.filter((s) => s.state === 'completed' || s.state === 'cancelled').map(studyRow),
      PENDING: all.filter((i) => !i.paid).map(invoiceRow),
      PAID: all.filter((i) => i.paid).map(invoiceRow),
      stats: [
        { label: 'Due Payments', value: money(stats.due), note: `of ${stats.dueStudies} studies`, tint: true },
        { label: 'All Time Spent', value: money(stats.spent), note: `for ${stats.spentStudies} studies` },
        { label: 'Average Study Cost', value: money(stats.average), note: `from ${stats.averageStudies} studies` },
      ],
      cards: c.cards,
      deactivated: c.status === 'deactivated', statusNote: c.statusNote,
    }
  }, [state, id])
}

/** The invoice panel: one study's bill, paid or to pay. */
export function useInvoice(studyId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const s = studyId ? studyById(state, studyId) : undefined
    if (!s) return undefined
    return { study: s, type: consoleType(s.type), ...billView(s, clientById(state, s.clientId)) }
  }, [state, studyId])
}

/** Client business checks: pending and decided. */
export interface ClientCheck { id: string; photo: string; name: string; role: string; date: string; reason: string; result?: string }

export function useClientChecks() {
  const state = usePlatform()
  return useMemo(() => ({
    CLIENT_PENDING: businessPending(state).map((c): ClientCheck => ({ id: `cv-${c.id}`, photo: clientPhoto(state, c.id), name: c.name, role: c.role, date: monthDayYear(c.business.flaggedAt), reason: c.business.reason ?? '' })),
    CLIENT_HISTORY: businessDecided(state).map((c): ClientCheck => ({
      id: `cv-${c.id}`, photo: clientPhoto(state, c.id), name: c.name, role: c.role, date: monthDayYear(c.business.decidedAt),
      reason: c.business.state === 'rejected' ? 'Could not verify the business, hence deactivated.' : c.business.note ?? '', result: c.business.state === 'verified' ? 'Verified' : 'Rejected',
    })),
    count: `${count(businessPending(state).length)} pending verifications`,
  }), [state])
}

export function useClientCase(id: string) {
  const state = usePlatform()
  return useMemo(() => {
    const c = clientById(state, id.replace(/^cv-/, '')) ?? state.clients[0]!
    const outcome = c.business.state === 'verified' ? 'verified' as const : c.business.state === 'rejected' ? 'rejected' as const : 'pending' as const
    return { client: c, outcome, decidedBy: teamById(state, c.business.decidedBy)?.name, flaggedAt: monthDayYear(c.business.flaggedAt), decidedAt: monthDayYear(c.business.decidedAt) }
  }, [state, id])
}
