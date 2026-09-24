import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type CreateType = 'survey' | 'video_call' | 'in_person' | 'diary'

export interface CreateDraft {
  type: CreateType
  groupVideo: boolean
  groupInPerson: boolean
  duration: number
  endDate: string
  title: string
  description: string
  thumbnail: string
  participants: string
  countries: string[]
  gender: string
  education: string
  ageRanges: string[]
  roles: string
  functions: string
  skills: string
  industries: string
  condition: string
  tiers: string
  questions: Question[]
}

export type QuestionKind =
  | 'Single-select' | 'Multi-select' | 'Single-line input' | 'Number input'
  | 'Multi-line input' | 'Slider' | 'Ranking' | 'File Upload' | 'Mattrix'

export interface Option { id: string; text: string; mark: string }
export interface Question {
  id: string
  label: string
  kind: QuestionKind
  text: string
  options: Option[]
  min?: string; max?: string; gap?: string; showGap?: boolean
  formats?: string; maxFiles?: string
  matrixKind?: string
  columns?: string[]
  rows?: string[]
}

const MARKS: Partial<Record<QuestionKind, string[]>> = {
  'Single-select': ['Correct', 'Incorrect'],
  'Multi-select': ['May Select', 'Must Select', 'Incorrect'],
}

let seq = 100
const uid = () => `x${seq++}`

/** A fresh question of a kind, with the options the frame starts one with. */
export function blankQuestion(label: string, kind: QuestionKind = 'Single-select'): Question {
  const marks = MARKS[kind] ?? []
  return {
    id: uid(), label, kind, text: '',
    options: marks.map((m) => ({ id: uid(), text: '', mark: m })),
    min: '', max: '', gap: '', showGap: true,
    formats: '', maxFiles: '1', matrixKind: 'Single-select/row',
    columns: [''], rows: ['A', ''],
  }
}

/** The nine questions the Screener frame draws, one per answer type. */
const SEED_QUESTIONS: Question[] = [
  blankQuestion('Pre-screener - Q1', 'Single-select'),
  blankQuestion('Pre-screener - Q2', 'Multi-select'),
  blankQuestion('Pre-screener - Q3', 'Single-line input'),
  blankQuestion('Q4', 'Number input'),
  blankQuestion('Q5', 'Multi-line input'),
  blankQuestion('Q6', 'Slider'),
  { ...blankQuestion('Q7', 'Ranking'), options: [{ id: uid(), text: '', mark: '' }, { id: uid(), text: '', mark: '' }] },
  blankQuestion('Q8', 'File Upload'),
  blankQuestion('Q9', 'Mattrix'),
]

/** Seeded from the three Create frames: what they draw filled, they hold. */
const INITIAL: CreateDraft = {
  type: 'in_person', groupVideo: false, groupInPerson: false,
  duration: 40, endDate: '', title: '', description: '', thumbnail: '',
  participants: '10',
  countries: ['United States of America', 'United Kingdom'],
  gender: 'All Genders', education: "Graduate or Bachelor's",
  ageRanges: ['18–20', '21–29'],
  roles: '', functions: '', skills: '', industries: '',
  condition: 'na', tiers: '',
  questions: SEED_QUESTIONS,
}

interface Ctx { draft: CreateDraft; set: <K extends keyof CreateDraft>(k: K, v: CreateDraft[K]) => void }
const CreateCtx = createContext<Ctx | null>(null)

/** Holds what is typed while the flow moves between steps. No rules yet. */
export function CreateProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CreateDraft>(INITIAL)
  const value = useMemo<Ctx>(() => ({
    draft,
    set: (k, v) => setDraft((d) => ({ ...d, [k]: v })),
  }), [draft])
  return <CreateCtx.Provider value={value}>{children}</CreateCtx.Provider>
}

export function useDraft() {
  const ctx = useContext(CreateCtx)
  if (!ctx) throw new Error('useDraft outside CreateProvider')
  return ctx
}

export const MARKS_FOR = (kind: QuestionKind) => MARKS[kind] ?? []
