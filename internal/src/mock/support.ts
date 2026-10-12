import { useMemo } from 'react'
import { awaitingTeam, teamById, ticketOwnerName, ticketStage, ticketsIn } from '@shared/derive'
import { clockTime, count, dayHeading, monthDayYear, monthDayYearTime } from '@shared/format'
import type { PlatformState, Ticket as PlatformTicket } from '@shared/types'
import { usePlatform } from '../platform'

/**
 * Support (section 2036:160943), read from the shared platform: one queue
 * for participants and clients, the same tickets the respondent and client
 * apps raise. New has no reply from a person yet, Ongoing has, Closed is
 * closed (shared/derive.ts ticketStage).
 */
export interface Ticket { id: string; subject: string; who: string; last: string; from: string; date: string; created: string; number: string; unread?: boolean }

const speaker = (state: PlatformState, t: PlatformTicket, m: PlatformTicket['messages'][number]) =>
  m.from === 'user' ? ticketOwnerName(state, t).split(' ')[0] ?? '' : m.from === 'auto' ? 'Assistant' : teamById(state, m.by)?.name.split(' ')[0] ?? 'Team'

export function useSupportList(tab: 'new' | 'ongoing' | 'closed') {
  const state = usePlatform()
  return useMemo(() => {
    const rows: Ticket[] = ticketsIn(state, tab).map((t) => {
      const last = t.messages.at(-1)!
      return {
        id: t.id, subject: t.subject, who: speaker(state, t, last), last: last.text, from: ticketOwnerName(state, t),
        date: monthDayYear(t.lastActivityAt), created: monthDayYear(t.createdAt), number: t.id, unread: awaitingTeam(t),
      }
    })
    const HEADING = { new: ['Pending Tickets', count(rows.length)], ongoing: ['Ongoing Tickets', `${count(rows.length)} messages`], closed: ['Completed Tickets', count(rows.length)] }[tab]
    return { rows, HEADING }
  }, [state, tab])
}

export function useTicket(id?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const t = state.tickets.find((x) => x.id === id) ?? state.tickets[0]!
    return {
      ticket: t, stage: ticketStage(t), owner: ticketOwnerName(state, t),
      day: dayHeading(t.createdAt),
      messages: t.messages.map((m) => ({ ...m, time: clockTime(m.at), who: speaker(state, t, m) })),
      closedAt: monthDayYearTime(t.closedAt),
      profile: t.owner.kind === 'client' ? `/clients/${t.owner.id}` : `/participants/${t.owner.id}`,
      /** What the ticket is about, when the team opened it from a verification. */
      about: t.createdByTeam && t.owner.kind === 'participant' ? `/participants/verifications/iv-${t.owner.id}` : undefined,
    }
  }, [state, id])
}

/** The person or client a Create Ticket email belongs to. */
export function ownerByEmail(state: PlatformState, email: string): PlatformTicket['owner'] | undefined {
  const clean = email.trim().toLowerCase()
  const p = state.people.find((x) => x.email.toLowerCase() === clean)
  if (p) return { kind: 'participant', id: p.id }
  const c = state.clients.find((x) => x.email.toLowerCase() === clean)
  return c ? { kind: 'client', id: c.id } : undefined
}
