import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import {
  applyBlocker, clientReviews, payoutRows, personById, personFigures, pointsRows, redeemRows, respondentStudies, ticketsOf,
  trustHistory as trustHistoryOf, walletRows,
} from '@shared/derive'
import type { ClientReviewRow, TrustHistoryEntry } from '@shared/derive'
import { DEMO_PERSON_ID, buildSeed } from '@shared/seed'
import { platform } from '@shared/store'
import type { Actor } from '@shared/store'
import { TIMINGS } from '@shared/platform'
import type { AppNotification as PlatformNotification, Person, PlatformState, Ticket as PlatformTicket } from '@shared/types'
import { applyBlockerCopy } from '../lib/labels'
import type { ApplyBlocker } from '../lib/labels'
import { buildNotifications } from '../lib/notifications'
import { forgetSeen } from '../lib/seen'
import { setSound } from '../lib/settings'
import { autoReply } from '../lib/support'
import { DEFAULT_FILTERS } from './storeTypes'
import type { Answers, OnboardingDraft, StudyFilters, Toast } from './storeTypes'
import type { AppNotification, PayoutMethod, Study, Ticket, User } from './types'

export { TIMINGS } from '@shared/platform'

/**
 * The respondent app's store. It holds no data of its own: every study,
 * balance, score and ticket is the shared platform's (../../shared), read for
 * the signed-in person through shared/derive.ts and changed only through
 * shared/store.ts, which refuses an illegal move with a reason.
 *
 * What stays here is this device's own state: who is signed in, the
 * onboarding draft, the Explore filters, answers being typed, and toasts.
 */

const KEY = 'hl-respondent-session'
const VERSION = 5

const EMPTY_ONBOARDING: OnboardingDraft = {
  email: '', fullName: '', dob: '', gender: '', address: '',
  occupation: '', licenseId: '', industry: '', education: '', idType: '',
}

interface Local {
  signedIn: boolean
  personId: string
  onboarding: OnboardingDraft
  filters: StudyFilters
  /** Answers being typed, per study, before they are saved to the platform. */
  answers: Record<string, Answers>
  /** Workflow 12 and 14: the code on the link this session arrived through. */
  arrivedVia?: string
}

const FRESH: Local = { signedIn: false, personId: DEMO_PERSON_ID, onboarding: EMPTY_ONBOARDING, filters: DEFAULT_FILTERS, answers: {} }

/**
 * Open any URL with ?reset=1 to start over: the shared platform goes back to
 * the seed for all three apps, and this device forgets its session.
 */
function loadLocal(): Local {
  try {
    if (new URLSearchParams(window.location.search).has('reset')) {
      platform().reset()
      forgetSeen('')
      localStorage.removeItem(KEY)
      return FRESH
    }
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { version: number; local: Local } | null
    if (!saved || saved.version !== VERSION) { forgetSeen(''); return FRESH }
    return { ...FRESH, ...saved.local }
  } catch { return FRESH }
}

/** Actions the screens still send by name. Typed answers stay on this device until saved. */
export type Action =
  | { type: 'SAVE_ANSWERS'; id: string; answers: Answers }
  /** Demo and test only: move a booked session in time (shared/store.ts, moveSessionTime). */
  | { type: 'SET_BOOKING'; id: string; booking: NonNullable<Study['booking']> }
  | { type: 'TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string }

const userOf = (person: Person, figures: ReturnType<typeof personFigures>): User => ({
  name: person.name, email: person.email, phone: person.phone, profile: person.profile, onboarded: person.onboarded,
  taxFormDone: person.taxFormDone, sourceCode: person.sourceCode, joinedAt: person.joinedAt, consent: person.consent, emailPrefs: person.emailPrefs,
  photo: person.photo, photoConsent: Boolean(person.photoConsent), video: person.video, videoConsent: Boolean(person.videoConsent),
  verified: { govId: person.identity.state === 'verified', livePhoto: person.livePhoto, license: person.profession.state === 'verified' },
  ...figures,
})

const ticketOf = (t: PlatformTicket): Ticket => ({
  id: t.id, subject: t.subject, message: t.message, studyTitle: t.studyTitle, topic: t.topic, status: t.status,
  createdAt: t.createdAt, lastActivityAt: t.lastActivityAt,
  messages: t.messages.map((m) => ({ id: m.id, from: m.from === 'user' ? 'you' : 'support', text: m.text, at: m.at })),
})

/** Everything one person's screens read, derived from the platform in one pass. */
/**
 * The platform can hold nobody at all: a new console account starts an empty
 * one (shared/store.ts signUpTeam). The screens still need a person to draw,
 * so the seed's demo person stands in, signed out; signing in puts the demo
 * state back.
 */
let standIn: Person | undefined
const onPlatform = (world: PlatformState, personId: string) => Boolean(personById(world, personId) ?? personById(world, DEMO_PERSON_ID))

function view(world: PlatformState, personId: string) {
  const person = personById(world, personId) ?? personById(world, DEMO_PERSON_ID) ?? (standIn ??= personById(buildSeed(), DEMO_PERSON_ID)!)
  const figures = personFigures(world, person.id)
  return {
    person,
    user: userOf(person, figures),
    studies: respondentStudies(world, person.id),
    transactions: walletRows(world, person.id),
    payouts: payoutRows(person),
    payoutMethods: person.payoutMethods,
    pointsHistory: pointsRows(world, person.id),
    redeemHistory: redeemRows(person),
    referrals: person.referrals,
    tickets: ticketsOf(world, 'participant', person.id).map(ticketOf),
    notifications: person.notifications as AppNotification[],
    trustHistory: trustHistoryOf(world, person.id),
  }
}

type View = ReturnType<typeof view>

/**
 * The returning account's notification history, written once onto the
 * platform from its own record whenever it has none (first load, or after a
 * reset). Live notifications are added by shared/store.ts from then on.
 */
function seedHistory(world: PlatformState, v: View) {
  if (v.person.id !== DEMO_PERSON_ID || v.person.notifications.length > 0) return
  const rose = [...v.trustHistory].find((e) => e.delta > 0 && e.label !== 'Onboarding')?.at
  platform().seedNotifications(v.person.id, buildNotifications({
    studies: v.studies, payouts: v.payouts, payoutMethods: v.payoutMethods, pointsHistory: v.pointsHistory,
    referrals: v.referrals, tickets: v.tickets, trustScore: v.user.trustScore, tier: v.user.tier,
    profileCompletion: v.user.profileCompletion, joinedAt: v.user.joinedAt, trustRoseAt: rose, tierReachedAt: rose,
  }) as PlatformNotification[])
  void world
}

export function useStoreValue() {
  const world = useSyncExternalStore(platform().subscribe, platform().getState)
  const [local, setLocal] = useState<Local>(loadLocal)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ version: VERSION, local })) } catch { /* private mode: memory only */ }
  }, [local])

  const v = useMemo(() => view(world, local.personId), [world, local.personId])
  const me = v.person.id
  const actor = useMemo<Actor>(() => ({ kind: 'participant', id: me }), [me])

  useEffect(() => { seedHistory(world, v) }, [world, v])

  /** The platform's simulated server steps (shared/platform.ts, TIMINGS). Any open tab may run them; each runs once. */
  useEffect(() => {
    const t = setInterval(() => platform().tick(), 250)
    return () => clearInterval(t)
  }, [])

  const toast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((all) => [...all, { id, message }])
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), TIMINGS.toast)
  }, [])

  /** A refused move says why, never silently. */
  const run = useCallback((res: { ok: boolean; why?: string }) => {
    if (!res.ok && res.why) toast(res.why)
    return res.ok
  }, [toast])

  /** Moves made somewhere else (the client, the console, the platform's own timer) are told to the person as they land. */
  const seen = useRef<Map<string, Study['status']>>(new Map())
  useEffect(() => {
    const before = seen.current
    const now = new Map(v.studies.map((s) => [s.id, s.status] as const))
    if (before.size > 0) {
      for (const s of v.studies) {
        const was = before.get(s.id)
        if (!was || was === s.status) continue
        if (was === 'applied' && s.status === 'invited_to_schedule') toast('You are invited to schedule')
        if (was === 'applied' && s.status === 'invited_to_complete') toast('You are invited to complete')
        if (was === 'in_process' && (s.status === 'paid' || s.status === 'late_show' || s.status === 'not_needed')) {
          toast(`Paid $${s.reward}, +25 points, +1 Trust Score`)
        }
      }
    }
    seen.current = now
  }, [v.studies, toast])

  const p = platform()

  const actions = {
    // --- the session on this device ---
    setOnboarding: (patch: Partial<OnboardingDraft>) => setLocal((l) => ({ ...l, onboarding: { ...l.onboarding, ...patch } })),
    setFilters: (patch: Partial<StudyFilters>) => setLocal((l) => ({ ...l, filters: { ...l.filters, ...patch } })),
    /** Reset clears the sheet's filters but keeps the search and sort, which live outside it on the Explore toolbar. */
    resetFilters: () => setLocal((l) => ({ ...l, filters: { ...DEFAULT_FILTERS, query: l.filters.query, sort: l.filters.sort } })),
    /** Workflow 12 and 14: remember the coded link the person arrived through. */
    setSource: (code: string) => setLocal((l) => (l.arrivedVia === code ? l : { ...l, arrivedVia: code })),

    /**
     * Signing in on the Sign In screen hands over the demo account exactly as
     * a fresh install has it, and resets the shared platform for all three
     * apps, so a demo can be passed from one person to the next. The device's
     * memory of figures last seen goes with it, so restored numbers do not
     * roll as if they had fallen. Finishing onboarding (no email) just signs
     * in the account that was being made.
     */
    signIn: (email?: string) => {
      if (email) {
        p.reset()
        forgetSeen('')
        setSound(false)
        setLocal((l) => ({ ...FRESH, signedIn: true, arrivedVia: l.arrivedVia }))
        return
      }
      setLocal((l) => ({ ...l, signedIn: true }))
    },
    signOut: () => setLocal((l) => ({ ...l, signedIn: false })),
    /** Workflow 15: a new person on the platform, signed in, free to browse. Being referred earns 100 points (shared/derive.ts). */
    signUp: (email: string, sourceCode?: string) => {
      const made = p.signUpPerson(email, sourceCode ?? local.arrivedVia)
      if (!made.ok) { toast(made.why); return }
      setLocal((l) => ({ ...l, signedIn: true, personId: made.id, answers: {}, onboarding: { ...EMPTY_ONBOARDING, email } }))
    },

    // --- the person ---
    /** Workflow 49: the tax form is on file. */
    taxFormDone: () => run(p.updatePerson(me, { taxFormDone: true })),
    updateUser: (patch: Partial<User>) => run(p.updatePerson(me, {
      name: patch.name, email: patch.email, phone: patch.phone, onboarded: patch.onboarded, profile: patch.profile,
      identityVerified: patch.verified?.govId, licenseVerified: patch.verified?.license,
    })),
    setConsent: (key: keyof User['consent'], value: boolean) => run(p.setConsent(me, key, value)),
    /** Their own picture and intro video, and the consent to show each to clients (shared/store.ts). */
    setPicture: (dataUrl: string | null) => run(p.setPicture(me, dataUrl)),
    setVideo: (video: User['video'] | null) => run(p.setVideo(me, video)),
    setMediaConsent: (what: 'photo' | 'video', on: boolean) => run(p.setMediaConsent(me, what, on)),
    setEmailPref: (key: keyof User['emailPrefs'], value: boolean) => run(p.setEmailPref(me, key, value)),
    markAllRead: () => run(p.markNotificationsRead(me)),
    markRead: (id: string) => run(p.markNotificationsRead(me, id)),
    addPayoutMethod: (method: PayoutMethod) => run(p.addPayoutMethod(me, method)),
    removePayoutMethod: (id: string) => run(p.removePayoutMethod(me, id)),
    setDefaultPayoutMethod: (id: string) => run(p.setDefaultPayoutMethod(me, id)),
    withdraw: (amount: number, destination: string) => run(p.requestPayout(me, amount, destination)),
    redeemPoints: (points: number) => run(p.redeem(me, points)),

    // --- studies ---
    studyById: (id?: string) => v.studies.find((s) => s.id === id),
    /** Workflow 15, 17, 57: the shared rule's verdict, in this app's words. */
    applyBlocker: (id: string): ApplyBlocker | null =>
      applyBlockerCopy(applyBlocker(world, id, me), v.studies.find((s) => s.id === id)?.client.name ?? 'This client'),
    clientReviews: (clientId: string): ClientReviewRow[] => clientReviews(world, clientId),
    toggleSaved: (id: string) => run(p.toggleSaved(me, id)),
    applyToStudy: (id: string, preAnswers?: Answers) => run(p.startApplication(id, me, preAnswers)),
    saveDraft: (id: string, answers: Answers) => run(p.saveDraft(id, me, answers)),
    /** Applied now; a simulated client decides on the platform's timer, a real one from the client app or the console. */
    submitScreener: (id: string) => run(p.submitScreener(id, me, local.answers[id])),
    /** Turning an invitation down takes it out of Invites, back to Explore. */
    rejectInvitation: (id: string) => run(p.withdraw(id, me)),
    scheduleStudy: (id: string, booking: NonNullable<Study['booking']>) => run(p.schedule(id, me, booking)),
    /** Policy: a cancelled session is -2 Trust Score. */
    cancelStudy: (id: string) => { if (run(p.cancelSession(id, me))) toast('Study cancelled, 2 Trust Score deducted') },
    /** Workflow 42, the participant's half: the code shown at the end of the session. */
    confirmPin: (id: string, code?: string) => run(p.confirmPin(id, me, code ?? world.studies.find((s) => s.id === id)?.participations.find((x) => x.personId === me)?.code?.value ?? '')),
    /** Completed now; the payout follows once the client approves it (workflow 46, shared/platform.ts TIMINGS). */
    completeStudy: (id: string) => run(p.complete(id, me, actor, local.answers[`${id}:survey`])),
    /** The day's answers go to the platform with the day, so the client and the team can read them. */
    completeDiaryDay: (id: string, day: number) => run(p.completeDiaryDay(id, me, day, local.answers[`${id}:day${day}`])),
    rateClient: (id: string, review: NonNullable<Study['userReview']>) => run(p.reviewClient(id, me, review)),

    // --- support ---
    addTicket: (subject: string, message: string, studyTitle?: string, topic: Ticket['topic'] = 'general') => {
      const made = p.createTicket({ kind: 'participant', id: me }, { subject, message, studyTitle, topic })
      if (!made.ok) { toast(made.why); return '' }
      // Workflow 56: the first answer is automatic, from the FAQs and guides.
      setTimeout(() => p.replyTicket(made.id, 'auto', autoReply(subject, message, topic)), TIMINGS.autoReply)
      return made.id
    },
    sendTicketMessage: (ticketId: string, text: string) => run(p.replyTicket(ticketId, 'user', text, actor)),
  }

  const dispatch = useCallback((a: Action) => {
    switch (a.type) {
      case 'SAVE_ANSWERS': setLocal((l) => ({ ...l, answers: { ...l.answers, [a.id]: a.answers } })); break
      case 'SET_BOOKING': p.moveSessionTime(a.id, me, a.booking.date, a.booking.slot); break
      case 'TOAST': setToasts((all) => [...all, a.toast]); break
      case 'DISMISS_TOAST': setToasts((all) => all.filter((x) => x.id !== a.id)); break
    }
  }, [p, me])

  /** Answers: what this device is typing, over what the platform has saved. */
  const answers = useMemo(() => {
    const saved: Record<string, Answers> = {}
    for (const s of world.studies) {
      const mine = s.participations.find((x) => x.personId === me)
      // The platform keeps a number answer as a number; the field it is typed into holds text.
      const typed = (a: Record<string, string | string[] | number>): Answers => Object.fromEntries(Object.entries(a).map(([k, v]) => [k, typeof v === 'number' ? String(v) : v]))
      if (mine?.answers) saved[s.id] = typed(mine.answers)
      if (mine?.taskAnswers) saved[`${s.id}:survey`] = typed(mine.taskAnswers)
      for (const [day, a] of Object.entries(mine?.diaryAnswers ?? {})) saved[`${s.id}:day${day}`] = typed(a)
    }
    return { ...saved, ...local.answers }
  }, [world, me, local.answers])

  return {
    ...v,
    user: v.user,
    trustHistory: v.trustHistory as TrustHistoryEntry[],
    signedIn: local.signedIn && onPlatform(world, local.personId),
    onboarding: local.onboarding,
    filters: local.filters,
    arrivedVia: local.arrivedVia,
    answers,
    toasts,
    ...actions,
    dispatch,
    toast,
    dismissToast: (id: string) => setToasts((all) => all.filter((x) => x.id !== id)),
    notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => { p.notify(me, n) },
  }
}

export type StoreValue = ReturnType<typeof useStoreValue>

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  // A handle for driving state in the browser, used by the verification
  // scripts and the acceptance demo. Kept in the built app too, so the demo
  // runs against the one-origin deployment; every value behind it is mock data.
  ;(window as unknown as { __hl?: unknown }).__hl = value
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
