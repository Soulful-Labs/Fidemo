import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useSession } from './session'
import { MY_PANELS, POOL_PEOPLE } from './pool'
import type { PanelCard } from './pool'
import { TICKETS } from './help'
import type { Ticket } from './help'
import { CARDS } from './payments'
import { NOTIFICATIONS } from './dashboard'
import type { NotificationRow } from './dashboard'

/**
 * Everything the client owns that is not a study: their micro-panels, their
 * support tickets, their saved cards and their notifications.
 *
 * Each of these used to be a fixed array a screen read and a toast pretended
 * to change. Raising a ticket left the tickets list empty, creating a panel
 * left My Panels as it was, and paying an invoice changed nothing. They are
 * one state now, keyed by account exactly as the studies are, so a flow that
 * starts on one screen finishes on another.
 */

export interface Panel extends PanelCard {
  /** Who is in it, so Members and the count are the same thing. */
  memberIds: string[]
  criteria?: { label: string; value: string }[]
}

export interface ChatMessage {
  id: string
  from: 'client' | 'support'
  lines: string[]
  at: string
  attachment?: string
}

export interface TicketRecord extends Ticket {
  messages: ChatMessage[]
}

export interface SavedCard { brand: string; last4: string; expires: string; isDefault?: boolean }

interface Workspace {
  panels: Panel[]
  tickets: TicketRecord[]
  cards: SavedCard[]
  notifications: NotificationRow[]
  paidInvoices: string[]
}

interface Ctx extends Workspace {
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

const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
const today = () => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/** The seeded account's panels, with their members joined from the pool. */
const seededPanels = (): Panel[] => MY_PANELS.map((p, i) => ({
  ...p,
  memberIds: POOL_PEOPLE.slice(0, 3 + i).map((x) => x.id),
}))

const seededTickets = (): TicketRecord[] => TICKETS.map((t) => ({
  ...t,
  messages: [
    { id: `${t.id}-1`, from: 'client', lines: [t.subject], at: '04:26 PM' },
    { id: `${t.id}-2`, from: 'support', lines: ['Hey Jennifer thanks for reaching out!'], at: '04:26 PM' },
  ],
}))

const EMPTY: Workspace = { panels: [], tickets: [], cards: [], notifications: [], paidInvoices: [] }
const SEEDED = (): Workspace => ({
  panels: seededPanels(),
  tickets: seededTickets(),
  cards: CARDS.map((c) => ({ brand: c.brand, last4: c.last4, expires: c.expires, isDefault: c.isDefault })),
  notifications: NOTIFICATIONS,
  paidInvoices: [],
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { account } = useSession()
  const key = account?.email ?? ''
  const [byAccount, setByAccount] = useState<Record<string, Workspace>>({})
  const base = account?.seeded ? SEEDED() : EMPTY
  const w = byAccount[key] ?? base

  const patch = useCallback((fn: (cur: Workspace) => Workspace) => {
    setByAccount((m) => {
      const cur = m[key] ?? (account?.seeded ? SEEDED() : EMPTY)
      return { ...m, [key]: fn(cur) }
    })
  }, [account?.seeded, key])

  const createPanel = useCallback<Ctx['createPanel']>((input) => {
    const id = `panel-${Date.now().toString(36)}`
    patch((cur) => ({
      ...cur,
      panels: [{
        id,
        title: input.title || 'Untitled micro-panel',
        domain: input.domain || 'Healthcare',
        roles: input.roles,
        members: `${(input.memberIds ?? []).length} members`,
        updated: `Updated on ${today()}`,
        memberIds: input.memberIds ?? [],
        criteria: input.criteria,
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

  const raiseTicket = useCallback<Ctx['raiseTicket']>(({ subject, message }) => {
    const n = Math.floor(100000 + Math.random() * 899999)
    const id = `fi-s${n}`
    patch((cur) => ({
      ...cur,
      tickets: [{
        id,
        subject: subject || 'Support request',
        last: `You: ${message.slice(0, 80)}`,
        status: 'Open',
        activity: 'Just now',
        created: today(),
        number: `FI-S${n}`,
        unread: false,
        messages: [{ id: `${id}-1`, from: 'client', lines: [message], at: now() }],
      }, ...cur.tickets],
    }))
    return id
  }, [patch])

  const replyToTicket = useCallback<Ctx['replyToTicket']>((id, text, attachment) => {
    patch((cur) => ({
      ...cur,
      tickets: cur.tickets.map((t) => (t.id === id ? {
        ...t,
        last: `You: ${text.slice(0, 80)}`,
        activity: 'Just now',
        // `-sent` marks a reply the client typed, which is what the chat
        // renders beyond the frame's seeded thread.
        messages: [...t.messages, { id: `${id}-${t.messages.length + 1}-sent`, from: 'client' as const, lines: [text], at: now(), attachment }],
      } : t)),
    }))
  }, [patch])

  const solveTicket = useCallback<Ctx['solveTicket']>((id) => {
    patch((cur) => ({ ...cur, tickets: cur.tickets.map((t) => (t.id === id ? { ...t, status: 'Solved' as const } : t)) }))
  }, [patch])

  const addCard = useCallback<Ctx['addCard']>((card) => {
    patch((cur) => ({ ...cur, cards: [...cur.cards, { ...card, isDefault: cur.cards.length === 0 }] }))
  }, [patch])

  const removeCard = useCallback<Ctx['removeCard']>((last4) => {
    patch((cur) => {
      const left = cur.cards.filter((c) => c.last4 !== last4)
      if (left.length > 0 && !left.some((c) => c.isDefault)) left[0] = { ...left[0]!, isDefault: true }
      return { ...cur, cards: left }
    })
  }, [patch])

  const setDefaultCard = useCallback<Ctx['setDefaultCard']>((last4) => {
    patch((cur) => ({ ...cur, cards: cur.cards.map((c) => ({ ...c, isDefault: c.last4 === last4 })) }))
  }, [patch])

  const payInvoice = useCallback<Ctx['payInvoice']>((number) => {
    patch((cur) => ({ ...cur, paidInvoices: [...new Set([...cur.paidInvoices, number])] }))
  }, [patch])

  const markNotificationsRead = useCallback(() => {
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => ({ ...n, unread: false })) }))
  }, [patch])

  const markNotificationRead = useCallback<Ctx['markNotificationRead']>((id) => {
    patch((cur) => ({ ...cur, notifications: cur.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) }))
  }, [patch])

  const value = useMemo<Ctx>(() => ({
    ...w,
    createPanel, updatePanel, deletePanel, addToPanel,
    raiseTicket, replyToTicket, solveTicket,
    addCard, removeCard, setDefaultCard, payInvoice,
    markNotificationsRead, markNotificationRead,
  }), [w, createPanel, updatePanel, deletePanel, addToPanel, raiseTicket, replyToTicket,
    solveTicket, addCard, removeCard, setDefaultCard, payInvoice, markNotificationsRead, markNotificationRead])

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx)
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider')
  return ctx
}
