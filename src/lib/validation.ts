/** Form validation. Password rule labels are the exact copy from PRD 4.11. */

export interface Rule {
  label: string
  ok: boolean
}

export function passwordRules(password: string): Rule[] {
  return [
    { label: '1 capital letter', ok: /[A-Z]/.test(password) },
    { label: '1 number', ok: /\d/.test(password) },
    { label: '1 special character', ok: /[^A-Za-z0-9]/.test(password) },
    { label: 'at least 8 character', ok: password.length >= 8 },
  ]
}

export function isValidPassword(password: string): boolean {
  return passwordRules(password).every((rule) => rule.ok)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** DD / MM / YYYY, and the 18+ check the date of birth drives (PRD 4.5). */
export function isValidDob(value: string): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(value.trim())
  if (!match) return false
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return (
    date.getDate() === Number(dd) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getFullYear() === Number(yyyy)
  )
}

export function isAdult(value: string, now: Date = new Date()): boolean {
  if (!isValidDob(value)) return false
  const [dd, mm, yyyy] = value.split('/').map((p) => Number(p.trim()))
  const eighteenth = new Date(yyyy + 18, mm - 1, dd)
  return eighteenth <= now
}
