import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MARKS, blankForm, blankQuestion, educationOf, formFromStudy, gendersOf } from '@shared/studyForm'
import type { FormOption, FormQuestion, FormType, StudyForm } from '@shared/studyForm'
import type { AuthoredKind } from '@shared/questions'
import type { Study } from '@shared/types'
import { useSession } from './session'

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
  /** What the client typed into Generate with AI, shared by the steps that generate from it. Not part of the study. */
  aiPrompt?: string
  /** The furthest step this study has been opened on (22 Oct 2026): every step up to it can be clicked in the stepper. Not part of the study. */
  reached?: number
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
  /** Something has been typed, chosen or opened that a new study would replace. */
  inProgress: () => boolean
}
const CreateCtx = createContext<Ctx | null>(null)

const fresh = (): CreateDraft => ({ ...blankForm(), surveyOpen: false, aiPrompt: '', reached: 0 })

/**
 * Work in progress is kept in this browser as it is typed, per client account,
 * so a reload or a closed tab loses nothing: that is what the composers'
 * "Auto-saved" says. It is this device's copy only. A study reaches the
 * platform, and other devices, through Save Draft & Exit or Publish.
 */
const KEY = 'fi-client-create'
interface Kept { owner: string; draft: CreateDraft; draftId?: string }
function kept(owner: string): Kept | undefined {
  try {
    const k = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Kept | null
    // A draft kept before education took several levels holds one string; it is read as a list.
    return k && k.owner === owner && k.draft && Array.isArray(k.draft.questions) ? { ...k, draft: { ...k.draft, education: educationOf(k.draft), gender: gendersOf(k.draft).length ? gendersOf(k.draft) : ['All Genders'] } } : undefined
  } catch { return undefined }
}

export function CreateProvider({ children }: { children: ReactNode }) {
  const owner = useSession().account?.clientId ?? ''
  const [draft, setDraft] = useState<CreateDraft>(() => (owner && kept(owner)?.draft) || fresh())
  const [draftId, setDraftId] = useState<string | undefined>(() => (owner ? kept(owner)?.draftId : undefined))
  /** Another account signing in on this browser starts from its own work, not the last person's. */
  const [loadedFor, setLoadedFor] = useState(owner)
  useEffect(() => {
    if (owner === loadedFor) return
    const mine = owner ? kept(owner) : undefined
    setDraft(mine?.draft ?? fresh()); setDraftId(mine?.draftId); setLoadedFor(owner)
  }, [owner, loadedFor])
  useEffect(() => {
    if (!owner || owner !== loadedFor) return
    try { localStorage.setItem(KEY, JSON.stringify({ owner, draft, draftId } satisfies Kept)) } catch { /* storage full or blocked: the work stays in memory */ }
  }, [owner, loadedFor, draft, draftId])
  const open = useCallback((study: Study) => { setDraft({ ...formFromStudy(study), surveyOpen: false, reached: 99 }); setDraftId(study.id) }, [])
  const reset = useCallback(() => { setDraft(fresh()); setDraftId(undefined) }, [])
  const value = useMemo<Ctx>(() => ({
    draft, draftId, open, reset,
    inProgress: () => Boolean(draftId) || Boolean(draft.title.trim() || draft.description.trim() || draft.thumbnail || draft.tasks.length || draft.addresses.length || draft.sessions.length
      || draft.availabilitySet || draft.questions.some((q) => q.text.trim())),
    set: (k, v) => setDraft((d) => ({ ...d, [k]: v })),
    form: () => { const { surveyOpen: _open, aiPrompt: _prompt, reached: _reached, ...form } = draft; return { ...form, education: educationOf(form), gender: gendersOf(form).length ? gendersOf(form) : ['All Genders'] } },
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
