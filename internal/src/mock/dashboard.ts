import { useMemo } from 'react'
import { billing, clientById, consoleDashboard, counts, personById, shortName, ticketOwnerName } from '@shared/derive'
import { ago, count, money } from '@shared/format'
import { studyPictures, usePlatform } from '../platform'

/**
 * The Dashboard's pending actions, read from the shared platform. Every tile,
 * tab count and group count is shared/derive.ts consoleDashboard, so they
 * agree with each other and with every list they lead to.
 */

export interface Kpi { value: string; label: string }

export interface ActionRow {
  id: string
  title: string
  /** The grey words after the title, separated by a dot ("Participant", "Nordic Field Labs"). */
  meta?: string
  /** Second line. Several parts are joined with a dot. */
  detail: string[]
  /** "124 screeners": the first part of the second line in title colour. */
  lead?: string
  thumb?: string
  when: string
  to: string
}

export interface ActionGroup {
  key: string
  title: string
  count: string
  /** Drawn collapsed: the chevron points down and the rows are hidden in the frame. */
  collapsed?: boolean
  viewAll: string
  rows: ActionRow[]
}

export type TabKey = 'all' | 'onboarding' | 'studies' | 'support' | 'manage'

const PENDING = 'Pending screeners applications to be reviewed for study'
/** Each group shows its first rows; View All opens the whole queue. */
const FIRST = 2

export function useDashboard() {
  const state = usePlatform()
  return useMemo(() => {
    const d = consoleDashboard(state)
    const now = new Date()

    const identity: ActionGroup = {
      key: 'identity', title: 'Identity Verification', count: String(d.checks.length), viewAll: '/participants/verifications',
      rows: d.checks.slice(0, FIRST).map((c) => ({
        id: c.id, title: c.person.name, meta: c.kind === 'profession' ? 'Profession Credential' : undefined,
        detail: [c.check.reason ?? 'Flagged for manual review.'], when: ago(c.check.flaggedAt, now), to: `/participants/verifications/${c.id}`,
      })),
    }
    const business: ActionGroup = {
      key: 'client-business', title: 'Client-Business Verification', count: String(d.business.length), viewAll: '/clients/verifications',
      rows: d.business.slice(0, FIRST).map((c) => ({ id: c.id, title: c.company, detail: [c.business.reason ?? ''], when: ago(c.business.flaggedAt, now), to: `/clients/verifications/cv-${c.id}` })),
    }
    // Screeners, grouped by study: the studies with the most waiting first.
    const byStudy = new Map<string, number>()
    d.screeners.forEach((c) => byStudy.set(c.study.id, (byStudy.get(c.study.id) ?? 0) + 1))
    const screenerStudies = [...byStudy.entries()].sort((a, b) => b[1] - a[1])
    const screeners: ActionGroup = {
      key: 'screeners', title: 'Screeners to review', count: count(d.screeners.length), viewAll: '/studies?tab=ongoing',
      rows: screenerStudies.slice(0, 3).map(([id, n]) => {
        const s = state.studies.find((x) => x.id === id)!
        const latest = d.screeners.filter((c) => c.study.id === id).map((c) => c.p.events.at(-1)?.at ?? '').sort().at(-1)
        return { id, title: s.title, lead: `${n} screeners`, detail: [PENDING], thumb: studyPictures(id, s.image).small, when: ago(latest, now), to: `/studies/${id}?tab=recruited&view=applications` }
      }),
    }
    const ticketRow = (t: (typeof d.tickets)[number]): ActionRow => ({
      id: t.id, title: ticketOwnerName(state, t), meta: t.owner.kind === 'client' ? 'Client' : 'Participant', detail: [t.subject], when: ago(t.lastActivityAt, now), to: `/support/${t.id}`,
    })
    const tickets: ActionGroup = { key: 'tickets', title: 'New Support Tickets', count: String(d.tickets.length), viewAll: '/support', rows: d.tickets.slice(0, FIRST).map(ticketRow) }
    const noShows: ActionGroup = {
      key: 'no-show', title: 'No-show verifications', count: String(d.noShows.length), viewAll: '/studies?tab=ongoing',
      rows: d.noShows.slice(0, FIRST).map((c) => ({
        id: `${c.study.id}-${c.person.id}`, title: shortName(c.person.name), meta: clientById(state, c.study.clientId)?.company,
        detail: ['Marked as No-show by the client'], when: ago(c.p.events.find((e) => e.label === 'No Show')?.at, now), to: `/studies/${c.study.id}/respondents/${c.person.id}`,
      })),
    }
    const refunds: ActionGroup = {
      key: 'refunds', title: 'Refunds for unfilled studies', count: String(d.refunds.length), viewAll: '/finance/refunds',
      rows: d.refunds.slice(0, FIRST).map((r) => ({
        id: r.study.id, title: `${money(r.amount)} refund`, meta: `${r.study.title}, ${r.client?.company ?? ''}`,
        detail: [`Study completed underfilled by ${r.shortfall} participants`], when: ago(r.study.completedAt, now), to: `/finance/refunds/${r.study.id}`,
      })),
    }
    // The team notification raised when a study finishes: its payouts are ready, and are processed by hand on Finance, Payouts.
    const payouts: ActionGroup = {
      key: 'payouts', title: 'Payouts ready to process', count: String(d.payouts.length), viewAll: '/finance/payouts',
      rows: d.payouts.slice(0, FIRST).map((c) => ({
        id: c.study.id, title: c.study.title, meta: c.client?.company,
        detail: [c.notice?.body ?? `${c.owed.length} participant${c.owed.length === 1 ? '' : 's'} to be paid, ${money(c.owed.length * c.study.rates.incentivePer)} in all.`],
        when: ago(c.notice?.at ?? c.study.completedAt, now), to: '/finance/payouts',
      })),
    }
    const flagged: ActionGroup = {
      key: 'flagged', title: 'Flagged/reported accounts', count: String(d.reports.length), viewAll: '/participants/verifications?tab=reported',
      rows: d.reports.slice(0, FIRST).map((r) => {
        const by = r.reportedBy === 'system' ? 'By System (Algo)' : `By Client: ${clientById(state, r.reportedBy)?.company ?? ''},`
        const study = r.studyId ? state.studies.find((s) => s.id === r.studyId)?.title : undefined
        return { id: r.id, title: shortName(personById(state, r.personId)?.name ?? ''), meta: by, detail: [`For ${r.reason}`, ...(study ? [study] : [])], when: ago(r.at, now), to: `/participants/verifications/${r.id}` }
      }),
    }
    const participantsTickets = d.tickets.filter((t) => t.owner.kind === 'participant')
    const clientTickets = d.tickets.filter((t) => t.owner.kind === 'client')

    const GROUPS: Record<TabKey, ActionGroup[]> = {
      all: [payouts, identity, business, screeners, tickets, noShows, refunds, flagged],
      onboarding: [identity, business],
      studies: [screeners, refunds],
      support: [
        { key: 'tickets-participants', title: 'Participants', count: String(participantsTickets.length), viewAll: '/support', rows: participantsTickets.slice(0, FIRST).map(ticketRow) },
        { key: 'tickets-clients', title: 'Client', count: String(clientTickets.length), viewAll: '/support', rows: clientTickets.slice(0, FIRST).map(ticketRow) },
      ],
      // Payouts sit under Manage (22 Oct 2026): processing them is the team's own work, not a study's.
      manage: [noShows, flagged, payouts],
    }
    const KPIS: Kpi[] = [
      { value: count(d.tiles.screenersToReview), label: 'Screeners To Review' },
      { value: count(d.tiles.onboardingToVerify), label: 'Onboarding To Verify' },
      { value: count(d.tiles.openTickets), label: 'Open Tickets' },
      { value: count(d.tiles.liveStudies), label: 'Live studies' },
    ]
    const TABS: { key: TabKey; label: string; count: string }[] = [
      { key: 'all', label: 'All', count: count(d.tabs.all) },
      { key: 'onboarding', label: 'Onboarding', count: count(d.tabs.onboarding) },
      { key: 'studies', label: 'Studies', count: count(d.tabs.studies) },
      { key: 'support', label: 'Support', count: count(d.tabs.support) },
      { key: 'manage', label: 'Manage', count: count(d.tabs.manage) },
    ]
    void billing; void counts
    return { KPIS, TABS, GROUPS, badges: { dashboard: d.tabs.all, support: d.tiles.openTickets } }
  }, [state])
}

/** The tab keys, for screens that only need to know which tabs exist. */
export const TAB_KEYS: TabKey[] = ['all', 'onboarding', 'studies', 'support', 'manage']
