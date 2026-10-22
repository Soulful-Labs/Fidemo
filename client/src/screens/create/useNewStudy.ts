import { createContext, useContext } from 'react'
import { useToast } from '../../components/ui/Toast'
import { useDraft } from '../../mock/createStore'
import { useStudies } from '../../platform'

/**
 * Starts a new study. Whatever was in progress is not thrown away and not
 * carried into the new one: it is saved to Drafts first, which is where a
 * study is resumed from. (A study already submitted that was open for editing
 * stays as it was submitted.)
 */
export function useStartStudy() {
  const toast = useToast()
  const { form, draftId, reset, inProgress } = useDraft()
  const { saveStudyDraft } = useStudies()
  return () => {
    if (inProgress()) {
      const saved = saveStudyDraft(form(), draftId)
      if (saved.ok) toast('The study you were working on is in Drafts')
    }
    reset()
  }
}

export const NewStudyCtx = createContext<() => void>(() => undefined)

/**
 * Create Study, wherever it is pressed (22 Oct 2026): New Study (19 Oct 2026)
 * opens over the screen it was pressed on. Only Generate and Fill, or Fill from
 * scratch, start the study and move to the About step (app/NewStudyHost.tsx).
 */
export const useNewStudy = () => useContext(NewStudyCtx)
