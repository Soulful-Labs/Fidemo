import { useNavigate } from 'react-router-dom'
import { useStore } from '../../mock/store'
import type { Study } from '../../mock/types'

/**
 * The card actions every study list shares, so Explore, Saved and My Studies
 * behave identically. Primary action is derived from status (see studyState).
 */
export function useCardHandlers() {
  const navigate = useNavigate()
  const { toggleSaved, applyToStudy, toast, studyById } = useStore()

  const primary = (study: Study) => () => {
    switch (study.status) {
      case 'available':
      case 'invited_to_apply':
        applyToStudy(study.id)
        navigate(`/studies/${study.id}/screener`)
        break
      case 'draft':
        navigate(`/studies/${study.id}/screener`)
        break
      case 'invited_to_schedule':
        navigate(`/studies/${study.id}/schedule`)
        break
      case 'invited_to_complete':
        navigate(`/studies/${study.id}`)
        break
      case 'scheduled':
        navigate(`/studies/${study.id}/pin`)
        break
      case 'paid':
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
    secondary: (study: Study) => () => navigate(`/studies/${study.id}`),
    reject: (study: Study) => () => navigate(`/studies/${study.id}`),
    matchScore: () => () =>
      toast('Match score shows how relevant this study is to your profile'),
  }
}
