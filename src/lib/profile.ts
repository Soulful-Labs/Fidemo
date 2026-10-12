import { accountCode } from '@shared/derive'

/**
 * Workflow 12: a sign-up link carries a code the app records as the new
 * person's source. Profile completion, age and the certificate id are the
 * platform's (shared/derive.ts).
 */
export const referralCode = (name: string, email: string) => `${(name.split(' ')[0] || 'friend').toUpperCase()}${accountCode(email, 3)}`
export const referralLink = (name: string, email: string) => `https://humanlayer.app/signup?ref=${referralCode(name, email)}`
