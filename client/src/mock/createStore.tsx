import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MARKS, blankForm, blankQuestion, formFromStudy } from '@shared/studyForm'
import type { FormOption, FormQuestion, FormType, StudyForm } from '@shared/studyForm'
import type { AuthoredKind } from '@shared/questions'
import type { Study } from '@shared/types'

/**
 * The study being built in the Create flow. The record itself, and every
 * rule about what it becomes, is the platform's (shared/studyForm.ts); this
 * only holds it while the five steps edit it, plus whether a composer is open.
 */
export type CreateType = FormType
export type QuestionKind = AuthoredKind
export type Option = FormOption
export type Question = FormQuestion
export type CreateDraft = StudyForm & {
  /** The survey, diary or availability composer is open beside the settings. Not part of the study. */
  surveyOpen: boolean
}
export { blankQuestion }

interface Ctx {
  draft: CreateDraft
  set: <K extends keyof CreateDraft>(k: K, v: CreateDraft[K]) => void
  /** The saved draft being edited, when the flow was opened from Drafts. */
  draftId?: string
  /** The form alone, as the platform saves it. */
  form: () => StudyForm
  /** Opens a saved draft with everything it holds. */
  open: (study: Study) => void
  /** A new, empty study. */
  reset: () => void
}
const CreateCtx = createContext<Ctx | null>(null)

const fresh = (): CreateDraft => ({ ...blankForm(), surveyOpen: false })

export function CreateProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CreateDraft>(fresh)
  const [draftId, setDraftId] = useState<string | undefined>()
  const open = useCallback((study: Study) => { setDraft({ ...formFromStudy(study), surveyOpen: false }); setDraftId(study.id) }, [])
  const reset = useCallback(() => { setDraft(fresh()); setDraftId(undefined) }, [])
  const value = useMemo<Ctx>(() => ({
    draft, draftId, open, reset,
    set: (k, v) => setDraft((d) => ({ ...d, [k]: v })),
    form: () => { const { surveyOpen: _open, ...form } = draft; return form },
  }), [draft, draftId, open, reset])
  return <CreateCtx.Provider value={value}>{children}</CreateCtx.Provider>
}

export function useDraft() {
  const ctx = useContext(CreateCtx)
  if (!ctx) throw new Error('useDraft outside CreateProvider')
  return ctx
}

export const MARKS_FOR = (kind: QuestionKind) => MARKS[kind] ?? []

/**
 * Step 4 is finished when the type's own setup exists: a survey or diary
 * needs its form, a session study needs its availability. The frames draw
 * both states of every settings card; this is which one is showing.
 */
export function setupDone(draft: StudyForm): boolean {
  if (draft.type === 'survey' || draft.type === 'diary') return draft.tasksSubmitted
  return draft.availabilitySet
}
