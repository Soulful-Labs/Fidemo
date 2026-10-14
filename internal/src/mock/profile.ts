import { avatarFor } from '@shared/avatar'
import { withdrawalExpectedBy } from '@shared/platform'
import { sharedVideo } from '@shared/derive'
import { useMemo } from 'react'
import {
  ageFrom, hasCertificate, payoutRows, personById, personFigures, pointsRows, profileCompletion, redeemRows, respondentStudies, walletRows,
} from '@shared/derive'
import type { RespondentStudy } from '@shared/derive'
import { clockTime, dayMonthYear, money, monthDayYear, monthDayYearTime } from '@shared/format'
import type { StudyType } from '../components/app/StudyTypeTag'
import { consoleType, studyPictures, usePlatform } from '../platform'
import { photoFor, tierName } from './participants'

/**
 * One participant as the profile draws them (section 1992:101340), read from
 * the shared platform: who they are, their studies in each state, their
 * wallet, points and referrals. Every figure is shared/derive.ts.
 */
export type StudyStatus = 'In Review' | 'In Process' | 'Paid' | 'Rejected' | 'No Show'
export interface StudyLine { id: string; name: string; thumb: string; type: StudyType; date: string; price: string; match: string; status?: StudyStatus }

const HISTORY_LABEL: Partial<Record<RespondentStudy['status'], StudyStatus>> = {
  in_process: 'In Process', paid: 'Paid', late_show: 'Paid', not_needed: 'Paid', rejected: 'Rejected', no_show: 'No Show',
}
const when = (s: RespondentStudy) => s.booking
  ? `${new Date(s.booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${s.booking.slot} ET`
  : dayMonthYear(s.timeline.at(-1)?.at ?? s.endsAt)

/** The period and sort menus drawn loose on the canvas (2021:164830, 2022:167943, 2022:167950). */
export const PERIODS = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']
export const SORTS = ['Sort: Newest First', 'Old First', 'Low Amount', 'High Amount']

const dash = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : v)?.trim() || 'N/A'

export function useProfile(personId?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const p = (personId && personById(state, personId)) || state.people[1]!
    const f = personFigures(state, p.id)
    const studies = respondentStudies(state, p.id)
    const line = (s: RespondentStudy, status?: StudyStatus): StudyLine => ({
      id: s.id, name: s.title, thumb: studyPictures(s.id, s.image).small, type: consoleType(s.type), date: when(s),
      price: money(s.reward), match: `${s.matchScore}%`, status,
    })
    const by = (...st: RespondentStudy['status'][]) => studies.filter((s) => st.includes(s.status))
    const INVITES = by('invited_to_apply', 'invited_to_schedule', 'invited_to_complete').map((s) => line(s))
    const SCHEDULED = by('scheduled', 'pin_confirmed').map((s) => line(s))
    const DRAFTS = by('draft', 'applying').map((s) => line(s))
    const APPLIED = by('applied').map((s) => line(s, 'In Review'))
    const HISTORY = studies.filter((s) => HISTORY_LABEL[s.status]).map((s) => line(s, HISTORY_LABEL[s.status]))
    const saved = (rows: StudyLine[]) => rows.filter((r) => p.savedStudyIds.includes(r.id))

    const cert = hasCertificate(p) ? `Cert. ID: ${p.certificateId}` : 'Not yet verified'
    const PERSON = {
      id: p.id, name: p.name, role: p.profile.occupation, place: p.location, cert, photo: photoFor(p), video: sharedVideo(p),
      completion: `${profileCompletion(p)}% profile completed`, score: String(f.trustScore), tier: tierName(state, p.id),
      professionVerified: p.profession.state === 'verified', email: p.email,
      lastActive: `Last active on ${monthDayYear(p.lastActiveAt)}`, deactivated: p.status === 'deactivated', statusNote: p.statusNote,
    }
    const age = ageFrom(p.profile.dob)
    const dob = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(p.profile.dob)
    return {
      person: p,
      PERSON,
      PROFESSIONAL: [['Occupation', dash(p.profile.occupation)], ['License/Certificate Number', dash(p.profile.licenseId)], ['Work Functions', dash(p.profile.industry)],
        ['Experience', dash(p.profile.experience)], ['Skills', dash(p.profile.topics.slice(0, 2))], ['Industry', dash(p.profile.industry)], ['Education Level', dash(p.profile.education)]],
      TOPICS: dash(p.profile.topics),
      PERSONAL: [['Gender', dash(p.profile.gender)], ['Area Type', dash(p.profile.areaType)], ['Languages Spoken', dash(p.profile.languages)], ['Nationality', dash(p.profile.nationality)],
        ['Household Income', dash(p.profile.income)], ['Ethnicity', dash(p.profile.ethnicity)], ['Pets', dash(p.profile.pets)], ['Are you a home owner?', dash(p.profile.homeOwner)]],
      ACCOUNT: [['Email', p.email], ['Phone', dash(p.phone)],
        ['Date of Birth', dob ? new Date(Number(dob[3]), Number(dob[2]) - 1, Number(dob[1])).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + (age ? '' : '') : 'N/A']],
      RATINGS: [['Expertise', `${f.ratings.expertise}%`, 'green'], ['Reliability', `${f.ratings.reliability}%`, 'blue'], ['Communication', `${f.ratings.communication}%`, 'purple'], ['Success Rate', `${f.ratings.successRate}%`, 'yellow']] as [string, string, 'green' | 'blue' | 'purple' | 'yellow'][],
      METRICS: [['Completed Studies', String(f.completedStudies + p.prior.completedThisYear)], ['Earned', money(f.allTimeEarned)], ['Highest Streak', `${pointsRows(state, p.id).filter((r) => r.kind === 'streak').length} months`]],
      VERIFIED: [
        ...(p.profession.state === 'verified' ? ['Verified Professional'] : []),
        ...(p.identity.state === 'verified' ? ['Government ID Verified'] : []),
        ...(p.livePhoto ? ['Live Photo Verified'] : []),
        ...(p.profession.state === 'verified' ? ['Register cross checked'] : []),
      ],
      INVITES, SCHEDULED, APPLIED, HISTORY,
      SAVED: { invites: saved(INVITES), scheduled: saved(SCHEDULED), drafts: DRAFTS, applied: saved(APPLIED), history: saved(HISTORY) },
      EARNINGS: walletRows(state, p.id).map((r) => ({ what: r.title, day: monthDayYear(r.at), time: clockTime(r.at), id: r.txNumber, amount: money(r.amount) })),
      PAYOUTS: payoutRows(p).map((r) => ({ key: r.id, day: monthDayYear(r.at), time: clockTime(r.at), to: `To ${p.payoutMethods.find((m) => m.accountNumber.replace(/\s/g, '').endsWith(r.destination.replace(/\D/g, '')))?.bankName ?? 'Bank'}... ${r.destination}`, id: r.txId, amount: money(r.amount), status: r.status === 'processing' ? 'Processing' : 'Completed',
        /** For Payout Details: the payout itself, not the frame's sample. */
        bank: r.destination.slice(-4), when: monthDayYearTime(r.at), fee: money(r.fee), net: money(r.net), expected: r.status === 'processing' ? monthDayYear(r.expectedBy ?? withdrawalExpectedBy(r.at)) : '' })),
      POINTS: pointsRows(state, p.id).map((r) => ({ key: r.id, kind: r.label, what: r.detail, points: `+${r.amount}` })),
      REDEEMS: redeemRows(p).map((r) => ({ key: r.id, what: `${r.points} points redeemed`, points: `-${r.points}` })),
      REFERRALS: p.referrals.map((r) => ({ key: r.id, photo: avatarFor(r.id), name: r.name, email: r.email, joined: monthDayYear(r.at), status: r.status === 'joined' ? 'Joined' : 'Completed' })),
      figures: f,
    }
  }, [state, personId])
}

export type ProfileView = ReturnType<typeof useProfile>
