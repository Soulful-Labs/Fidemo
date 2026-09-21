import { CERTIFICATE } from './rules'
import type { ProfileDetails, User } from '../mock/types'

/** Fields that count towards "N% completed" on the profile card. */
export const COUNTED: (keyof ProfileDetails | 'name' | 'phone')[] = [
  'name', 'phone', 'gender', 'address', 'areaType', 'aboutMe', 'languages', 'nationality', 'income', 'ethnicity', 'pets',
  'homeOwner', 'occupation', 'experience', 'licenseId', 'industry', 'education', 'topics', 'dob', 'idType', 'introVideo',
]

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()))

/** Derived, never stored: how much of the profile is filled in. */
export function profileCompletion(user: Pick<User, 'name' | 'phone' | 'profile'>): number {
  const done = COUNTED.filter((k) =>
    k === 'name' ? filled(user.name) : k === 'phone' ? filled(user.phone) : filled(user.profile[k]),
  ).length
  return Math.round((done / COUNTED.length) * 100)
}

/** Age in whole years from a "DD / MM / YYYY" date of birth, or undefined. */
export function ageFrom(dob: string, now: Date = new Date()): number | undefined {
  const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(dob.trim())
  if (!m) return undefined
  const [, dd, mm, yyyy] = m.map(Number)
  let age = now.getFullYear() - yyyy
  if (now.getMonth() + 1 < mm || (now.getMonth() + 1 === mm && now.getDate() < dd)) age -= 1
  return age
}

/** A short stable code from the account, e.g. certificate id and referral link. */
export function accountCode(email: string, length = 4): string {
  let h = 0
  for (const ch of email.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i++) { out += alphabet[h % alphabet.length]; h = Math.floor(h / alphabet.length) + 7 }
  return out
}

/** Policy section 2: the certificate ID reads FI-XXXX-XXXX and carries nothing personal, so it is a hash of the account, never the name or email itself. */
export const certificateId = (email: string) => `${CERTIFICATE.ID_PREFIX}-${accountCode(email, 4)}-${accountCode(email + '#', 4)}`

/**
 * Policy: "Valid twelve months and renews on its own." The current period
 * runs from the latest anniversary of verification (the account's join
 * date stands in for it) to twelve months later.
 */
export function certificateValidity(joinedAt: string, now: Date = new Date()): { from: Date; to: Date } {
  const joined = new Date(joinedAt)
  const from = new Date(joined)
  from.setFullYear(now.getFullYear())
  if (from > now) from.setFullYear(now.getFullYear() - 1)
  const to = new Date(from)
  to.setMonth(to.getMonth() + CERTIFICATE.VALID_MONTHS)
  return { from, to }
}
/** Workflow 12: a sign-up link carries a code the app records as the new person's source. */
export const referralCode = (name: string, email: string) => `${(name.split(' ')[0] || 'friend').toUpperCase()}${accountCode(email, 3)}`
export const referralLink = (name: string, email: string) => `https://humanlayer.app/signup?ref=${referralCode(name, email)}`
