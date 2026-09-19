import { applyTrustDelta, tierFor, POINTS, TRUST } from '../../lib/rules'
import type { Action, AppState } from '../storeTypes'
import type { Study } from '../types'

/** Replaces one study, leaving the rest untouched. */
function patchStudy(state: AppState, id: string, patch: Partial<Study>): AppState {
  return { ...state, studies: state.studies.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
}

/** Study state machine plus the payout that completion triggers. */
export function studyReducer(state: AppState, action: Action): AppState | null {
  switch (action.type) {
    case 'SET_STATUS': {
      const study = state.studies.find((s) => s.id === action.id)
      if (!study) return state
      const timeline = action.timelineLabel
        ? [...study.timeline, { label: action.timelineLabel, at: new Date().toISOString() }]
        : study.timeline
      return patchStudy(state, action.id, { status: action.status, timeline })
    }

    case 'TOGGLE_SAVED': {
      const study = state.studies.find((s) => s.id === action.id)
      return study ? patchStudy(state, action.id, { saved: !study.saved }) : state
    }

    case 'SAVE_ANSWERS':
      return { ...state, answers: { ...state.answers, [action.id]: action.answers } }

    case 'SET_BOOKING':
      return patchStudy(state, action.id, { booking: action.booking })

    case 'CONFIRM_PIN':
      return patchStudy(state, action.id, { pinConfirmed: true })

    case 'COMPLETE_DIARY_DAY': {
      const study = state.studies.find((s) => s.id === action.id)
      if (!study?.diary) return state
      const days = study.diary.completedDays.includes(action.day)
        ? study.diary.completedDays
        : [...study.diary.completedDays, action.day].sort((a, b) => a - b)
      return patchStudy(state, action.id, { diary: { ...study.diary, completedDays: days } })
    }

    case 'RATE_CLIENT':
      return patchStudy(state, action.id, { userReview: action.review, ratedByUser: true })

    /** Completion payout: reward to the wallet, 25 points, +1 Trust Score. */
    case 'PAY_STUDY': {
      const study = state.studies.find((s) => s.id === action.id)
      if (!study) return state
      const trustScore = applyTrustDelta(state.user.trustScore, TRUST.STUDY_COMPLETION)
      const now = new Date().toISOString()
      return {
        ...patchStudy(state, action.id, {
          status: 'paid',
          timeline: [...study.timeline, { label: 'Paid', at: now }],
        }),
        user: {
          ...state.user,
          trustScore,
          tier: tierFor(trustScore),
          walletBalance: state.user.walletBalance + study.reward,
          points: state.user.points + POINTS.STUDY_COMPLETION,
          allTimeEarned: state.user.allTimeEarned + study.reward,
          completedStudies: state.user.completedStudies + 1,
        },
        transactions: [
          { id: `tx-${Date.now()}`, studyId: study.id, title: study.title, at: now,
            amount: study.reward, txNumber: `#${Math.floor(100000 + Math.random() * 899999)}`,
            category: study.type === 'survey' ? 'Survey' : 'Interview' },
          ...state.transactions,
        ],
        pointsHistory: [
          { id: `pt-${Date.now()}`, kind: 'study', label: 'Study', detail: study.title,
            at: now, amount: POINTS.STUDY_COMPLETION },
          ...state.pointsHistory,
        ],
      }
    }

    /** Cancelling a booked session is a late cancellation: -2 Trust Score. */
    case 'CANCEL_STUDY': {
      const trustScore = applyTrustDelta(state.user.trustScore, TRUST.LATE_CANCELLATION)
      return {
        ...patchStudy(state, action.id, {
          status: 'available', booking: undefined, pinConfirmed: false,
        }),
        user: { ...state.user, trustScore, tier: tierFor(trustScore) },
      }
    }

    default:
      return null
  }
}
