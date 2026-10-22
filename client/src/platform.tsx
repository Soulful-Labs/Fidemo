import { screenerOutline, tasksOutline } from '@shared/questions'
import { studyDetails } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { clientById, daysRemaining, durationLabel, profileCard, shareLink, studiesOf, studyById } from '@shared/derive'
import { dayMonthYear, longDateTime, money, monthDay, slotDay } from '@shared/format'
import { platform } from '@shared/store'
import type { Actor } from '@shared/store'
import type { Client, Participation, PlatformState, RepeatRule, Report, Result, Study, StudyState } from '@shared/types'
import { useSession } from './mock/session'

/**
 * The client app's window onto the shared platform (../../shared).
 *
 * There is no data in this app. Every study, person, payment and ticket is
 * read from the one store all three apps share, every figure is computed by
 * shared/derive.ts, and every change goes through shared/store.ts, which
 * refuses an illegal move with a reason.
 */

/** The whole platform, re-rendering whenever anything in it changes, in this tab or another. */
export function usePlatform(): PlatformState {
  const p = platform()
  return useSyncExternalStore(p.subscribe, p.getState)
}

/** Runs the platform's simulated server steps while the app is open (shared/platform.ts, TIMINGS). */
export function PlatformClock() {
  useEffect(() => {
    const t = setInterval(() => platform().tick(), 1000)
    return () => clearInterval(t)
  }, [])
  return null
}

/** How the Manage and Review screens read a study's setup back. */
export interface StudyReview {
  studyTime: string
  estimatedAudience: string
  audience: { label?: string; value: string; icon?: string }[]
  screener: { label: string; value: string }
  studyRow: { label: string; value: string }
  incentive: { label: string; value: string }
}

/** A study with the strings the client frames write it in. Nothing here is stored. */
export interface ClientStudy extends Study {
  /** The Studies table, the header and the breadcrumb all write the study's one title. */
  name: string
  breadcrumb: string
  duration: string
  created: string
  /** The run of the study: "Jan 25 – Feb 24". */
  dates?: string
  activeSince?: string
  shareLink?: string
  daysRemaining: number
  review?: StudyReview
  /** The screener in the order it is asked, each question named as the client built it (shared/questions.ts). */
  screenerOutline: ReturnType<typeof screenerOutline>
  /** A survey's or diary's own questions, named as the client built them. */
  tasksOutline: ReturnType<typeof tasksOutline>
  /** Step 4 as the client entered it, line by line. Empty for a study that was not built in the Create flow. */
  details: { label: string; value: string }[]
}

export function clientStudy(study: Study, now: Date = new Date()): ClientStudy {
  const outline = screenerOutline(study)
  return {
    ...study,
    name: study.title, breadcrumb: study.title, duration: durationLabel(study.durationMins),
    created: dayMonthYear(study.createdAt), dates: study.approvedAt ? `${monthDay(study.approvedAt)} – ${monthDay(study.endsAt)}` : undefined, activeSince: study.approvedAt ? longDateTime(study.approvedAt) : undefined,
    shareLink: study.approvedAt ? shareLink(study) : undefined, daysRemaining: daysRemaining(study, now),
    /**
     * A study the Create flow made carries no saved summary of its setup, and
     * Manage Study drew nothing at all for it. What can be read off the study
     * itself is, so a new study opens like any other.
     */
    review: {
      studyTime: durationLabel(study.durationMins), estimatedAudience: study.setup?.estimatedAudience ?? '—',
      audience: study.setup?.audience ?? [{ value: String(study.required), icon: 'people' }],
      screener: { label: 'Screening', value: study.setup?.screenerSummary ?? `${outline.length} input${outline.length === 1 ? '' : 's'}` },
      studyRow: study.setup?.studySummary ?? { label: 'Study Time', value: durationLabel(study.durationMins) },
      incentive: { label: 'Incentive', value: money(study.rates.incentivePer) },
    },
    screenerOutline: outline, tasksOutline: tasksOutline(study), details: study.form ? studyDetails(study.form) : [],
  }
}

/** A booked session as the Recruited table writes it: "12 Aug, Wed" and "10:00 AM". */
export const slotOf = (p: Participation): { day: string; time: string; sessionId?: string } | undefined =>
  p.booking ? { day: slotDay(p.booking.date), time: p.booking.slot, sessionId: p.booking.sessionId } : undefined

const TONES = ['bg-brand-secondary text-brand-secondary', 'bg-blue-600 text-blue-600', 'bg-purple-600 text-purple-600', 'bg-cta-primary text-brand-primary']

/**
 * One participant as the profile panel and the rail write them. Every value
 * is the platform's (shared/derive.ts, profileCard); this only lays it out
 * in the rows the two frames draw.
 */
export function useProfile(personId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const c = personId ? profileCard(state, personId) : undefined
    if (!c) return undefined
    const cert = c.certificateId ? `Cert. ID: ${c.certificateId}` : 'Not yet verified'
    const pct = [['Expertise', c.ratings.expertise], ['Reliability', c.ratings.reliability], ['Communication', c.ratings.communication], ['Success Rate', c.ratings.successRate]] as const
    return {
      ...c, cert,
      experience: `${c.experienceYears} years experience`,
      meta: `${c.location}   •   ${c.experienceYears} years experience   •   ${cert}`,
      trustScore: c.score,
      ratingRows: pct.map(([label, v], i) => ({ label, value: `${v}%`, tone: TONES[i]! })),
      aboutRows: [
        { label: 'Occupation', value: c.about.occupation }, { label: 'Industry', value: c.about.industry },
        { label: 'Education', value: c.about.education || '—' },
        { label: 'Gender & Age', value: `${c.about.gender}${c.about.age ? `   •   ${c.about.age} years` : ''}` },
        { label: 'Experience', value: `${c.experienceYears} years` }, { label: 'Other Interests', value: c.about.interests || '—' },
      ],
      metricRows: [
        { label: 'Completed Studies', value: String(c.completedStudies) },
        { label: 'Earned', value: money(c.earned) },
        { label: 'Highest Streak', value: `${c.streaks} ${c.streaks === 1 ? 'month' : 'months'}` },
      ],
    }
  }, [state, personId])
}

/** The signed-in client's record on the platform. */
export function useClient(): Client | undefined {
  const state = usePlatform()
  const { account } = useSession()
  return account?.clientId ? clientById(state, account.clientId) : undefined
}

export function useActor(): Actor {
  const { account } = useSession()
  return useMemo(() => ({ kind: 'client' as const, id: account?.clientId ?? '' }), [account?.clientId])
}

type Move = 'invited' | 'qualified' | 'disqualified' | 'applied' | 'recruited' | 'completed' | 'no_show'

export function useStudies() {
  const state = usePlatform()
  const { account } = useSession()
  const clientId = account?.clientId ?? ''
  const actor = useActor()
  return useMemo(() => {
    const p = platform()
    const studies = studiesOf(state, clientId).map((s) => clientStudy(s))
    return {
      /** The platform itself, for shared/derive.ts functions that join studies to people. */
      state,
      studies,
      study: (id?: string): ClientStudy | undefined => studies.find((s) => s.id === id),
      moveStudy: (id: string, to: StudyState, reason?: string): Result => p.moveStudy(id, to, actor, reason),
      /** Each move is its own rule in shared/store.ts; this only picks the one the screen means. */
      moveRespondent: (studyId: string, personId: string, to: Move): Result => {
        switch (to) {
          case 'invited': return p.invite(studyId, personId)
          case 'qualified': case 'disqualified': case 'applied': return p.decide(studyId, personId, to, actor)
          case 'recruited': return p.recruit(studyId, personId)
          case 'completed': return p.complete(studyId, personId, actor)
          case 'no_show': {
            // Someone marked completed, not yet paid, is marked back first, as the console does; a paid one is refused by the store.
            const part = p.getState().studies.find((s) => s.id === studyId)?.participations.find((x) => x.personId === personId)
            if (part?.state === 'completed' && !part.paidAt) { const back = p.uncomplete(studyId, personId, actor); if (!back.ok) return back }
            return p.markNoShow(studyId, personId, actor)
          }
        }
      },
      /** Policy section 6: three dimensions at five stars each, plus an optional written review. */
      rate: (studyId: string, personId: string, dims: { expertise: number; reliability: number; communication: number }, comment?: string): Result =>
        p.rateParticipant(studyId, personId, 'dimensions', { ...dims, ...(comment?.trim() ? { comment: comment.trim() } : {}) }, actor),
      enterCode: (studyId: string, personId: string, code: string): Result => p.enterClientCode(studyId, personId, code),
      /** Report Participant (19 Oct 2026): opens a case in the console's Reported queue. */
      reportParticipant: (personId: string, reason: Report['reason'], detail: string, studyId?: string): Result => p.reportParticipant(clientId, personId, reason, detail, studyId),
      /** Policy section 5: the client cancels a booked session. It costs the participant nothing, and they are told. */
      cancelSession: (studyId: string, personId: string, reason = ''): Result => p.cancelSessionFor(studyId, personId, actor, reason),
      setRepeatRule: (studyId: string, rule: RepeatRule): Result => p.setRepeatRule(studyId, rule),
      payBalance: (studyId: string): Result => p.payBalance(studyId),
      recruitMore: (studyId: string): Result => p.recruitMore(studyId, actor),
      duplicateStudy: (studyId: string) => p.duplicateStudy(studyId),
      /** Workflow 5 and 7: the client submits a study; the team takes it live from the console. */
      submitStudy: (form: StudyForm, draftId?: string) => p.submitStudy(clientId, form, draftId),
      /** Save Draft & Exit: the form as it stands, kept whole on a draft. */
      saveStudyDraft: (form: StudyForm, draftId?: string) => p.saveStudyDraft(clientId, form, draftId),
    }
  }, [state, clientId, actor])
}

/**
 * The study a Manage route is on. A new account has none, so a Manage route
 * opened without one gets an empty study rather than a crash; the screens
 * then draw their own empty states.
 */
export function useStudy(id?: string): ClientStudy {
  const { study, studies } = useStudies()
  return study(id) ?? studies.find((s) => s.state !== 'draft') ?? studies[0] ?? EMPTY_STUDY
}

/** A study anywhere on the platform, for links that name one by id. */
export const anyStudy = (state: PlatformState, id?: string): Study | undefined => studyById(state, id)

const EMPTY_STUDY: ClientStudy = clientStudy({
  id: 'none', clientId: '', title: 'No study', description: '', type: 'survey', state: 'draft', industry: '', durationMins: 0,
  createdAt: new Date(0).toISOString(), endsAt: new Date(0).toISOString(), required: 0, repeatRule: 'allow',
  rates: { platformFee: 0, recruitingPer: 0, incentivePer: 0, moderationPer: 0 }, targetProfession: '', linkCode: '',
  preScreener: [], screener: [], participations: [], payments: [], revisions: [],
})
