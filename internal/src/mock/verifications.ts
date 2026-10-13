import { useMemo } from 'react'
import {
  clientById, personById, reportsDecided, reportsPending, restrictionCount, shortName, teamById, trustScoreOf, verificationsDecided, verificationsPending,
} from '@shared/derive'
import { count, monthDayYear } from '@shared/format'
import type { PlatformState, Report } from '@shared/types'
import { usePlatform } from '../platform'
import { photoFor, tierName } from './participants'

/**
 * Participant verifications (section 2022:168588), read from the shared
 * platform: identity and profession checks the automatic one could not
 * settle, and reports against participants, each pending or decided. The
 * decision is the platform's (shared/store.ts decideCheck, decideReport) and
 * records who took it.
 */
export interface Pending { id: string; photo: string; name: string; role: string; date: string; by?: string; flag: string; reason: string; result?: string }

const reporter = (state: PlatformState, r: Report) => (r.reportedBy === 'system' ? 'System (Algo)' : clientById(state, r.reportedBy)?.name ?? '')
const RESULT: Record<NonNullable<Report['outcome']>, string> = { rejected: 'Rejected', restricted: 'Restricted', deactivated: 'Deactivated' }

export function useVerificationLists() {
  const state = usePlatform()
  return useMemo(() => {
    const ONBOARDING: Pending[] = verificationsPending(state).map((c) => ({
      id: c.id, photo: photoFor(c.person), name: c.person.name, role: c.person.profile.occupation, date: monthDayYear(c.check.flaggedAt),
      flag: c.kind === 'identity' ? 'Identity Verification' : 'Profession Credential', reason: c.check.reason ?? '',
    }))
    const ONBOARDING_HISTORY: Pending[] = verificationsDecided(state).map((c) => ({
      id: c.id, photo: photoFor(c.person), name: c.person.name, role: c.person.profile.occupation, date: monthDayYear(c.check.decidedAt),
      flag: c.kind === 'identity' ? 'Identity Verification' : 'Profession Credential', reason: c.check.note ?? '', result: c.check.state === 'verified' ? 'Verified' : 'Rejected',
    }))
    const row = (r: Report, decided: boolean): Pending => {
      const p = personById(state, r.personId)!
      return {
        id: r.id, photo: photoFor(p), name: p.name, role: p.profile.occupation, date: monthDayYear(decided ? r.decidedAt : r.at), by: reporter(state, r),
        flag: r.reason, reason: decided ? r.note ?? '' : r.detail, result: r.outcome ? RESULT[r.outcome] : undefined,
      }
    }
    const REPORTED = reportsPending(state).map((r) => row(r, false))
    const REPORTED_HISTORY = reportsDecided(state).map((r) => row(r, true))
    return {
      ONBOARDING, ONBOARDING_HISTORY, REPORTED, REPORTED_HISTORY,
      counts: { onboarding: `${count(ONBOARDING.length)} pending verifications`, reported: `${count(REPORTED.length)} pending applications` },
    }
  }, [state])
}

/** One verification case: an identity check (`iv-<person>`), a profession credential (`pc-<person>`) or a report (`rp-<n>`). */
export function useVerificationCase(id: string) {
  const state = usePlatform()
  return useMemo(() => {
    const kind = id.startsWith('rp') ? 'report' as const : id.startsWith('pc') ? 'profession' as const : 'identity' as const
    const report = kind === 'report' ? state.reports.find((r) => r.id === id) : undefined
    const personId = report?.personId ?? id.replace(/^(iv|pc)-/, '')
    const person = personById(state, personId) ?? state.people[1]!
    const check = kind === 'report' ? undefined : person[kind]
    const outcome = report
      ? (report.outcome ?? 'pending')
      : check?.state === 'verified' ? 'verified' : check?.state === 'rejected' ? 'rejected' : 'pending'
    const earlier = report
      ? state.reports.filter((r) => r.personId === person.id && r.id !== report.id && r.outcome && r.outcome !== 'rejected').sort((a, b) => (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''))
      : []
    return {
      kind, report, person, check, outcome: outcome as 'pending' | 'verified' | 'rejected' | 'restricted' | 'deactivated',
      who: {
        name: person.name, first: person.name.split(' ')[0] ?? '', role: person.profile.occupation, place: person.location,
        photo: photoFor(person),
        verified: person.profession.state === 'verified', score: String(trustScoreOf(state, person.id)), tier: tierName(state, person.id),
      },
      reporter: report ? (report.reportedBy === 'system' ? 'System (Algo)' : clientById(state, report.reportedBy)?.name ?? '') : '',
      studyTitle: report?.studyId ? state.studies.find((s) => s.id === report.studyId)?.title : undefined,
      decidedBy: teamById(state, (report?.decidedBy ?? check?.decidedBy))?.name,
      restrictions: restrictionCount(state, person.id),
      earlier,
      short: shortName(person.name),
    }
  }, [state, id])
}

export { monthDayYear }
