import { useNavigate } from 'react-router-dom'
import { useStore } from '../../mock/store'
import { useUI } from '../../app/ui'
import { openSession } from './detail/useDetailActions'
import { applyBlocker } from '../../lib/eligibility'
import { completeBlocker } from '../../lib/session'
import type { Study } from '../../mock/types'

/**
 * The card actions every study list shares, so Explore, Saved and My Studies
 * behave identically. Primary action is derived from status (see studyState).
 */
export function useCardHandlers() {
  const navigate = useNavigate()
  const { toggleSaved, toast, studyById, user, studies, completeStudy } = useStore()
  const { openMatchScore, openGate } = useUI()

  const primary = (study: Study) => () => {
    switch (study.status) {
      case 'available':
      case 'invited_to_apply': {
        const blocker = applyBlocker(study, user, studies)
        if (blocker) openGate(blocker)
        else navigate(`/studies/${study.id}/screener`)
        break
      }
      case 'draft':
        navigate(`/studies/${study.id}/screener`)
        break
      case 'invited_to_schedule':
        navigate(`/studies/${study.id}/schedule`)
        break
      case 'invited_to_complete':
        // Same branches as the detail screen: diary, survey, otherwise a session to book.
        navigate(`/studies/${study.id}/${study.type === 'diary' ? 'diary' : study.type === 'survey' ? 'survey' : 'schedule'}`)
        break
      case 'scheduled':
        navigate(`/studies/${study.id}/pin`)
        break
      case 'pin_confirmed': {
        const blocker = completeBlocker(study)
        if (blocker) toast(blocker)
        else { completeStudy(study.id); toast('Study completed, payment on its way') }
        break
      }
      case 'paid': case 'late_show':
        navigate(`/studies/${study.id}/rate`)
        break
      default:
        navigate(`/studies/${study.id}`)
    }
  }

  return {
    open: (study: Study) => () => navigate(`/studies/${study.id}`),
    save: (study: Study) => () => {
      toggleSaved(study.id)
      toast(studyById(study.id)?.saved ? 'Removed from saved' : 'Saved')
    },
    primary,
    // Join Call / Get Directions on a booked card; View Details otherwise.
    secondary: (study: Study) => () =>
      study.status === 'scheduled' || study.status === 'pin_confirmed'
        ? openSession(study)
        : navigate(`/studies/${study.id}`),
    reject: (study: Study) => () => navigate(`/studies/${study.id}`),
    matchScore: () => openMatchScore,
  }
}
