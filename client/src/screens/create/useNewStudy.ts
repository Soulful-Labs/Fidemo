import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { useDraft } from '../../mock/createStore'
import { useStudies } from '../../platform'

/**
 * Create Study, wherever it is pressed, starts a new study. Whatever was in
 * progress is not thrown away and not carried into the new one: it is saved
 * to Drafts first, which is where a study is resumed from. (A study already
 * submitted that was open for editing stays as it was submitted.)
 */
export function useNewStudy() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, draftId, reset, inProgress } = useDraft()
  const { saveStudyDraft } = useStudies()
  return () => {
    if (inProgress()) {
      const saved = saveStudyDraft(form(), draftId)
      if (saved.ok) toast('The study you were working on is in Drafts')
    }
    reset()
    navigate('/studies/create/about')
  }
}
