

/**
 * Workflow 12: a sign-up link carries a code the app records as the new
 * person's source. Profile completion, age and the certificate id are the
 * platform's (shared/derive.ts).
 */
export { referralCode } from '@shared/derive'
import { referralCode } from '@shared/derive'
export const referralLink = (name: string, email: string) => `https://humanlayer.app/signup?ref=${referralCode(name, email)}`
