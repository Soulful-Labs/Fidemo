import { hasTakenPartWith } from './derive'
import type { Study, User } from '../mock/types'

/** Why a person cannot apply to a study right now, and what to do about it. */
export interface ApplyBlocker {
  kind: 'verify' | 'premium' | 'repeat'
  title: string
  body: string
  action?: { label: string; to: string }
}

/**
 * The gates in front of Apply, in the order the workflow applies them:
 * 15 (profile and ID at the point of applying), 17 (premium studies need a
 * verified credential) and 57 (each study's own rule on repeat participants).
 * Returns null when the person can go straight to the screener.
 */
export function applyBlocker(study: Study, user: User, studies: Study[]): ApplyBlocker | null {
  if (!user.onboarded || !user.verified.govId) {
    return {
      kind: 'verify',
      title: 'Finish verification to apply',
      body: 'Applying needs a completed profile and a verified government ID. It takes about 2 minutes and is done once, then reused for every study.',
      action: { label: 'Verify now', to: '/onboarding/about' },
    }
  }
  if (study.premium && !user.verified.license) {
    return {
      kind: 'premium',
      title: 'Premium study, locked',
      body: 'Premium studies are the highest paid on the platform and need a verified professional credential, such as a medical or nursing licence, checked against the public register.',
      action: { label: 'Add a credential', to: '/profile/edit?tab=professional' },
    }
  }
  if (study.repeatRule === 'exclude_previous' && hasTakenPartWith(studies, study.client.id, study.id)) {
    return {
      kind: 'repeat',
      title: 'Fresh participants only',
      body: `${study.client.name} has set this study to exclude anyone who has taken part in one of their studies before, and you have. Other studies from this client may still be open to you.`,
    }
  }
  return null
}

/** Copy for the repeat rule row on Study Details (workflow 57). */
export const REPEAT_RULE_COPY: Record<Study['repeatRule'], { label: string; note: string }> = {
  allow: { label: 'Repeat participants welcome', note: 'You can take part even if you have done a study for this client before.' },
  prefer_fresh: { label: 'Fresh participants preferred', note: 'People who have not worked with this client are ranked first, but you can still apply.' },
  exclude_previous: { label: 'First-time participants only', note: 'Anyone who has taken part in a study for this client before is excluded.' },
}
