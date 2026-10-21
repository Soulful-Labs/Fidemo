import type { StudyForm } from '@shared/studyForm'

/** Sets one field of the form being edited. The steps live in AboutStep, AudienceStep, ScreenerStep and StudyStep. */
export type SetForm = <K extends keyof StudyForm>(k: K, v: StudyForm[K]) => void
