import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { invoiceNumber, invoices, rankedPool, studiesOf, teamById, ticketsOf } from '@shared/derive'
import { clockTime, dayOrToday, monthDayYear } from '@shared/format'
import { TIMINGS } from '@shared/platform'
import { platform } from '@shared/store'
import type { PlatformState, SavedCard, Ticket as PlatformTicket } from '@shared/types'
import { usePlatform } from '../platform'
import { useSession } from './session'
import { MY_PANELS } from './pool'
import type { PanelCard } from './pool'
import type { Ticket } from './help'
import { NOTIFICATIONS } from './dashboard'
import type { NotificationRow } from './dashboard'

/**
 * Everything the client owns that is not a study.
 *
 * Tickets, saved cards and which invoices are paid are the platform's: they
 * are read from the shared store and changed through it, so a ticket raised
 * here is the ticket the console answers. Micro-panels and this app's own
 * notification list are the only things still held here, because no other
 * app has them; their members are people from the shared pool.
 */

export interface Panel extends PanelCard {
  /** Who is in it, so Members and the count are the same thing. */
  memberIds: string[]
  criteria?: { label: string; value: string }[]
}

export interface ChatMessage {
  id: string
  from: 'client' | 'support'
  /** The automatic first answer (workflow 56), which the frame badges. */
  auto?: boolean
  lines: string[]
  at: string
  attachment?: string
}

export interface TicketRecord extends Ticket {
  message: string
  day: string
  messages: ChatMessage[]
}

export type { SavedCard } from '@shared/types'

interface Local { panels: Panel[]; notifications: NotificationRow[] }

interface Ctx extends Local {
  tickets: TicketRecord[]
  cards: SavedCard[]
  paidInvoices: string[]
  createPanel: (input: { title: string; domain: string; roles: string; memberIds?: string[]; criteria?: Panel['criteria'] }) => string
  updatePanel: (id: string, patch: Partial<Panel>) => void
  deletePanel: (id: string) => void
  addToPanel: (panelId: string, personId: string) => { ok: boolean; why?: string }
  /** Raising a ticket returns its id so the success dialog can open the chat. */
  raiseTicket: (input: { subject: string; message: string }) => string
  replyToTicket: (id: string, text: string, attachment?: string) => void
  solveTicket: (id: string) => void
  addCard: (card: Omit<SavedCard, 'isDefault'>) => void
  removeCard: (last4: string) => void
  setDefaultCard: (last4: string) => void
  payInvoice: (number: string) => void
  markNotificationsRead: () => void
  markNotificationRead: (id: string) => void
}

const WorkspaceCtx = createContext<Ctx | null>(null)

const today = () => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/** The seeded account's panels: the frame's five cards, holding the first few people the pool ranks. */
const seededPanels = (state: PlatformState): Panel[] => {
  const ids = rankedPool(state).map((p) => p.id)
  return MY_PANELS.map((p, i) => ({ ...p, memberIds: ids.slice(0, 3 + i), members: `${3 + i} members` }))
}

/** A platform ticket as the Tickets table and the chat write it. */
function ticketRow(state: PlatformState, t: PlatformTicket): TicketRecord {
  const last = t.messages.at(-1)!
  const who = last.from === 'user' ? 'You' : last.from === 'team' ? (teamById(state, last.by)?.name.split(' ')[0] ?? 'Support') : 'Assistant'
  return {
    id: t.id, subject: t.subject, message: t.message, number: t.id,
    last: `${who}: ${last.text.slice(0, 90)}${last.text.length > 90 ? '…' : ''}`,
    unread: t.status === 'open' && last.from !== 'user', status: t.status === 'open' ? 'Open' : 'Solved',
    activity: dayOrToday(t.lastActivityAt), created: monthDayYear(t.createdAt), day: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' }),
    messages: t.messages.map((m) => ({
      id: m.id, from: m.from === 'user' ? 'client' as const : 'support' as const, auto: m.from === 'auto' || undefined,
      lines: [m.text], at: clockTime(m.at), attachment: m.attachment,
    })),
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const state = usePlatform()
  const { account } = useSession()
  const key = account?.email ?? ''
  const clientId = account?.clientId ?? ''
  const [byAccount, setByAccount] = useState<Record<string, Local>>({})
  const w = useMemo<Local>(
    () => byAccount[key] ?? (account?.seeded ? { panels: seededPanels(platform().getState()), notifications: NOTIFICATIONS } : { panels: [], notifications: [] }),
    [byAccount, key, account?.seeded],
  )

  const patch = useCallback((fn: (cur: Local) => Local) => {
    setByAccount((m) => ({ ...m, [key]: fn(m[key] ?? w) }))
  }, [key, w])

  const tickets = useMemo(() => ticketsOf(state, 'client', clientId).map((t) => ticketRow(state, t)), [state, clientId])
  const client = state.clients.find((c) => c.id === clientId)
  const mine = useMemo(() => studiesOf(state, clientId), [state, clientId])
  const paidInvoices = useMemo(() => invoices(mine).filter((i) => i.paid).map((i) => i.number), [mine])

  const createPanel = useCallback<Ctx['createPanel']>((input) => {
    const id = `panel-${Date.now().toString(36)}`
    patch((cur) => ({
      ...cur,
      panels: [{
        id, title: input.title || 'Untitled micro-panel', domain: input.domain || 'Healthcare', roles: input.roles,
        members: `${(input.memberIds ?? []).length} members`, updated: `Updated on ${today()}`,
        memberIds: input.memberIds ?? [], criteria: input.criteria,
      }, ...cur.panels],
    }))
    return id
  }, [patch])

  const updatePanel = useCallback<Ctx['updatePanel']>((id, p) => {
    patch((cur) => ({ ...cur, panels: cur.panels.map((x) => (x.id === id ? { ...x, ...p, updated: `Updated on ${today()}` } : x)) }))
  }, [patch])

  const deletePanel = useCallback<Ctx['deletePanel']>((id) => {
    patch((cur) => ({ ...cur, panels: cur.panels.filter((x) => x.id !== id) }))
  }, [patch])

  const addToPanel = useCallback<Ctx['addToPanel']>((panelId, personId) => {
    const panel = w.panels.find((x) => x.id === panelId)
    if (!panel) return { ok: false, why: 'No such micro-panel' }
    if (panel.memberIds.includes(personId)) return { ok: false, why: 'They are already in this panel' }
    patch((cur) => ({
      ...cur,
      panels: cur.panels.map((x) => (x.id === panelId
        ? { ...x, memberIds: [...x.memberIds, personId], members: `${x.memberIds.length + 1} members`, updated: `Updated on ${today()}` }
        : x)),
    }))
    return { ok: true }
  }, [patch, w.panels])

  /** Workflow 56: the ticket goes to the platform, the first answer is automatic, and a person follows from the console. */
  const raiseTicket = useCallback<Ctx['raiseTicket']>(({ subject, message }) => {
    const made = platform().createTicket({ kind: 'client', id: clientId }, { subject, message })
    if (!made.ok) return ''
    setTimeout(() => platform().replyTicket(made.id, 'auto', 'Thanks for reaching out! Our team and assistants will review this and reach out to you shortly.'), TIMINGS.autoReply)
    return made.id
  }, [clientId])

  const replyToTicket = useCallback<Ctx['replyToTicket']>((id, text, attachment) => {
    platform().replyTicket(id, 'user', text, { kind: 'client', id: clientId }, attachment)
  }, [clientId])

  const solveTicket = useCallback<Ctx['solveTicket']>((id) => { platform().resolveTicket(id) }, [])
  const addCard = useCallback<Ctx['addCard']>((card) => { platform().addCard(clientId, card) }, [clientId])
  const removeCard = useCallback<Ctx['removeCard']>((last4) => { platform().removeCard(clientId, last4) }, [clientId])
  const setDefaultCard = useCallback<Ctx['setDefaultCard']>((last4) => { platform().setDefaultCard(clientId, last4) }, [clientId])

  /** Paying an invoice pays the balance on its study; the invoice is paid because the study no longer owes. */
  const payInvoice = useCallback<Ctx['payInvoice']>((number) => {
    const study = mine.find((s) => invoiceNumber(s) === number)
    if (study) platform().payBalance(study.id)
  }, [mine])

  const markNotificationsRead = useCallback(() => {
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => ({ ...n, unread: false })) }))
  }, [patch])

  const markNotificationRead = useCallback<Ctx['markNotificationRead']>((id) => {
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) }))
  }, [patch])

  const value = useMemo<Ctx>(() => ({
    ...w, tickets, cards: client?.cards ?? [], paidInvoices,
    createPanel, updatePanel, deletePanel, addToPanel,
    raiseTicket, replyToTicket, solveTicket,
    addCard, removeCard, setDefaultCard, payInvoice,
    markNotificationsRead, markNotificationRead,
  }), [w, tickets, client?.cards, paidInvoices, createPanel, updatePanel, deletePanel, addToPanel, raiseTicket, replyToTicket,
    solveTicket, addCard, removeCard, setDefaultCard, payInvoice, markNotificationsRead, markNotificationRead])

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx)
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider')
  return ctx
}
