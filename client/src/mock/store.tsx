import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { RespondentState, StudyState } from '../lib/lifecycle'
import { canMoveRespondent, canMoveStudy } from '../lib/lifecycle'
import type { RatingState } from '../lib/policy'
import type { Study } from './db'
import { ALL_STUDIES } from './db'

/**
 * The one place a state changes. Every screen reads its state from here and
 * moves it from here, so a study cannot be in two states and no screen can
 * put one into a state the machine does not allow.
 *
 * Illegal moves are refused rather than applied, and say so, because a silent
 * no-op is how the stage-one build ended up with screens that disagreed.
 */

export interface Refusal { ok: false; why: string }
export type Result = { ok: true } | Refusal

interface Ctx {
  studies: Study[]
  study: (id?: string) => Study | undefined
  /** Workflow steps 7, 9 and 11: only the team can take a study live. */
  moveStudy: (id: string, to: StudyState) => Result
  moveRespondent: (studyId: string, personId: string, to: RespondentState) => Result
  /** Step 52: the client rates each participant, in the policy's three states. */
  rate: (studyId: string, personId: string, rating: RatingState) => Result
  /** Step 42: the client or moderator enters the session code. No code, no payment. */
  enterCode: (studyId: string, personId: string, code: string) => Result
  /** Step 46: the client confirms the payout list before anything leaves the account. */
  approvePayouts: (studyId: string, personIds: string[]) => Result
  setRepeatRule: (studyId: string, rule: Study['repeatRule']) => Result
}

const StoreCtx = createContext<Ctx | null>(null)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [studies, setStudies] = useState<Study[]>(ALL_STUDIES)

  const patch = useCallback((id: string, fn: (s: Study) => Study) => {
    setStudies((all) => all.map((s) => (s.id === id ? fn(s) : s)))
  }, [])

  const study = useCallback((id?: string) => studies.find((s) => s.id === id), [studies])

  const moveStudy = useCallback<Ctx['moveStudy']>((id, to) => {
    const s = studies.find((x) => x.id === id)
    if (!s) return { ok: false, why: 'No such study' }
    if (!canMoveStudy(s.state, to)) return { ok: false, why: `A ${s.state} study cannot become ${to}` }
    patch(id, (x) => ({ ...x, state: to, approvedAt: to === 'recruiting' ? new Date().toISOString() : x.approvedAt }))
    return { ok: true }
  }, [patch, studies])

  const moveRespondent = useCallback<Ctx['moveRespondent']>((studyId, personId, to) => {
    const s = studies.find((x) => x.id === studyId)
    const pt = s?.participants.find((p) => p.personId === personId)
    if (!s || !pt) return { ok: false, why: 'Not on this study' }
    if (!canMoveRespondent(pt.state, to)) return { ok: false, why: `${pt.state} cannot become ${to}` }
    if (to === 'completed' && !(pt.code?.byClient && pt.code?.byParticipant)) {
      return { ok: false, why: 'No code, no payment. Both sides have to enter the session code.' }
    }
    patch(studyId, (x) => ({
      ...x,
      participants: x.participants.map((p) => (p.personId === personId ? { ...p, state: to } : p)),
    }))
    return { ok: true }
  }, [patch, studies])

  const rate = useCallback<Ctx['rate']>((studyId, personId, rating) => {
    const s = studies.find((x) => x.id === studyId)
    const pt = s?.participants.find((p) => p.personId === personId)
    if (!s || !pt) return { ok: false, why: 'Not on this study' }
    if (pt.state !== 'completed' && pt.state !== 'rated') {
      return { ok: false, why: 'Only someone who completed the study can be rated' }
    }
    patch(studyId, (x) => ({
      ...x,
      participants: x.participants.map((p) => (p.personId === personId ? { ...p, rating, state: 'rated' } : p)),
    }))
    return { ok: true }
  }, [patch, studies])

  const enterCode = useCallback<Ctx['enterCode']>((studyId, personId, code) => {
    const s = studies.find((x) => x.id === studyId)
    const pt = s?.participants.find((p) => p.personId === personId)
    if (!s || !pt) return { ok: false, why: 'Not on this study' }
    if (!pt.code) return { ok: false, why: 'No code has been generated for this session yet' }
    if (pt.code.value !== code) return { ok: false, why: 'That code does not match the one shown at the end of the session' }
    patch(studyId, (x) => ({
      ...x,
      participants: x.participants.map((p) => (p.personId === personId && p.code
        ? { ...p, code: { ...p.code, byClient: true } } : p)),
    }))
    return { ok: true }
  }, [patch, studies])

  const approvePayouts = useCallback<Ctx['approvePayouts']>((studyId, personIds) => {
    const s = studies.find((x) => x.id === studyId)
    if (!s) return { ok: false, why: 'No such study' }
    const blocked = personIds.filter((id) => {
      const p = s.participants.find((x) => x.personId === id)
      return !p?.code?.byClient || !p?.code?.byParticipant
    })
    if (blocked.length > 0) return { ok: false, why: `${blocked.length} without a confirmed session code` }
    patch(studyId, (x) => ({
      ...x,
      participants: x.participants.map((p) => (personIds.includes(p.personId) ? { ...p, payoutApproved: true } : p)),
    }))
    return { ok: true }
  }, [patch, studies])

  const setRepeatRule = useCallback<Ctx['setRepeatRule']>((studyId, rule) => {
    const s = studies.find((x) => x.id === studyId)
    if (!s) return { ok: false, why: 'No such study' }
    patch(studyId, (x) => ({ ...x, repeatRule: rule }))
    return { ok: true }
  }, [patch, studies])

  const value = useMemo<Ctx>(() => ({
    studies, study, moveStudy, moveRespondent, rate, enterCode, approvePayouts, setRepeatRule,
  }), [studies, study, moveStudy, moveRespondent, rate, enterCode, approvePayouts, setRepeatRule])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStudies() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStudies outside StudyProvider')
  return ctx
}

/** The study a Manage route is on, falling back to the one the frames are drawn around. */
export function useStudy(id?: string) {
  const { study } = useStudies()
  return study(id) ?? study('st-pay')!
}
