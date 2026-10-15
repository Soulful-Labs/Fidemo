import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { invoiceNumber, invoices, studiesOf, teamById, ticketsOf } from '@shared/derive'
import { ago, clockTime, dayOrToday, monthDayYear } from '@shared/format'
import { TIMINGS } from '@shared/platform'
import { platform } from '@shared/store'
import type { PlatformState, SavedCard, Ticket as PlatformTicket } from '@shared/types'
import { usePlatform } from '../platform'
import { useSession } from './session'
import type { Ticket } from './help'
import { NOTIFICATIONS } from './dashboard'
import type { NotificationRow } from './dashboard'

/**
 * Everything the client owns that is not a study.
 *
 * Tickets, saved cards and which invoices are paid are the platform's: they
 * are read from the shared store and changed through it, so a ticket raised
 * here is the ticket the console answers. This app's own notification list is
 * the only thing still held here, because no other app has it.
 */

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

interface Local { notifications: NotificationRow[] }

interface Ctx extends Local {
  tickets: TicketRecord[]
  cards: SavedCard[]
  paidInvoices: string[]
  /** Raising a ticket returns its id so the success dialog can open the chat. */
  raiseTicket: (input: { subject: string; message: string }) => string
  replyToTicket: (id: string, text: string, attachment?: string) => void
  solveTicket: (id: string) => void
  addCard: (card: Omit<SavedCard, 'isDefault'>) => void
  /** Edits a saved card, or replaces it with another; the result says why when it cannot. */
  updateCard: (last4: string, card: Omit<SavedCard, 'isDefault'>) => { ok: boolean; why?: string }
  removeCard: (last4: string) => void
  setDefaultCard: (last4: string) => void
  payInvoice: (number: string) => void
  markNotificationsRead: () => void
  markNotificationRead: (id: string) => void
}

const WorkspaceCtx = createContext<Ctx | null>(null)

/** A platform ticket as the Tickets table and the chat write it. */
function ticketRow(state: PlatformState, t: PlatformTicket): TicketRecord {
  const last = t.messages.at(-1)!
  const who = last.from === 'user' ? 'You' : last.from === 'team' ? (teamById(state, last.by)?.name.split(' ')[0] ?? 'Support') : 'Assistant'
  return {
    id: t.id, subject: t.subject, message: t.message, number: t.id,
    last: `${who}: ${last.text.slice(0, 90)}${last.text.length > 90 ? '…' : ''}`,
    unread: t.status === 'open' && last.from !== 'user', status: t.status === 'open' ? 'Open' : 'Closed',
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
    () => byAccount[key] ?? (account?.seeded ? { notifications: NOTIFICATIONS } : { notifications: [] }),
    [byAccount, key, account?.seeded],
  )

  const patch = useCallback((fn: (cur: Local) => Local) => {
    setByAccount((m) => ({ ...m, [key]: fn(m[key] ?? w) }))
  }, [key, w])

  const tickets = useMemo(() => ticketsOf(state, 'client', clientId).map((t) => ticketRow(state, t)), [state, clientId])
  const client = state.clients.find((c) => c.id === clientId)
  const mine = useMemo(() => studiesOf(state, clientId), [state, clientId])
  const paidInvoices = useMemo(() => invoices(mine).filter((i) => i.paid).map((i) => i.number), [mine])

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
  const updateCard = useCallback<Ctx['updateCard']>((last4, card) => platform().updateCard(clientId, last4, card), [clientId])
  const removeCard = useCallback<Ctx['removeCard']>((last4) => { platform().removeCard(clientId, last4) }, [clientId])
  const setDefaultCard = useCallback<Ctx['setDefaultCard']>((last4) => { platform().setDefaultCard(clientId, last4) }, [clientId])

  /** Paying an invoice pays the balance on its study; the invoice is paid because the study no longer owes. */
  const payInvoice = useCallback<Ctx['payInvoice']>((number) => {
    const study = mine.find((s) => invoiceNumber(s) === number)
    if (study) platform().payBalance(study.id)
  }, [mine])

  /**
   * What the platform has told this client (a study finishing, so far), newest
   * first, above this app's own rows. These are stored on the platform, so
   * they arrive in any tab and their read state is the platform's.
   */
  const platformRows = useMemo<NotificationRow[]>(() => (client?.notifications ?? []).map((n) => {
    const study = n.studyId ? state.studies.find((s) => s.id === n.studyId) : undefined
    return {
      id: n.id, icon: 'completion', title: n.title, body: n.body, emphasis: study?.title, ago: ago(n.at),
      unread: !n.read, action: study ? 'View Payouts' : undefined, to: study ? `/studies/${study.id}/pay` : undefined,
    }
  }), [client?.notifications, state.studies])
  const notifications = useMemo(() => [...platformRows, ...w.notifications], [platformRows, w.notifications])

  const markNotificationsRead = useCallback(() => {
    if (platformRows.some((n) => n.unread)) platform().markClientNoticesRead(clientId)
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => ({ ...n, unread: false })) }))
  }, [patch, platformRows, clientId])

  const markNotificationRead = useCallback<Ctx['markNotificationRead']>((id) => {
    if (platformRows.some((n) => n.id === id)) { platform().markClientNoticesRead(clientId, id); return }
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) }))
  }, [patch, platformRows, clientId])

  const value = useMemo<Ctx>(() => ({
    ...w, notifications, tickets, cards: client?.cards ?? [], paidInvoices,
    raiseTicket, replyToTicket, solveTicket,
    addCard, updateCard, removeCard, setDefaultCard, payInvoice,
    markNotificationsRead, markNotificationRead,
  }), [w, notifications, tickets, client?.cards, paidInvoices, raiseTicket, replyToTicket,
    solveTicket, addCard, updateCard, removeCard, setDefaultCard, payInvoice, markNotificationsRead, markNotificationRead])

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx)
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider')
  return ctx
}
