import { RATING_DELTA, POINTS, TRUST } from '../../lib/rules'
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

    /**
     * Workflow 46: the client approves the payout list, then the reward lands.
     * The wallet, points and Trust Score are derived from the lists this
     * appends to (lib/derive.ts), so nothing on the user is touched here.
     */
    case 'PAY_STUDY': {
      const study = state.studies.find((s) => s.id === action.id)
      if (!study) return state
      const now = new Date().toISOString()
      return {
        ...patchStudy(state, action.id, {
          status: 'paid',
          timeline: [...study.timeline, { label: 'Client approved payout', at: now }, { label: 'Paid', at: now }],
          // Workflow 46: the client rates the participant when approving the payout.
          clientReview: study.clientReview ?? {
            stars: 5, comment: 'Thoughtful, well prepared and on time. Would happily include again.',
            expertise: 5, reliability: 5, communication: 4, trustDelta: RATING_DELTA[5],
          },
        }),
        transactions: [
          { id: `tx-${Date.now()}`, studyId: study.id, approved: true, title: study.title, at: now,
            amount: study.reward, txNumber: `#${Math.floor(100000 + Math.random() * 899999)}`,
            category: study.type === 'survey' || study.type === 'diary' ? 'Survey' : study.type === 'in_person' ? 'In-Person' : study.type === 'video_call' ? 'Interview' : 'Focus Group' },
          ...state.transactions,
        ],
        pointsHistory: [
          { id: `pt-${Date.now()}`, kind: 'study', label: 'Study', detail: study.title,
            at: now, amount: POINTS.STUDY_COMPLETION },
          ...state.pointsHistory,
        ],
      }
    }

    /** Policy deduction: a cancelled session is -2 Trust Score, remembered as an event tied to the study. */
    case 'CANCEL_STUDY': {
      const study = state.studies.find((s) => s.id === action.id)
      return {
        ...patchStudy(state, action.id, {
          status: 'available', booking: undefined, pinConfirmed: false,
          timeline: [...(study?.timeline ?? []), { label: 'Cancelled', at: new Date().toISOString() }],
        }),
        trustEvents: [...state.trustEvents, { label: 'Cancelled session', detail: study?.title ?? 'study', studyId: action.id, delta: TRUST.CANCELLED_SESSION, at: new Date().toISOString() }],
      }
    }

    default:
      return null
  }
}
