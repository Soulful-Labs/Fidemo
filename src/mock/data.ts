// Assembles the seed. Everything lives under ./seed; this file builds the two
// starting states the app can boot into: the returning demo account and a
// brand new account created through Sign Up.

import { derive, trustHistory } from '../lib/derive'
import { TIERS } from '../lib/rules'
import { DEFAULT_FILTERS } from './storeTypes'
import type { AppState } from './storeTypes'
import type { User } from './types'
import { buildNotifications } from './seed/notifications'
import { STUDIES } from './seed/studies'
import {
  PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS, USER,
} from './seed/account'
import { profileCompletion } from '../lib/profile'

export { STUDIES } from './seed/studies'
export { FAQS, LEARN_VIDEO_IMAGE, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS, USER } from './seed/account'
export { CLIENTS, clientReviews } from './seed/clients'
export type { ClientReview } from './seed/clients'

const EMPTY_ONBOARDING = {
  email: '', fullName: '', dob: '', gender: '', address: '',
  occupation: '', licenseId: '', industry: '', education: '', idType: '',
}

/** The returning account, Jonathan: full history, every list populated. */
export function returningUserState(): AppState {
  const base: AppState = {
    signedIn: false,
    trustEvents: [],
    user: USER,
    studies: STUDIES,
    notifications: [],
    transactions: TRANSACTIONS,
    payouts: PAYOUTS,
    payoutMethods: PAYOUT_METHODS,
    pointsHistory: POINTS_HISTORY,
    redeemHistory: REDEEM_HISTORY,
    referrals: REFERRALS,
    tickets: TICKETS,
    answers: {},
    onboarding: EMPTY_ONBOARDING,
    filters: DEFAULT_FILTERS,
    toasts: [],
    pending: [],
  }
  const d = derive(base)
  // Walk the score history oldest first to find when the score last rose and when it entered the current tier.
  const history = [...trustHistory(base)].reverse()
  let running = 0
  let tierReachedAt: string | undefined
  for (const e of history) {
    running += e.delta
    if (!tierReachedAt && d.tier !== 'silver' && running >= TIERS[d.tier]) tierReachedAt = e.at
    if (running < TIERS[d.tier]) tierReachedAt = undefined
  }
  const trustRoseAt = [...history].reverse().find((e) => e.delta > 0 && e.label !== 'Onboarding')?.at
  return {
    ...base,
    notifications: buildNotifications({
      payoutMethods: PAYOUT_METHODS,
      studies: STUDIES, payouts: PAYOUTS, pointsHistory: POINTS_HISTORY, referrals: REFERRALS, tickets: TICKETS,
      trustScore: d.trustScore, tier: d.tier, profileCompletion: profileCompletion(USER),
      joinedAt: USER.joinedAt, trustRoseAt, tierReachedAt,
    }),
  }
}


/**
 * A brand new account (workflow 15): can browse and search every open study,
 * has no history, and is not yet verified. Profile and ID are asked for at
 * the point of applying.
 */
export function newUserState(email: string, sourceCode?: string): AppState {
  const user: User = {
    ...USER,
    // No name until the person types one (About You or Account Settings); nothing is invented from the email.
    name: '',
    email,
    phone: '',
    profile: {
      gender: '', address: '', areaType: '', aboutMe: '', languages: [], nationality: '', income: '', ethnicity: '',
      pets: [], homeOwner: '', occupation: '', experience: '', licenseId: '', industry: '', education: '', topics: [],
      dob: '', idType: '',
    },
    onboarded: false,
    taxFormDone: false,
    sourceCode,
    joinedAt: new Date().toISOString(),
    consent: { shareProfession: false, shareProfile: true, essentialCookies: true, performanceCookie: true },
    emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
    verified: { govId: false, livePhoto: false, license: false },
  }
  return {
    signedIn: true,
    trustEvents: [],
    user,
    // Every study is open to browse; nothing has been applied to.
    studies: STUDIES.map((s) => ({ ...s, status: 'available' as const, saved: false, booking: undefined, pinConfirmed: false, timeline: [], clientReview: undefined, userReview: undefined, ratedByUser: false,
        diary: s.diary ? { ...s.diary, completedDays: [] } : undefined })),
    notifications: [{
      id: 'nt-welcome', kind: 'profile', title: 'Welcome to HumanLayer!', read: false, at: new Date().toISOString(),
      body: 'Browse and search studies right away. Finish your profile and verify your ID when you apply to your first one.',
      actionLabel: 'Complete Profile', to: '/onboarding/about',
    }],
    transactions: [],
    payouts: [],
    payoutMethods: [],
    pointsHistory: [],
    redeemHistory: [],
    referrals: [],
    tickets: [],
    answers: {},
    onboarding: { ...EMPTY_ONBOARDING, email },
    filters: DEFAULT_FILTERS,
    toasts: [],
    pending: [],
  }
}
