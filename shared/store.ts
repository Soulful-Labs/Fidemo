/**
 * The only place a state changes, for all three apps.
 *
 * Every move goes through the two machines in lifecycle.ts and the rules in
 * rules.ts and platform.ts. An illegal move is refused with a reason and
 * leaves the state exactly as it was; it is never silently dropped.
 *
 * The state lives in the browser's storage, so every tab on the same origin
 * reads and writes the same platform: a change made in one app is picked up
 * by the others through the storage event, without a reload.
 */
import { applyRepeatRule, barredFrom, billing, diaryReady, freshCertificateId, hasTakenPartWith, sessionNotStarted, openAvailability, personById, personFigures, profileCompletion, referralCode } from './derive'
import { canEditStudy, canMoveParticipation, canMovePayout, canMoveStudy, canReopen, isLive, participationOf } from './lifecycle'
import { DECISION_UNDO_MS, DEMO_SESSION_CODE, REPORT_MAX_CHARS, RESTRICTION_DAYS, TIMINGS, canCancel, canReschedule, canWithdraw, depositFor, isSessionType, priceStudy, targets, withdrawalExpectedBy } from './platform'
import { POINTS, canRedeem, starsForRating, starsFromDimensions } from './rules'
import { monthDayYear } from './format'
import { sessionStartOf as sessionStart } from './derive'
import { EMPTY_PROFILE } from './seed/people'
import { MAX_RUN_DAYS, audienceFault, buildStudy, fitsStudy, formFromStudy, liveEditFault, studyTypeOf, summarise } from './studyForm'
import { buildScreener, buildTasks } from './questions'
import type { StudyForm } from './studyForm'
import { editOf } from './revisions'
import { DEMO_TEAM_PASSWORD, MASTER_ADMIN_ID, SEED_VERSION, buildSeed } from './seed'
import type {
  Answers, AppNotification, Booking, Check, Client, ClientReview, Module, ParticipantRating, Participation, ParticipationState,
  PayoutMethod, Person, PlatformState, RatingState, RepeatRule, Report, Result, SavedCard, Study, StudyState,
  TeamMember, Ticket,
} from './types'

export const STORAGE_KEY = 'fi-platform'

/** Who is doing something. A team member's moves are written to the console's activity log. */
export type Actor = { kind: 'team'; id: string } | { kind: 'client'; id: string } | { kind: 'participant'; id: string } | { kind: 'system' }
const SYSTEM: Actor = { kind: 'system' }

type Listener = () => void
interface Options { storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null; now?: () => Date }

const no = (why: string): Result<never> => ({ ok: false, why })
const yes = <T extends object>(extra?: T): Result<T> => ({ ok: true, ...(extra as T) })
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`

/** A number question's answer is kept as a number, not as the text that was typed. Anything that is not a number stays as typed. */
function tidyAnswers(study: Study, answers: Answers): Answers {
  const numeric = new Set([...study.screener, ...(study.tasks ?? [])].filter((q) => q.format === 'number').map((q) => q.id))
  return Object.fromEntries(Object.entries(answers).map(([id, v]) => {
    if (!numeric.has(id) || typeof v !== 'string') return [id, v]
    const n = Number(v.trim().replace(/,/g, ''))
    return [id, v.trim() !== '' && Number.isFinite(n) ? n : v]
  }))
}

export function createPlatform(options: Options = {}) {
  /**
   * Safari with "Block All Cookies" throws on any touch of localStorage, typeof
   * included, and that throw would leave every app blank. Blocked means none:
   * the demo then runs in memory, as it does in tests.
   */
  const storage = options.storage === undefined
    ? (() => { try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null } })()
    : options.storage
  const clock = options.now ?? (() => new Date())
  const iso = () => clock().toISOString()
  const listeners = new Set<Listener>()

  const read = (): PlatformState | null => {
    try {
      const raw = storage?.getItem(STORAGE_KEY)
      if (!raw) return null
      const saved = JSON.parse(raw) as PlatformState
      return saved.version === SEED_VERSION ? saved : null
    } catch { return null }
  }
  const write = (s: PlatformState) => { try { storage?.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* private mode: the demo still runs in memory */ } }

  let state: PlatformState = read() ?? (() => { const fresh = buildSeed(clock()); write(fresh); return fresh })()
  const emit = () => listeners.forEach((l) => l())

  /** Another tab changed the platform: take its state and tell this tab's screens. */
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return
      const next = read()
      if (next) { state = next; emit() }
    })
  }

  /**
   * Runs one move on a copy of the latest state. The copy replaces the state
   * only if the move says ok, so a refusal changes nothing.
   */
  function move<T extends object>(fn: (s: PlatformState) => Result<T>): Result<T> {
    const draft = structuredClone(read() ?? state)
    const result = fn(draft)
    if (result.ok) { state = draft; write(draft); emit() }
    return result
  }

  // ------------------------------------------------------------- helpers

  const log = (s: PlatformState, actor: Actor, what: string, path: string) => {
    if (actor.kind !== 'team') return
    s.activity.unshift({ id: uid('ac'), what, path, at: iso(), by: actor.id })
  }
  const notify = (s: PlatformState, personId: string, n: Omit<AppNotification, 'id' | 'at' | 'read'>) => {
    const person = personById(s, personId)
    person?.notifications.unshift({ ...n, id: uid('nt'), at: iso(), read: false })
  }
  const find = (s: PlatformState, studyId: string, personId: string): { study: Study; p: Participation } | null => {
    const study = s.studies.find((x) => x.id === studyId)
    const p = study && participationOf(study, personId)
    return study && p ? { study, p } : null
  }
  const stamp = (p: Participation, label: string) => { p.events.push({ label, at: iso() }) }

  /**
   * Policy section 9: a restricted participant cannot take part in studies,
   * withdraw or redeem until the end date; a deactivated one cannot at all.
   * The reason says which, why and until when.
   */
  const barred = (person: Person): string | null => {
    const b = barredFrom(person, clock())
    if (!b) return null
    if (b.kind === 'deactivated') return `This account is deactivated (${b.category}). You can appeal from the app.`
    return `Your account is restricted until ${monthDayYear(b.until)} (${b.category}). Until then you cannot take part in studies, withdraw or redeem.`
  }

  /**
   * One restriction, wherever it comes from (a report or the team), so every
   * one counts toward the ladder: 15, 15 and 30 days, and the fourth offence
   * is a deactivation. The participant is told the category and the end date.
   */
  const restrict = (s: PlatformState, person: Person, category: string, reason: string, actor: Actor): 'restricted' | 'deactivated' => {
    const by = actor.kind === 'team' ? actor.id : ''
    const count = person.restrictions?.length ?? 0
    if (count >= RESTRICTION_DAYS.length) {
      deactivate(s, person, category, `Fourth offence. ${reason}`, actor)
      return 'deactivated'
    }
    const until = new Date(clock().getTime() + RESTRICTION_DAYS[count]! * 86_400_000).toISOString()
    person.restrictions = [...(person.restrictions ?? []), { at: iso(), until, category, reason, by }]
    person.status = 'restricted'
    person.statusNote = { reason, at: iso(), by, until, category }
    notify(s, person.id, {
      kind: 'profile', title: 'Your account is restricted',
      body: `Restricted until ${monthDayYear(until)} for ${category}: ${/[.!?]$/.test(reason) ? reason : `${reason}.`} Until then you cannot take part in studies, withdraw or redeem.`, to: '/profile',
    })
    return 'restricted'
  }

  /** A deactivation: the participant is sent the written reason and can appeal (policy section 9). */
  const deactivate = (s: PlatformState, person: Person, category: string, reason: string, actor: Actor) => {
    person.status = 'deactivated'
    person.statusNote = { reason, at: iso(), by: actor.kind === 'team' ? actor.id : '', category }
    notify(s, person.id, { kind: 'profile', title: 'Your account has been deactivated', body: `${category}: ${/[.!?]$/.test(reason) ? reason : `${reason}.`} You can appeal this decision from the app.`, to: '/' })
  }

  /**
   * Policy section 5: a session cancelled by the client or the team costs the
   * participant nothing, and they are told. They go back to being invited to
   * schedule, so they can book again if the study still runs.
   */
  const cancelFor = (s: PlatformState, study: Study, p: Participation, by: 'client' | 'team', reason: string) => {
    const when = p.booking ? `${monthDayYear(p.booking.date)} at ${p.booking.slot}` : 'booked'
    p.state = 'qualified'; p.booking = undefined; p.code = undefined
    stamp(p, by === 'client' ? 'Session cancelled by the client' : 'Session cancelled by the team')
    const open = isLive(study.state)
    notify(s, p.personId, {
      kind: 'session', title: by === 'client' ? 'Study cancelled by client' : 'Your session was cancelled',
      body: `Your ${when} session for ${study.title} was cancelled by ${by === 'client' ? 'the client' : 'the Focus Insite team'}${reason ? ` (${reason})` : ''}. This costs you nothing.${open ? ' You can book another time.' : ''}`,
      ...(open ? { actionLabel: 'Schedule Now', to: `/studies/${study.id}/schedule` } : { to: `/studies/${study.id}` }),
    })
  }
  const nameOf = (s: PlatformState, personId: string) => personById(s, personId)?.name ?? 'the participant'
  const clientOf = (s: PlatformState, study: Study) => s.clients.find((c) => c.id === study.clientId)

  /** Moves a participation, or says why it cannot move. */
  const shift = (p: Participation, to: ParticipationState): Result => {
    if (!canMoveParticipation(p.state, to)) return no(`${p.state} cannot become ${to}`)
    p.state = to
    return yes()
  }

  /**
   * The team has processed the payout by hand in the console: the incentive
   * is in the wallet from now. Nothing calls this on a timer; nothing is ever
   * paid automatically. A simulated client also rates the participant.
   */
  const pay = (s: PlatformState, study: Study, p: Participation) => {
    if (p.state !== 'completed' || p.paidAt) return
    p.paidAt = iso()
    p.events.push({ label: 'Payout processed by the team', at: p.paidAt }, { label: 'Paid', at: p.paidAt })
    if (clientOf(s, study)?.simulated && !p.rating) {
      p.rating = { stars: starsForRating('excellent'), state: 'excellent', comment: 'Thoughtful, well prepared and on time. Would happily include again.', expertise: 5, reliability: 5, communication: 4, at: p.paidAt }
    }
    notify(s, p.personId, { kind: 'money', title: `You've received $${study.rates.incentivePer}!`, body: `Your reward for ${study.title} has been paid into your wallet.`, to: '/wallet' })
  }

  /** Completed and not yet paid: who a finished study still has to pay, and which of them can be paid now ("no code, no payment"). */
  const owedOn = (study: Study) => {
    const owed = study.participations.filter((p) => p.state === 'completed' && !p.paidAt)
    const ready = owed.filter((p) => !isSessionType(study.type) || Boolean(p.code?.byClient && p.code?.byParticipant))
    return { owed, ready }
  }
  const usd = (n: number) => `$${n.toLocaleString('en-US')}`
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

  /**
   * A study has finished. Nothing is paid here. The client is told their
   * participants will now be paid, and the team is told the payouts are
   * ready to process; the team pays them by hand in the console.
   */
  const announceFinish = (s: PlatformState, study: Study) => {
    const { owed } = owedOn(study)
    const client = clientOf(s, study)
    const total = owed.length * study.rates.incentivePer
    if (client) {
      client.notifications = [{
        id: uid('cn'), studyId: study.id, at: iso(), read: false, title: 'Your study has finished',
        body: owed.length
          ? `${study.title} has finished. Its ${plural(owed.length, 'participant')} who completed will now be paid (${usd(total)}). The Focus Insite team processes the payouts; nothing is paid automatically.`
          : `${study.title} has finished. Nobody is waiting to be paid on it.`,
      }, ...(client.notifications ?? [])]
    }
    if (owed.length) {
      s.teamNotices = [{
        id: uid('tn'), kind: 'payouts', studyId: study.id, at: iso(), title: 'Payouts ready to process',
        body: `${study.title} (${client?.company ?? 'a client'}) has finished. ${plural(owed.length, 'participant')} to be paid, ${usd(total)} in all.`,
      }, ...(s.teamNotices ?? [])]
    }
  }

  const selected = (s: PlatformState, study: Study, p: Participation) => {
    const session = isSessionType(study.type)
    notify(s, p.personId, {
      kind: 'study', title: session ? "You've been selected to complete!" : "Congrats! You're invited to complete study!",
      body: `${study.title} is ready for the next step.`, actionLabel: session ? 'Schedule Now' : 'Start Study',
      to: session ? `/studies/${study.id}/schedule` : `/studies/${study.id}`,
    })
  }

  // ---------------------------------------------------------------- the API

  const api = {
    getState: () => state,
    subscribe: (l: Listener) => { listeners.add(l); return () => { listeners.delete(l) } },
    now: clock,

    /** Back to the seed, for every app and every tab. The demo is handed from one person to the next this way. */
    reset: () => { state = buildSeed(clock()); write(state); emit() },

    /**
     * Runs the simulated server steps that have come due (platform.ts,
     * TIMINGS). Any open tab may call it; a step runs once.
     */
    tick: () => {
      const now = clock().getTime()
      const ended = (p: Person) => p.status === 'restricted' && Boolean(p.statusNote?.until) && new Date(p.statusNote!.until!).getTime() <= now
      if (!state.pending.some((x) => x.dueAt <= now) && !state.people.some(ended)) return
      move((s) => {
        // Policy section 9: a restriction ends on its date, and the participant is told.
        for (const person of s.people.filter(ended)) {
          person.status = 'active'; person.statusNote = undefined
          notify(s, person.id, { kind: 'profile', title: 'Your restriction has ended', body: 'You can take part in studies, withdraw and redeem again.', to: '/dashboard' })
        }
        const due = s.pending.filter((x) => x.dueAt <= clock().getTime())
        s.pending = s.pending.filter((x) => x.dueAt > clock().getTime())
        for (const item of due) {
          const hit = find(s, item.studyId, item.personId)
          if (!hit) continue
          if (item.kind === 'qualify' && hit.p.state === 'applied') {
            hit.p.state = 'qualified'; hit.p.decidedAt = iso()
            stamp(hit.p, isSessionType(hit.study.type) ? 'Invited to schedule' : 'Invited to complete')
            selected(s, hit.study, hit.p)
          }
        }
        return yes()
      })
    },

    /**
     * Demo and test only: moves a booked session in time without the
     * availability or reschedule checks, so a walk-through can complete a
     * session without waiting for the clock. No screen calls it.
     */
    moveSessionTime: (studyId: string, personId: string, date: string, slot: string) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit?.p.booking) return no('There is no booked session to move')
      hit.p.booking = { ...hit.p.booking, date, slot }
      return yes()
    }),

    // ------------------------------------------------------------ studies

    /**
     * Workflow 5 and 7: the client submits a study; it waits for the team. The
     * incentive deposit is taken now. Everything on the study comes from the
     * form the client filled (shared/studyForm.ts); a form that cannot be a
     * study is refused with what to fix, and nothing is created. `draftId`
     * submits a saved draft in place.
     */
    submitStudy: (clientId: string, form: StudyForm, draftId?: string) => move<{ id: string }>((s) => {
      if (!s.clients.some((c) => c.id === clientId)) return no('No such client')
      const draft = draftId ? s.studies.find((x) => x.id === draftId && x.clientId === clientId) : undefined
      if (draftId && !draft) return no('That study is gone')
      // A draft is submitted in place; a study still waiting on the team can be changed and sent again. A live one cannot.
      if (draft && !canEditStudy(draft.state)) return no('This study is live and can no longer be edited')
      // The card is optional at onboarding and required here: the deposit is taken from it.
      if (!s.clients.find((c) => c.id === clientId)!.cards.length) return no('Add a card to publish this study')
      const built = buildStudy(form, clock())
      if (!built.ok) return no(built.why)
      const id = draft?.id ?? uid('st')
      const kept = structuredClone(form)
      // A study the team has already seen keeps a record of what this save changed (Revisions History).
      const firstSubmittedAt = draft?.firstSubmittedAt ?? draft?.submittedAt
      const edit = firstSubmittedAt ? editOf(draft?.form, kept, 'client', iso()) : null
      const study: Study = {
        id, clientId, state: 'in_review', createdAt: draft?.createdAt ?? iso(), submittedAt: iso(), firstSubmittedAt: firstSubmittedAt ?? iso(),
        linkCode: draft?.linkCode || `HL-${id.slice(-3).toUpperCase()}-A`, ...built.study, image: built.study.image ?? draft?.image,
        setup: summarise(s, kept, clock()), form: kept, participations: [], payments: [], revisions: draft?.revisions ?? [],
        edits: [...(draft?.edits ?? []), ...(edit ? [edit] : [])],
      }
      study.payments.push({ id: `${id}-deposit`, kind: 'deposit', amount: depositFor(study.rates, study.required), at: iso() })
      if (draft) s.studies.splice(s.studies.indexOf(draft), 1)
      s.studies.unshift(study)
      return yes({ id })
    }),

    /**
     * Save Draft & Exit: the form as it stands, kept whole on a draft study so
     * it reopens with everything in it. Nothing is checked; a draft may be
     * half built. `draftId` saves over a draft already there.
     */
    saveStudyDraft: (clientId: string, form: StudyForm, draftId?: string) => move<{ id: string }>((s) => {
      if (!s.clients.some((c) => c.id === clientId)) return no('No such client')
      const draft = draftId ? s.studies.find((x) => x.id === draftId && x.clientId === clientId) : undefined
      if (draftId && draft?.state !== 'draft') return no(draft ? 'This study has already been submitted. Publish it to save your changes.' : 'That draft is gone')
      const kept = structuredClone(form)
      const type = studyTypeOf(kept)
      const required = /^\d+$/.test(kept.participants.trim()) ? Number(kept.participants) : 0
      const fields = {
        title: kept.title.trim() || 'Untitled study', description: kept.description, type, durationMins: Number(kept.duration) || 0, required,
        industry: kept.industries, targetProfession: kept.roles, rates: priceStudy(type, kept.incentive, { roles: targets(kept.roles), skills: targets(kept.skills) }), form: kept,
        ...(kept.image ? { image: kept.image } : {}),
      }
      if (draft) { Object.assign(draft, fields); return yes({ id: draft.id }) }
      const id = uid('st')
      s.studies.unshift({
        id, clientId, state: 'draft', createdAt: iso(), endsAt: new Date(clock().getTime() + MAX_RUN_DAYS * 86_400_000).toISOString(),
        repeatRule: 'allow', linkCode: '', preScreener: [], screener: [], participations: [], payments: [], revisions: [], ...fields,
      })
      return yes({ id })
    }),

    /** A duplicate is a fresh draft: the study's setup and none of its people. */
    duplicateStudy: (studyId: string) => move<{ id: string }>((s) => {
      const from = s.studies.find((x) => x.id === studyId)
      if (!from) return no('That study is gone')
      const id = uid('st')
      s.studies.unshift({
        ...structuredClone(from), id, title: `${from.title} (copy)`, state: 'draft', createdAt: iso(), submittedAt: undefined, approvedAt: undefined,
        completedAt: undefined, participations: [], payments: [], revisions: [],
      })
      return yes({ id })
    }),

    /** Workflow 7, 9, 11: only the team takes a study live; anyone may make the moves their role is drawn with. */
    moveStudy: (studyId: string, to: StudyState, actor: Actor = SYSTEM, reason?: string) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (!canMoveStudy(study.state, to)) return no(`A ${study.state.replace('_', ' ')} study cannot become ${to.replace('_', ' ')}`)
      if (study.state === 'in_review' && to === 'recruiting' && actor.kind !== 'team') return no('Only the team can take a study live')
      if (study.state === 'completed') {
        // Re-publish and Recruit: the balance stops being due until the study is stopped again, on the same rule as the first time.
        if (!canReopen(study)) return no('This study has been paid and is closed')
        study.completedAt = undefined
        s.teamNotices = (s.teamNotices ?? []).filter((n) => !(n.kind === 'payouts' && n.studyId === study.id))
        log(s, actor, `Re-published ${study.title} to recruit more`, 'Studies / Manage / Re-publish')
      }
      if (study.state === 'draft' && to === 'in_review') {
        study.submittedAt = iso()
        if (!study.payments.some((p) => p.kind === 'deposit') && study.required > 0) study.payments.push({ id: `${study.id}-deposit`, kind: 'deposit', amount: depositFor(study.rates, study.required), at: iso() })
      }
      if (to === 'recruiting' && !study.approvedAt) {
        study.approvedAt = iso(); log(s, actor, `Approved ${study.title} to publish`, 'Studies / Review / Approve')
        /**
         * Workflow 24: the search runs when the study goes live. Matched is the
         * people who fit the audience the client set, less anyone its repeat
         * rule shuts out. A study with no audience on record matches no one.
         */
        for (const person of applyRepeatRule(s, study, fitsStudy(s, study, clock()))) {
          if (!participationOf(study, person.id)) study.participations.push({ personId: person.id, state: 'matched', events: [] })
        }
      }
      if (to === 'paused') { study.pausedReason = reason; log(s, actor, `Paused ${study.title}`, 'Studies / Manage / Pause') }
      if (to === 'completed') {
        study.completedAt = iso(); log(s, actor, `Marked ${study.title} as completed`, 'Studies / Manage / Complete')
        // Sessions still booked are cancelled by whoever closed the study: free for the participant, who is told.
        for (const p of study.participations.filter((x) => x.state === 'scheduled' && sessionNotStarted(x.booking, clock()))) cancelFor(s, study, p, actor.kind === 'team' ? 'team' : 'client', 'the study has closed')
        announceFinish(s, study)
      }
      study.state = to
      return yes()
    }),

    /** Workflow 7: the team sends a study back with the changes it needs. */
    /**
     * Edit Study in the console (19 Oct 2026, 2325:214085): the team changes a
     * live study. The money and the bookings stay as they are (liveEditFault);
     * everything else is rebuilt from the form, and the round of changes is
     * recorded in Revisions History as the team's.
     */
    editLiveStudy: (studyId: string, form: StudyForm, actor: Actor) => move((s) => {
      if (actor.kind !== 'team') return no('Only the team can edit a live study')
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (!isLive(study.state) && study.state !== 'paused') return no('Only a live study is edited here')
      const before = formFromStudy(study)
      const after = structuredClone(form)
      const fault = liveEditFault(before, after)
      if (fault) return no(fault)
      // Only what an edit may change is checked and rebuilt; the rates, target, bookings and payments are the study's own and stay.
      if (!after.title.trim()) return no('Give the study a title on the About step')
      const durationMins = Number(after.duration) || 0
      if (durationMins <= 0) return no('Set how long the study takes on the About step')
      { const f = audienceFault(after); if (f) return no(f) }
      const screener = buildScreener(after.questions)
      if (!screener.ok) return screener
      const taskSet = study.type === 'survey' || study.type === 'diary' ? buildTasks(after.tasks) : undefined
      if (taskSet && !taskSet.ok) return taskSet
      const [d, m, y] = after.endDate.split('/').map((x) => Number(x.trim()))
      const endsAt = after.endDate !== before.endDate && d && m && y ? new Date(y, m - 1, d, 18, 0).toISOString() : study.endsAt
      const edit = editOf(before, after, 'team', iso(), actor.id)
      if (!edit) return no('Nothing has changed')
      Object.assign(study, {
        title: after.title.trim(), description: after.description.trim(), image: after.image || study.image, durationMins, endsAt,
        industry: after.industries.split(',').map((x) => x.trim()).filter(Boolean).join(', '),
        targetProfession: after.roles.split(',').map((x) => x.trim()).filter(Boolean).join(', '),
        preScreener: screener.preScreener, screener: screener.screener, ...(taskSet?.ok ? { tasks: taskSet.tasks } : {}),
      })
      study.form = after
      study.setup = summarise(s, after, clock())
      study.edits = [...(study.edits ?? []), edit]
      log(s, actor, `Edited ${study.title} (${edit.changes.length} change${edit.changes.length === 1 ? '' : 's'})`, 'Studies / Manage / Edit Study')
      return yes()
    }),

    /** Recruit more: a running study that has met its target keeps recruiting, at the rates it was published at. */
    recruitMore: (studyId: string, actor: Actor) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (study.state !== 'recruiting' && study.state !== 'ongoing') return no('Only a running study can recruit more')
      study.beyondTarget = true
      log(s, actor, `Kept ${study.title} recruiting past its target`, 'Studies / Manage / Recruit more')
      return yes()
    }),

    requestChanges: (studyId: string, text: string, actor: Actor) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (study.state !== 'in_review') return no('Only a study in review can be sent back')
      if (!text.trim()) return no('Describe the required changes')
      study.revisions.push({ text: text.trim(), at: iso(), by: actor.kind === 'team' ? actor.id : '' })
      study.state = 'draft'
      log(s, actor, `Requested changes on ${study.title}`, 'Studies / Review / Request Changes')
      return yes()
    }),

    setRepeatRule: (studyId: string, rule: RepeatRule) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      study.repeatRule = rule
      return yes()
    }),

    /** Workflow 53: the client pays what a completed study still owes. */
    payBalance: (studyId: string) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      const due = billing(study).outstanding
      if (due <= 0) return no('Nothing is owed on this study')
      study.payments.push({ id: uid(`${study.id}-balance`), kind: 'balance', amount: due, at: iso() })
      return yes()
    }),

    /** Workflow 54: the team confirms the refund of unused incentive on an underfilled study. */
    confirmRefund: (studyId: string, actor: Actor) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      const b = billing(study)
      if (b.refund <= 0) return no('This study has no refund due')
      if (b.refundPaid > 0) return no('This refund has already been confirmed')
      study.payments.push({ id: `${study.id}-refund`, kind: 'refund', amount: b.refund, at: iso(), confirmedBy: actor.kind === 'team' ? actor.id : undefined })
      log(s, actor, `Confirmed a $${b.refund.toLocaleString('en-US')} refund for ${study.title}`, 'Finance / Refunds / Confirm')
      return yes()
    }),

    // ------------------------------------------------------ participations

    /** Workflow 26, 27: the client selects someone and the platform invites them. */
    invite: (studyId: string, personId: string, actor: Actor = SYSTEM) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (!isLive(study.state)) return no('Only a live study can invite people')
      const person = personById(s, personId)
      if (!person || person.status !== 'active') return no('That person cannot be invited')
      let p = participationOf(study, personId)
      if (!p) { p = { personId, state: 'matched', events: [] }; study.participations.push(p) }
      const moved = shift(p, 'invited')
      if (!moved.ok) return no(p.state === 'invited' ? 'They have already been invited' : 'They are already on this study')
      stamp(p, 'Invited')
      log(s, actor, `Invited ${nameOf(s, personId)} to apply for ${study.title}`, 'Studies / Matched / Invite')
      notify(s, personId, {
        kind: 'study', title: "You've been invited to a study!",
        body: `A researcher has directly invited you to participate in the ${study.title} study ($${study.rates.incentivePer}). Review the details and apply.`,
        actionLabel: 'View Invitation', to: `/studies/${study.id}`,
      })
      return yes()
    }),

    /** Workflow 15, 17, 57: the person starts the screener, if nothing stands in front of applying. */
    startApplication: (studyId: string, personId: string, preAnswers?: Answers) => move((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      const person = personById(s, personId)
      if (!study || !person) return no('No such study')
      if (!isLive(study.state)) return no('This study is not open for applications')
      const bar = barred(person); if (bar) return no(bar)
      if (!person.onboarded || person.identity.state !== 'verified') return no('Finish verification to apply')
      if (study.premium && person.profession.state !== 'verified') return no('Premium studies need a verified professional credential')
      let p = participationOf(study, personId)
      // A client who has already invited this person has waived their own repeat rule.
      if (study.repeatRule === 'exclude' && p?.state !== 'invited' && hasTakenPartWith(s, personId, study.clientId, study.id)) return no('This study is for first-time participants only')
      if (!p) { p = { personId, state: 'matched', events: [] }; study.participations.push(p) }
      const moved = shift(p, 'applying')
      if (!moved.ok) return moved
      // The eligibility answers they passed with are kept, beside the fact that they passed.
      if (preAnswers && study.preScreener.length > 0) { p.preAnswers = Object.fromEntries(study.preScreener.filter((q) => preAnswers[q.id] !== undefined).map((q) => [q.id, preAnswers[q.id]!])); p.prescreener = 'passed' }
      stamp(p, 'Application started')
      return yes()
    }),

    saveDraft: (studyId: string, personId: string, answers: Answers) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('No application to save')
      hit.p.answers = tidyAnswers(hit.study, answers)
      return hit.p.state === 'draft' ? yes() : shift(hit.p, 'draft')
    }),

    /** Workflow 28, 29: the screener is in. A simulated client decides after a short delay; a real one decides themselves. */
    submitScreener: (studyId: string, personId: string, answers?: Answers) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('No application to submit')
      const bar = barred(personById(s, personId)!); if (bar) return no(bar)
      const moved = shift(hit.p, 'applied')
      if (!moved.ok) return moved
      if (answers) hit.p.answers = tidyAnswers(hit.study, answers)
      hit.p.prescreener = 'passed'
      stamp(hit.p, 'Applied')
      if (clientOf(s, hit.study)?.simulated) s.pending.push({ kind: 'qualify', studyId, personId, dueAt: clock().getTime() + TIMINGS.screenerToInvite })
      return yes()
    }),

    /**
     * Workflow 32, 34: a person on the client's side, or the team, qualifies
     * or disqualifies an applicant. Going back to `applied` is the undo, and
     * the console draws it as available for one hour.
     */
    decide: (studyId: string, personId: string, to: 'qualified' | 'disqualified' | 'applied', actor: Actor) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (to === 'applied') {
        if (hit.p.state !== 'qualified' && hit.p.state !== 'disqualified') return no('There is no decision to undo')
        if (hit.p.decidedAt && clock().getTime() - new Date(hit.p.decidedAt).getTime() > DECISION_UNDO_MS) return no('The action can be undone within 1 hour only after it is taken')
      } else if (hit.p.state !== 'applied') return no(`${hit.p.state} cannot become ${to}`)
      const moved = shift(hit.p, to)
      if (!moved.ok) return moved
      hit.p.decidedAt = to === 'applied' ? undefined : iso()
      const who = nameOf(s, personId)
      if (to === 'qualified') {
        stamp(hit.p, isSessionType(hit.study.type) ? 'Invited to schedule' : 'Invited to complete')
        selected(s, hit.study, hit.p)
        log(s, actor, `Qualified ${who} in screener of ${hit.study.title}`, 'Studies / Screeners / Qualify')
      } else if (to === 'disqualified') {
        stamp(hit.p, 'Rejected')
        notify(s, personId, { kind: 'study', title: 'Application update!', body: `Unfortunately, you were not selected for the ${hit.study.title} study. Keep applying to other studies!`, to: `/studies/${hit.study.id}` })
        log(s, actor, `Disqualified ${who} in screener of ${hit.study.title}`, 'Studies / Screeners / Disqualify')
      } else {
        stamp(hit.p, 'Decision undone')
        log(s, actor, `Undid the screener decision on ${who} for ${hit.study.title}`, 'Studies / Screeners / Undo')
      }
      return yes()
    }),

    /** Workflow 33: the client confirms the shortlist and the incentive is charged. */
    recruit: (studyId: string, personId: string) => move((s) => {
      const hit = find(s, studyId, personId)
      return hit ? shift(hit.p, 'recruited') : no('Not on this study')
    }),

    /** Turning an invitation down, before or after applying. */
    withdraw: (studyId: string, personId: string) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      const moved = shift(hit.p, 'withdrawn')
      if (!moved.ok) return moved
      hit.p.booking = undefined; hit.p.code = undefined
      return yes()
    }),

    /** Workflow 38: book a session. A second booking is a reschedule: twice only, and only more than 24 hours before. */
    schedule: (studyId: string, personId: string, booking: Pick<Booking, 'date' | 'slot' | 'locationId'>) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      const { study, p } = hit
      const bar = barred(personById(s, personId)!); if (bar) return no(bar)
      if (!isSessionType(study.type)) return no('This study has no session to book')
      const again = p.state === 'scheduled'
      let count = p.booking?.rescheduleCount ?? 0
      if (again && p.booking) {
        const start = sessionStart(p.booking)
        const ok = canReschedule(count, start.toISOString(), clock())
        if (!ok.ok) return no(ok.reason ?? 'This session cannot be rescheduled')
        count += 1
      }
      const open = openAvailability(study, personId, clock()).find((a) => new Date(a.date).toDateString() === new Date(booking.date).toDateString())
      if (!open || !open.slots.includes(booking.slot)) return no('That slot has just been taken. Pick another one')
      const moved = shift(p, 'scheduled')
      if (!moved.ok) return moved
      const session = study.sessions?.find((x) => new Date(x.date).toDateString() === new Date(booking.date).toDateString())
      p.booking = { ...booking, sessionId: session?.id, rescheduleCount: count }
      p.code = { value: DEMO_SESSION_CODE, byParticipant: false, byClient: false }
      stamp(p, again ? 'Rescheduled' : 'Scheduled')
      return yes()
    }),

    /**
     * Policy section 5: a participant may cancel more than 24 hours before the
     * session, at -2 Trust Score. Inside 24 hours they cannot; not attending
     * is then a no-show at -4. The slot is released and the person may apply again.
     */
    cancelSession: (studyId: string, personId: string) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (hit.p.state !== 'scheduled') return no('There is no booked session to cancel')
      if (hit.p.booking) { const ok = canCancel(sessionStart(hit.p.booking).toISOString(), clock()); if (!ok.ok) return no(ok.reason ?? 'This session can no longer be cancelled') }
      hit.p.state = 'withdrawn'; hit.p.booking = undefined; hit.p.code = undefined
      stamp(hit.p, 'Cancelled')
      personById(s, personId)?.trustEvents.push({ kind: 'cancelled_session', detail: hit.study.title, studyId, at: iso() })
      return yes()
    }),

    /** Policy section 5: the client or the team cancels a booked session. It costs the participant nothing, and they are told. */
    cancelSessionFor: (studyId: string, personId: string, actor: Actor, reason = '') => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (hit.p.state !== 'scheduled') return no('There is no booked session to cancel')
      if (actor.kind !== 'client' && actor.kind !== 'team') return no('Only the client or the team can cancel a session for a participant')
      cancelFor(s, hit.study, hit.p, actor.kind, reason.trim())
      log(s, actor, `Cancelled ${nameOf(s, personId)}'s session on ${hit.study.title}`, 'Studies / Sessions / Cancel')
      return yes()
    }),

    /** Workflow 42, the participant's half: they enter the code at the end of the session. */
    confirmPin: (studyId: string, personId: string, code: string) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit || hit.p.state !== 'scheduled' || !hit.p.code) return no('There is no booked session for this code')
      { const bar = barred(personById(s, personId)!); if (bar) return no(bar) }
      if (hit.p.code.value !== code) return no('Incorrect PIN, check with your interviewer')
      hit.p.code.byParticipant = true
      stamp(hit.p, 'Session code confirmed')
      return yes()
    }),

    /** Workflow 42, the client's half. "No code, no payment." */
    enterClientCode: (studyId: string, personId: string, code: string) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (!hit.p.code) return no('No code has been generated for this session yet')
      if (hit.p.code.value !== code) return no('That code does not match the one shown at the end of the session')
      hit.p.code.byClient = true
      return yes()
    }),

    /**
     * Workflow 42 to 45: the participation is completed. The participant
     * completes a survey or diary themselves, and a session once their code
     * is in; the client or the team needs the code from both sides. Nothing
     * is paid here: once the study finishes, the team processes the payouts
     * by hand in the console (processPayouts).
     */
    complete: (studyId: string, personId: string, actor: Actor, taskAnswers?: Answers) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      const { study, p } = hit
      if (actor.kind === 'participant') { const bar = barred(personById(s, personId)!); if (bar) return no(bar) }
      const session = isSessionType(study.type)
      if (session && p.state !== 'scheduled' && p.state !== 'no_show') return no('A session has to be booked before it can be completed')
      if (session && actor.kind === 'participant' && !p.code?.byParticipant) return no('Enter the session code first')
      if (session && actor.kind === 'participant' && sessionNotStarted(p.booking, clock())) return no('Your session has not started yet. Complete the study once it has run.')
      if (session && actor.kind !== 'participant' && !(p.code?.byClient && p.code?.byParticipant)) return no('No code, no payment. Both sides have to enter the session code.')
      if (!diaryReady(study, p)) return no(`At least ${study.diary?.minDays} of ${study.diary?.totalDays} days must be filled`)
      // A survey is its answers: a participant cannot hand in one with a question left out.
      const unanswered = study.type === 'survey' && actor.kind === 'participant' && taskAnswers
        ? (study.tasks ?? []).findIndex((q) => { const v = taskAnswers[q.id]; return !q.optional && (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) }) : -1
      if (unanswered >= 0) return no(`Question ${unanswered + 1} has not been answered`)
      const moved = shift(p, 'completed')
      if (!moved.ok) return moved
      if (taskAnswers && study.type === 'survey') p.taskAnswers = tidyAnswers(study, taskAnswers)
      p.completedAt = iso()
      p.events.push({ label: actor.kind === 'participant' ? 'Completed' : 'Marked as completed', at: p.completedAt }, { label: 'Earnings credited', at: p.completedAt })
      if (actor.kind !== 'participant') log(s, actor, `Marked ${nameOf(s, personId)} as completed on ${study.title}`, 'Studies / Sessions / Complete')
      return yes()
    }),

    /** The undo of Mark Completed, until the payout has been approved. */
    uncomplete: (studyId: string, personId: string, actor: Actor = SYSTEM) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (hit.p.state !== 'completed') return no('They are not marked as completed')
      if (hit.p.paidAt) return no('The payout has already been processed; this can no longer be undone')
      if (!isSessionType(hit.study.type)) return no('Only a session can be marked back')
      hit.p.state = 'scheduled'; hit.p.completedAt = undefined
      stamp(hit.p, 'Completion undone')
      log(s, actor, `Undid the completion of ${nameOf(s, personId)} on ${hit.study.title}`, 'Studies / Sessions / Undo')
      return yes()
    }),

    /** Workflow 43. Policy: a no-show costs 4 Trust Score and the person is not paid. */
    markNoShow: (studyId: string, personId: string, actor: Actor) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      const moved = shift(hit.p, 'no_show')
      if (!moved.ok) return moved
      // Policy: a no-show is not paid; they are never on the payout list.
      stamp(hit.p, 'No Show')
      log(s, actor, `Marked ${nameOf(s, personId)} as no-show on ${hit.study.title}`, 'Studies / Sessions / No-show')
      return yes()
    }),

    /** The undo of a no-show: back to the booked session. */
    undoNoShow: (studyId: string, personId: string, actor: Actor = SYSTEM) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit || hit.p.state !== 'no_show') return no('They are not marked as a no-show')
      hit.p.state = 'scheduled'
      stamp(hit.p, 'No-show undone')
      log(s, actor, `Undid the no-show of ${nameOf(s, personId)} on ${hit.study.title}`, 'Studies / Sessions / Undo')
      return yes()
    }),

    /** One diary entry: the day is marked filled and its answers are kept with it. */
    completeDiaryDay: (studyId: string, personId: string, day: number, answers?: Answers) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit || !hit.study.diary) return no('This is not a diary study')
      { const bar = barred(personById(s, personId)!); if (bar) return no(bar) }
      if (day < 1 || day > hit.study.diary.totalDays) return no('No such diary day')
      hit.p.diaryDays = [...new Set([...(hit.p.diaryDays ?? []), day])].sort((a, b) => a - b)
      if (answers) hit.p.diaryAnswers = { ...hit.p.diaryAnswers, [String(day)]: tidyAnswers(hit.study, answers) }
      return yes()
    }),

    /**
     * Workflow 52: the client rates a participant with the three-state
     * control. The stars the policy's table needs are stored (rules.ts,
     * starsForRating).
     */
    rateParticipant: (studyId: string, personId: string, rating: RatingState | 'dimensions', extra: Pick<ParticipantRating, 'comment' | 'expertise' | 'reliability' | 'communication'> = {}, actor: Actor = SYSTEM) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (hit.p.state !== 'completed') return no('Only someone who completed the study can be rated')
      if (hit.p.rating) return no('They have already been rated for this study')
      if (rating === 'dimensions') {
        // The console's Rate panel: three five-star dimensions, no three-state control (rules.ts, starsFromDimensions).
        const stars = starsFromDimensions(extra)
        if (!stars) return no('Rate all three: expertise, reliability and communication')
        hit.p.rating = { ...extra, stars, at: iso() }
      } else hit.p.rating = { ...extra, stars: starsForRating(rating), state: rating, at: iso() }
      log(s, actor, `Rated ${nameOf(s, personId)} ${hit.p.rating.stars} stars for ${hit.study.title}`, 'Studies / Results / Rate')
      return yes()
    }),

    /** The participant's review of the client, once they have been paid. */
    reviewClient: (studyId: string, personId: string, review: Omit<ClientReview, 'at'>) => move((s) => {
      const hit = find(s, studyId, personId)
      if (!hit) return no('Not on this study')
      if (!hit.p.paidAt) return no('You can rate the client once the study has been paid')
      hit.p.clientReview = { ...review, at: iso() }
      return yes()
    }),

    /**
     * The team processes a finished study's payouts by hand in the console.
     * Everyone who completed is paid, except a session whose code was not
     * entered on both sides ("no code, no payment"), who stays on the list.
     * Only the team can do this, and only once the study has finished.
     */
    processPayouts: (studyId: string, actor: Actor) => move<{ paid: number; held: number }>((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      if (actor.kind !== 'team') return no('Payouts are processed by the Focus Insite team')
      if (study.state !== 'completed') return no('Payouts are processed once the study has finished')
      const { owed, ready } = owedOn(study)
      if (owed.length === 0) return no('Nobody on this study is waiting to be paid')
      if (ready.length === 0) return no(`${plural(owed.length, 'payout')} cannot be processed yet: no code, no payment`)
      ready.forEach((p) => pay(s, study, p))
      log(s, actor, `Processed ${plural(ready.length, 'payout')} (${usd(ready.length * study.rates.incentivePer)}) for ${study.title}`, 'Finance / Payouts / Process')
      return yes({ paid: ready.length, held: owed.length - ready.length })
    }),

    toggleSaved: (personId: string, studyId: string) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.savedStudyIds = person.savedStudyIds.includes(studyId) ? person.savedStudyIds.filter((x) => x !== studyId) : [...person.savedStudyIds, studyId]
      return yes()
    }),

    // ---------------------------------------------------------------- people

    /** Workflow 15: a new account can browse straight away; profile and ID come at the point of applying. */
    signUpPerson: (email: string, sourceCode?: string) => move<{ id: string }>((s) => {
      const clean = email.trim().toLowerCase()
      const existing = s.people.find((p) => p.email.toLowerCase() === clean)
      if (existing) return yes({ id: existing.id })
      const id = uid('p')
      s.people.push({
        id, name: '', email: clean, phone: '', joinedAt: iso(), lastActiveAt: iso(), status: 'active', location: '', profile: { ...EMPTY_PROFILE },
        onboarded: false, taxFormDone: false, sourceCode,
        identity: { state: 'not_started' }, profession: { state: 'not_started' }, livePhoto: false,
        consent: { shareProfession: false, shareProfile: true, essentialCookies: true, performanceCookie: true },
        emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
        prior: { completedThisYear: 0, stars: [] }, trustEvents: [], payoutMethods: [], payouts: [], redemptions: [], referrals: [], savedStudyIds: [],
        notifications: [{
          id: 'nt-welcome', kind: 'profile', title: 'Welcome to HumanLayer!', read: false, at: iso(),
          body: 'Browse and search studies right away. Finish your profile and verify your ID when you apply to your first one.',
          actionLabel: 'Complete Profile', to: '/onboarding/about',
        }],
      })
      // Policy section 3: the referrer earns their 200 points when the person they referred joins.
      const referrer = sourceCode ? s.people.find((x) => x.id !== id && referralCode(x.name, x.email).toLowerCase() === sourceCode.toLowerCase()) : undefined
      if (referrer) {
        referrer.referrals.unshift({ id: uid('rf'), name: clean.split('@')[0]!, email: clean, status: 'joined', at: iso() })
        notify(s, referrer.id, { kind: 'referral', title: 'Your friend just signed up!', body: `${clean} joined with your link. You earned ${POINTS.REFERRAL} reward points.`, to: '/profile/referrals' })
      }
      return yes({ id })
    }),

    /** Saves profile edits. The first time the profile is complete is remembered, which is what the points award is read from. */
    updatePerson: (personId: string, patch: Partial<Pick<Person, 'name' | 'email' | 'phone' | 'location' | 'onboarded' | 'taxFormDone' | 'photo'>> & { profile?: Partial<Person['profile']>; identityVerified?: boolean; licenseVerified?: boolean }) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      const { profile, identityVerified, licenseVerified, ...rest } = patch
      /** A field left out of the patch is left alone: an absent value never overwrites a stored one. */
      Object.assign(person, Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)))
      if (profile) person.profile = { ...person.profile, ...profile }
      if (profile?.address) person.location = profile.address
      /** The automatic ID check passes in the demo (workflow 15). A credential added to the profile is taken as checked against the register (workflow 17). */
      if (identityVerified && person.identity.state === 'not_started') person.identity = { state: 'verified' }
      // Policy section 7: the certificate is issued when identity verification completes, its ID generated once and kept.
      if (person.identity.state === 'verified') person.certificateId ??= freshCertificateId(s, 'participant')
      if (licenseVerified && person.profession.state === 'not_started') person.profession = { state: 'verified' }
      if (!person.fullProfileAt && profileCompletion(person) >= 100) person.fullProfileAt = iso()
      person.lastActiveAt = iso()
      return yes()
    }),

    /**
     * The participant's own picture, a data URL already cut down to 640 by 480
     * at most, or null to remove it. Adding one the first time earns its points;
     * removing it does not take them back. A new picture keeps the consent as it was.
     */
    setPicture: (personId: string, dataUrl: string | null) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (dataUrl && !dataUrl.startsWith('data:image/')) return no('A picture must be an image')
      if (dataUrl) { person.photo = dataUrl; person.pictureAddedAt ??= iso() } else { delete person.photo; person.photoConsent = false }
      person.lastActiveAt = iso()
      return yes()
    }),

    /** The intro video's reference (the file itself is in IndexedDB), or null to remove it. Points as for the picture. */
    setVideo: (personId: string, video: Person['video'] | null) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (video) { person.video = video; person.videoAddedAt ??= iso(); person.profile.introVideo = video.name } else { delete person.video; person.videoConsent = false; person.profile.introVideo = '' }
      person.lastActiveAt = iso()
      return yes()
    }),

    /** Consent to show clients (and the console) the picture or the video. Off is immediate everywhere: every other screen reads sharedPhoto and sharedVideo. */
    setMediaConsent: (personId: string, what: 'photo' | 'video', on: boolean) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (on && !(what === 'photo' ? person.photo : person.video)) return no(what === 'photo' ? 'Add a picture first' : 'Add a video first')
      if (what === 'photo') person.photoConsent = on; else person.videoConsent = on
      return yes()
    }),

    setConsent: (personId: string, key: keyof Person['consent'], value: boolean) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (key !== 'essentialCookies') person.consent[key] = value
      return yes()
    }),

    setEmailPref: (personId: string, key: keyof Person['emailPrefs'], value: boolean) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.emailPrefs[key] = value
      return yes()
    }),

    addPayoutMethod: (personId: string, method: PayoutMethod) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.payoutMethods.push({ ...method, isDefault: method.isDefault || person.payoutMethods.length === 0 })
      return yes()
    }),
    removePayoutMethod: (personId: string, id: string) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.payoutMethods = person.payoutMethods.filter((m) => m.id !== id)
      return yes()
    }),
    setDefaultPayoutMethod: (personId: string, id: string) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.payoutMethods.forEach((m) => { m.isDefault = m.id === id })
      return yes()
    }),

    /** A withdrawal: checked against the balance, the fee and the tax form (workflow 49). */
    requestPayout: (personId: string, amount: number, destination: string) => move<{ id: string }>((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      const bar = barred(person); if (bar) return no(bar)
      const f = personFigures(s, personId, clock())
      if (f.taxFormRequired) return no('A tax form is needed before you can withdraw')
      const ok = canWithdraw(amount, f.walletBalance)
      if (!ok.ok) return no(ok.reason ?? 'That amount cannot be withdrawn')
      const id = uid('po')
      person.payouts.unshift({ id, at: iso(), amount, destination, txId: `#${Math.floor(100000000000 + Math.random() * 899999999999)}`, status: 'pending', expectedBy: withdrawalExpectedBy(iso()) })
      return yes({ id })
    }),

    /**
     * Release Payout (console 2317:160440): the team sends a participant's
     * withdrawal. It is paid from here, the participant is told, and the
     * member who released it is on the record.
     */
    releasePayout: (personId: string, payoutId: string, actor: Actor) => move((s) => {
      if (actor.kind !== 'team') return no('Only the team can release a payout')
      const person = personById(s, personId)
      const payout = person?.payouts.find((x) => x.id === payoutId)
      if (!person || !payout) return no('No such withdrawal')
      if (!canMovePayout(payout.status, 'paid')) return no('This withdrawal has already been released')
      payout.status = 'paid'; payout.releasedAt = iso(); payout.releasedBy = actor.id
      // The respondent app tells them from the payout itself (src/lib/notifications.ts), dated when it was released.
      log(s, actor, `Released a $${payout.amount.toLocaleString('en-US')} withdrawal to ${person.name}`, 'Finance / Payouts / Release')
      return yes()
    }),

    /** Policy section 4: 100 points to $1, 1,000 points at least. */
    redeem: (personId: string, points: number) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      const bar = barred(person); if (bar) return no(bar)
      const ok = canRedeem(points, personFigures(s, personId, clock()).points)
      if (!ok.ok) return no(ok.reason ?? 'Those points cannot be redeemed')
      person.redemptions.unshift({ id: uid('rd'), at: iso(), points, reference: `#${Math.floor(100000000 + Math.random() * 899999999)}` })
      return yes()
    }),

    notify: (personId: string, n: Omit<AppNotification, 'id' | 'at' | 'read'>) => move((s) => { notify(s, personId, n); return yes() }),
    markNotificationsRead: (personId: string, id?: string) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      person.notifications.forEach((n) => { if (!id || n.id === id) n.read = true })
      return yes()
    }),
    /** The notifications a returning account starts with are written once, from its own history. */
    seedNotifications: (personId: string, rows: AppNotification[]) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (person.notifications.length > 0) return no('Already has notifications')
      person.notifications = rows
      return yes()
    }),

    /** Console: deactivate, reactivate or restrict a participant. A reason is required. */
    setPersonStatus: (personId: string, status: Person['status'], reason: string, actor: Actor) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (person.status === status) return no(`This account is already ${status}`)
      if (!reason.trim()) return no('A reason is required')
      const result = status === 'restricted' ? restrict(s, person, 'Team decision', reason.trim(), actor)
        : status === 'deactivated' ? (deactivate(s, person, 'Team decision', reason.trim(), actor), 'deactivated' as const)
        : (person.status = 'active', person.statusNote = undefined, 'active' as const)
      if (result === 'active') notify(s, person.id, { kind: 'profile', title: 'Your account is active again', body: 'You can take part in studies, withdraw and redeem again.', to: '/dashboard' })
      log(s, actor, `${result === 'active' ? 'Reactivated' : result === 'restricted' ? 'Restricted' : 'Deactivated'} the account of ${person.name}`, `Participants / Profile / ${status === 'active' ? 'Reactivate' : status === 'restricted' ? 'Restrict' : 'Deactivate'}`)
      return yes()
    }),

    /** Policy section 9: a deactivated participant can appeal. The appeal reaches the team as a support ticket. */
    appealDeactivation: (personId: string, text: string) => move<{ id: string }>((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      if (person.status !== 'deactivated') return no('This account is not deactivated')
      if (!text.trim()) return no('Say why the decision should be reviewed')
      const ticketId = `FI-S${Math.floor(100000 + Math.random() * 899999)}`
      const at = iso()
      s.tickets.unshift({
        id: ticketId, owner: { kind: 'participant', id: personId }, subject: 'Appeal against account deactivation',
        message: text.trim(), topic: 'general', status: 'open', createdAt: at, lastActivityAt: at,
        messages: [{ id: uid('tm'), from: 'user', text: `Deactivation reason given: ${person.statusNote?.reason ?? 'none'}\n\nAppeal: ${text.trim()}`, at }],
      } as PlatformState['tickets'][number])
      return yes({ id: ticketId })
    }),

    /** Workflow 3, 17: a person settles a check the automatic one could not. */
    decideCheck: (personId: string, kind: 'identity' | 'profession', verdict: 'verified' | 'rejected', statement: string, actor: Actor) => move((s) => {
      const person = personById(s, personId)
      if (!person) return no('No such account')
      const check: Check = person[kind]
      if (check.state !== 'flagged') return no('This check is not waiting for a decision')
      if (!statement.trim()) return no('A statement is required')
      person[kind] = { ...check, state: verdict, note: statement.trim(), decidedAt: iso(), decidedBy: actor.kind === 'team' ? actor.id : undefined }
      if (kind === 'identity' && verdict === 'verified') { person.onboarded = true; person.certificateId ??= freshCertificateId(s, 'participant') }
      log(s, actor, `${verdict === 'verified' ? 'Verified' : 'Rejected'} ${kind} ${verdict === 'verified' ? 'of' : 'verification of'} ${person.name}`, `Participants / Verifications / ${verdict === 'verified' ? 'Verify' : 'Reject'}`)
      return yes()
    }),

    /**
     * Console, Reported: reject the report, restrict the account or
     * deactivate it. An upheld report of AI or bot activity is the fraud the
     * policy deducts 20 for.
     */
    /**
     * Report Participant (client 2313:83208): a client reports someone on one
     * of its studies. It opens a case in the console's Reported queue, which
     * `decideReport` settles; nothing happens to the person until then.
     */
    reportParticipant: (clientId: string, personId: string, reason: Report['reason'], detail: string, studyId?: string) => move<{ id: string }>((s) => {
      if (!s.clients.some((c) => c.id === clientId)) return no('No such client')
      if (!personById(s, personId)) return no('No such participant')
      if (studyId && !s.studies.some((x) => x.id === studyId && x.clientId === clientId)) return no('That study is not yours')
      const text = detail.trim()
      if (!text) return no('Describe your report')
      if (text.length > REPORT_MAX_CHARS) return no(`Keep it to ${REPORT_MAX_CHARS} characters`)
      const id = uid('rp')
      s.reports.unshift({ id, personId, reportedBy: clientId, reason, detail: text, studyId, at: iso() })
      return yes({ id })
    }),

    /** Report Study (respondent app): a respondent reports a study they can see. Nothing changes for the study until the team looks. */
    reportStudy: (personId: string, studyId: string, reason: string, detail: string) => move<{ id: string }>((s) => {
      if (!personById(s, personId)) return no('No such account')
      const study = s.studies.find((x) => x.id === studyId)
      if (!study || study.state === 'draft' || study.state === 'in_review') return no('That study is not open to report')
      if (!reason.trim()) return no('Choose a reason')
      const text = detail.trim()
      if (!text) return no('Describe your report')
      if (text.length > REPORT_MAX_CHARS) return no(`Keep it to ${REPORT_MAX_CHARS} characters`)
      const id = uid('sr')
      s.studyReports = [{ id, studyId, personId, reason: reason.trim(), detail: text, at: iso() }, ...(s.studyReports ?? [])]
      return yes({ id })
    }),

    /** Chat With Client: a support ticket to the study's client about its open reports, kept with those reports. */
    chatAboutReports: (studyId: string, actor: Actor) => move<{ id: string }>((s) => {
      const study = s.studies.find((x) => x.id === studyId)
      if (!study) return no('No such study')
      const open = (s.studyReports ?? []).filter((r) => r.studyId === studyId && !r.resolution)
      if (!open.length) return no('This study has no open reports')
      const already = open.find((r) => r.ticketId)?.ticketId
      if (already && s.tickets.some((t) => t.id === already && t.status === 'open')) return yes({ id: already })
      const id = `FI-S${Math.floor(100000 + Math.random() * 899999)}`
      s.tickets.unshift({
        id, owner: { kind: 'client', id: study.clientId }, createdByTeam: true, subject: `Reports on ${study.title}`, studyTitle: study.title,
        message: `Participants have reported ${study.title} (${open.length} open). We would like to talk this through with you.`, topic: 'general', status: 'open',
        createdAt: iso(), lastActivityAt: iso(), messages: [],
      })
      open.forEach((r) => { r.ticketId = id })
      log(s, actor, `Opened a chat with the client about reports on ${study.title}`, 'Studies / Reported / Chat With Client')
      return yes({ id })
    }),

    /**
     * Mark Reports Resolved (2314:147678): every open report on the study is
     * closed with one statement, confirmed with the team member's password.
     */
    resolveStudyReports: (studyId: string, statement: string, password: string, actor: Actor) => move<{ count: number }>((s) => {
      if (actor.kind !== 'team') return no('Only the team can resolve reports')
      const member = s.team.find((t) => t.id === actor.id)
      if (!member || member.password !== password) return no('That password is not right')
      const open = (s.studyReports ?? []).filter((r) => r.studyId === studyId && !r.resolution)
      if (!open.length) return no('This study has no open reports')
      if (!statement.trim()) return no('A statement is required')
      const resolution = { id: uid('rs'), at: iso(), by: actor.id, statement: statement.trim(), ticketId: open.find((r) => r.ticketId)?.ticketId }
      open.forEach((r) => { r.resolution = resolution })
      const study = s.studies.find((x) => x.id === studyId)
      log(s, actor, `Resolved ${plural(open.length, 'report')} on ${study?.title ?? 'a study'}`, 'Studies / Reported / Mark Resolved')
      return yes({ count: open.length })
    }),

    decideReport: (reportId: string, outcome: NonNullable<Report['outcome']>, statement: string, actor: Actor) => move((s) => {
      const report = s.reports.find((r) => r.id === reportId)
      if (!report) return no('No such report')
      if (report.outcome) return no('This report has already been decided')
      if (!statement.trim()) return no('A statement is required')
      const person = personById(s, report.personId)
      if (!person) return no('No such account')
      report.note = statement.trim(); report.decidedAt = iso(); report.decidedBy = actor.kind === 'team' ? actor.id : undefined
      // A restriction that is the fourth offence is a deactivation; the report records what actually happened.
      report.outcome = outcome === 'restricted' ? restrict(s, person, report.reason, statement.trim(), actor) : outcome
      if (outcome === 'deactivated') deactivate(s, person, report.reason, statement.trim(), actor)
      if (outcome !== 'rejected') {
        if (report.reason === 'AI/Bot Activity') person.trustEvents.push({ kind: 'fraud', detail: `Upheld report: ${report.detail}`, studyId: report.studyId, at: iso() })
      }
      log(s, actor, `${outcome === 'rejected' ? 'Rejected a report on' : outcome === 'restricted' ? 'Restricted the account of' : 'Deactivated the account of'} ${person.name}`, `Participants / Reported / ${outcome === 'rejected' ? 'Reject' : outcome === 'restricted' ? 'Restrict' : 'Deactivate'}`)
      return yes()
    }),

    // --------------------------------------------------------------- clients

    signUpClient: (c: Pick<Client, 'name' | 'email'> & Partial<Client>) => move<{ id: string }>((s) => {
      const clean = c.email.trim().toLowerCase()
      const existing = s.clients.find((x) => x.email.toLowerCase() === clean)
      if (existing) return yes({ id: existing.id })
      const id = uid('cl')
      s.clients.push({
        role: '', company: '', industry: '', location: '', taxId: '', website: '', joinedAt: iso(), lastActiveAt: iso(), status: 'active',
        business: { state: 'not_started' }, earlierReviews: [], cards: [], simulated: false, ...c, id, email: clean,
      })
      return yes({ id })
    }),

    updateClient: (clientId: string, patch: Partial<Pick<Client, 'name' | 'role' | 'company' | 'industry' | 'location' | 'taxId' | 'website'>>) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      Object.assign(client, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)))
      /** Workflow 3: a new client's business details are checked; the automatic check passes in the demo. The tax ID is optional, so the website is what it needs. */
      if (client.business.state === 'not_started' && client.company && client.website) client.business = { state: 'verified' }
      return yes()
    }),

    setClientStatus: (clientId: string, status: Client['status'], reason: string, actor: Actor) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      if (client.status === status) return no(`This account is already ${status}`)
      if (!reason.trim()) return no('A reason is required')
      client.status = status
      client.statusNote = status === 'active' ? undefined : { reason: reason.trim(), at: iso(), by: actor.kind === 'team' ? actor.id : '' }
      log(s, actor, `${status === 'active' ? 'Reactivated' : 'Deactivated'} the account of ${client.company}`, `Clients / Profile / ${status === 'active' ? 'Reactivate' : 'Deactivate'}`)
      return yes()
    }),

    /** Workflow 18: the team settles a business check. A rejected business is deactivated. */
    decideBusiness: (clientId: string, verdict: 'verified' | 'rejected', statement: string, actor: Actor) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      if (client.business.state !== 'flagged') return no('This check is not waiting for a decision')
      if (!statement.trim()) return no('A statement is required')
      client.business = { ...client.business, state: verdict, note: statement.trim(), decidedAt: iso(), decidedBy: actor.kind === 'team' ? actor.id : undefined }
      if (verdict === 'verified') client.certificateId ??= freshCertificateId(s, 'business')
      if (verdict === 'rejected') { client.status = 'deactivated'; client.statusNote = { reason: 'Could not verify the business, hence deactivated.', at: iso(), by: actor.kind === 'team' ? actor.id : '' } }
      log(s, actor, `${verdict === 'verified' ? 'Verified business of' : 'Rejected business verification of'} ${client.company}`, `Clients / Verifications / ${verdict === 'verified' ? 'Verify' : 'Reject'}`)
      return yes()
    }),

    addCard: (clientId: string, card: Omit<SavedCard, 'isDefault'>) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      client.cards.push({ ...card, isDefault: client.cards.length === 0 })
      return yes()
    }),
    removeCard: (clientId: string, last4: string) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      client.cards = client.cards.filter((c) => c.last4 !== last4)
      if (client.cards.length > 0 && !client.cards.some((c) => c.isDefault)) client.cards[0]!.isDefault = true
      return yes()
    }),
    /** The client edits a saved card or replaces it with another. It keeps its place and whether it is the default. */
    updateCard: (clientId: string, last4: string, card: Omit<SavedCard, 'isDefault'>) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      const at = client.cards.findIndex((c) => c.last4 === last4)
      if (at < 0) return no('That card is no longer on file')
      if (card.last4 !== last4 && client.cards.some((c) => c.last4 === card.last4)) return no(`A card ending ${card.last4} is already on file`)
      client.cards[at] = { ...card, isDefault: client.cards[at]!.isDefault }
      return yes()
    }),
    /** The client has read their notifications: one, or all of them. */
    markClientNoticesRead: (clientId: string, id?: string) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      client.notifications = (client.notifications ?? []).map((n) => (!id || n.id === id ? { ...n, read: true } : n))
      return yes()
    }),
    setDefaultCard: (clientId: string, last4: string) => move((s) => {
      const client = s.clients.find((c) => c.id === clientId)
      if (!client) return no('No such client')
      client.cards.forEach((c) => { c.isDefault = c.last4 === last4 })
      return yes()
    }),

    // --------------------------------------------------------------- support

    /** Workflow 56. A participant or a client raises a ticket, or the team opens one for them. */
    createTicket: (owner: Ticket['owner'], t: { subject: string; message: string; topic?: Ticket['topic']; studyTitle?: string }, actor: Actor = SYSTEM) => move<{ id: string }>((s) => {
      if (!t.message.trim()) return no('Write a message')
      const id = `FI-S${Math.floor(100000 + Math.random() * 899999)}`
      const byTeam = actor.kind === 'team'
      s.tickets.unshift({
        id, owner, createdByTeam: byTeam || undefined, subject: t.subject || 'Support request', message: t.message, studyTitle: t.studyTitle,
        topic: t.topic ?? 'general', status: 'open', createdAt: iso(), lastActivityAt: iso(),
        messages: [{ id: 'm1', from: byTeam ? 'team' : 'user', by: byTeam ? actor.id : undefined, text: t.message, at: iso() }],
      })
      log(s, actor, `Created ticket #${id}`, 'Support / Tickets / Create')
      return yes({ id })
    }),

    replyTicket: (ticketId: string, from: 'user' | 'team' | 'auto', text: string, actor: Actor = SYSTEM, attachment?: string) => move((s) => {
      const t = s.tickets.find((x) => x.id === ticketId)
      if (!t) return no('No such ticket')
      if (t.status === 'closed') return no('This ticket has been resolved and closed')
      if (!text.trim()) return no('Write a message')
      t.messages.push({ id: uid('m'), from, by: actor.kind === 'team' ? actor.id : undefined, text: text.trim(), attachment, at: iso() })
      t.lastActivityAt = iso()
      if (from === 'team') {
        log(s, actor, `Replied to ticket #${t.id}`, 'Support / Tickets / Reply')
        if (t.owner.kind === 'participant') notify(s, t.owner.id, { kind: 'support', title: 'New reply on your support ticket', body: `The support team has responded to your ticket #${t.id}. Check update!`, actionLabel: 'View Message', to: `/support/tickets/${t.id}` })
      }
      return yes()
    }),

    resolveTicket: (ticketId: string, actor: Actor = SYSTEM) => move((s) => {
      const t = s.tickets.find((x) => x.id === ticketId)
      if (!t) return no('No such ticket')
      if (t.status === 'closed') return no('This ticket is already closed')
      t.status = 'closed'; t.closedAt = iso(); t.lastActivityAt = iso()
      log(s, actor, `Resolved ticket #${t.id}`, 'Support / Tickets / Resolve')
      return yes()
    }),

    reopenTicket: (ticketId: string, actor: Actor = SYSTEM) => move((s) => {
      const t = s.tickets.find((x) => x.id === ticketId)
      if (!t) return no('No such ticket')
      if (t.status === 'open') return no('This ticket is already open')
      t.status = 'open'; t.closedAt = undefined; t.lastActivityAt = iso()
      log(s, actor, `Re-opened ticket #${t.id}`, 'Support / Tickets / Re-open')
      return yes()
    }),

    // ------------------------------------------------------------------ team

    saveTeamMember: (m: { id?: string; name: string; email: string; role: string; access: Module[]; active: boolean }, actor: Actor) => move<{ id: string }>((s) => {
      if (!m.name.trim() || !m.email.trim()) return no('A name and an email address are required')
      const existing = m.id ? s.team.find((t) => t.id === m.id) : undefined
      if (existing?.master) return no('The master admin’s access cannot be changed here')
      const id = existing?.id ?? uid('tm')
      const email = m.email.trim().toLowerCase()
      if (s.team.some((t) => t.id !== id && t.email.toLowerCase() === email)) return no('Another team member already uses that email address')
      /** No frame draws how a new sub-admin gets a password, so in this build they start on the demo password. */
      const next: TeamMember = { ...existing, id, name: m.name.trim(), email: m.email.trim(), role: m.role.trim(), access: m.access, active: m.active, password: existing?.password ?? DEMO_TEAM_PASSWORD }
      if (existing) s.team[s.team.indexOf(existing)] = next
      else s.team.push(next)
      log(s, actor, `${existing ? 'Updated' : 'Created'} the sub-admin profile of ${next.name}`, `Sub-Admin / Profile / ${existing ? 'Edit' : 'Create'}`)
      return yes({ id })
    }),

    /**
     * Console sign-in. Checks the email and password against the team as the
     * platform holds it and changes nothing. A seeded demo login always works:
     * when the platform is someone's empty one, or the login is the master
     * admin's, the demo state is put back first, as the respondent app's sign
     * in does.
     */
    signInTeam: (email: string, password: string): Result<{ id: string; reset: boolean }> => {
      const key = email.trim().toLowerCase()
      const latest = read() ?? state
      const here = latest.team.find((t) => t.email.toLowerCase() === key)
      const seeded = buildSeed(clock()).team.find((t) => t.email.toLowerCase() === key)
      const who = here ?? seeded
      if (!who) return no('No team account uses that email address')
      if (who.password !== password) return { ok: false, why: 'That password is not right' }
      if (!who.active) return no('This account is inactive. Ask the master admin to activate it')
      const reset = !here || (who.id === MASTER_ADMIN_ID && Boolean(seeded))
      if (reset) { state = buildSeed(clock()); write(state); emit() }
      return yes({ id: who.id, reset })
    },

    /** A console decision confirmed with a password: is it this team member's own? Changes nothing. */
    checkTeamPassword: (memberId: string, password: string): Result => {
      const member = state.team.find((t) => t.id === memberId)
      if (!password) return no('Enter your password')
      return member && member.password === password ? yes() : no('That password is not right')
    },

    /** Whether a new team account could be made with this email. */
    teamEmailFree: (email: string): boolean => {
      const key = email.trim().toLowerCase()
      return ![...(read() ?? state).team, ...buildSeed(clock()).team].some((t) => t.email.toLowerCase() === key)
    },

    /** My Account, Edit Profile: a team member's own name and email. */
    updateTeamProfile: (memberId: string, patch: { name: string; email: string }) => move((s) => {
      const t = s.team.find((x) => x.id === memberId)
      if (!t) return no('No such team member')
      if (!patch.name.trim() || !patch.email.trim()) return no('A name and an email address are required')
      if (s.team.some((x) => x.id !== memberId && x.email.toLowerCase() === patch.email.trim().toLowerCase())) return no('Another team member already uses that email address')
      t.name = patch.name.trim(); t.email = patch.email.trim()
      log(s, { kind: 'team', id: memberId }, 'Updated their profile', 'My Account / Profile / Edit')
      return yes()
    }),

    /** My Account, Change Password: the current one has to be right. */
    changeTeamPassword: (memberId: string, current: string, next: string) => move((s) => {
      const t = s.team.find((x) => x.id === memberId)
      if (!t) return no('No such team member')
      if (t.password !== current) return no('The current password is not right')
      t.password = next
      log(s, { kind: 'team', id: memberId }, 'Changed their password', 'My Account / Settings / Change Password')
      return yes()
    }),
  }

  return api
}

export { sessionStartOf as sessionStart } from './derive'

export type Platform = ReturnType<typeof createPlatform>

let instance: Platform | undefined
/** The one platform every app on this origin shares. */
export const platform = (): Platform => (instance ??= createPlatform())
