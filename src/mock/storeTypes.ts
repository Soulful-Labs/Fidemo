import type { UploadedFile } from '@shared/types'
import type { StudyType } from './types'

export type { Study, AppNotification } from './types'

export interface Toast {
  id: string
  message: string
}

/** Sort options from PRD 6.2. */
export type SortKey = 'default' | 'price_high' | 'price_low' | 'new_first' | 'old_first'

/** Explore search, sort and the Filters sheet (PRD 6.2, 6.3). */
export interface StudyFilters {
  query: string
  sort: SortKey
  types: StudyType[]
  price: [number, number]
  time: [number, number]
  industries: string[]
  occupations: string[]
}

export const PRICE_RANGE: [number, number] = [0, 1000]
export const TIME_RANGE: [number, number] = [0, 180]

export const DEFAULT_FILTERS: StudyFilters = {
  query: '', sort: 'default', types: [],
  price: PRICE_RANGE, time: TIME_RANGE, industries: [], occupations: [],
}

/** What the three onboarding steps collect before an account exists. */
export interface OnboardingDraft {
  /** The address typed on Sign Up / Reset Password, echoed on OTP and Check Email. */
  email: string
  /**
   * The password typed on Sign Up, held until the code is entered and the
   * account is made, then cleared. Front-end stand-in: with real
   * authentication the account is created on Sign Up and this goes.
   */
  password?: string
  fullName: string
  dob: string
  gender: string
  address: string
  introVideo?: string
  occupation: string
  licenseId: string
  industry: string
  education: string
  idType: string
  /** The two sides of the ID as chosen: name and size (the file itself is the server's to receive). */
  idFront?: UploadedFile
  idBack?: UploadedFile
}

/** One answer per screener/survey/diary question. */
export type Answers = Record<string, string | string[]>
