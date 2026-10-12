/**
 * Pricing & Rewards exactly as drawn (section 2051:177074). These figures are
 * Figma's, including the ones that disagree with the signed Trust and Rewards
 * policy and with each other (CLAUDE.md lists every one). Nothing here is
 * corrected: the view and each edit form carry their own frame's values.
 */
export const TIERS_VIEW = [['Silver Tier', '50'], ['Gold Tier', '70'], ['Platinum Tier', '90']]
/** Edit Tiers (2058:195439) labels the three fields as below. */
export const TIERS_EDIT = [['Withdrawal', '50'], ['Reward Points Value', '70'], ['Platinum Tier', '90']]

export const EARNED = [['Onboarding', '+50'], ['Study Completion', '+10'], ['Participation Ratings', '+40']]
export const EARNED_STARS = [['5-star rating', '+4'], ['4-star rating', '+3'], ['3-star rating', '+1']]
/** The overview (2058:194308) draws No Show -4 and Cancelled Session -4; the edit form (2058:196166) -2 and -2. */
export const DEDUCTED_VIEW = [['2-star rating', '-2'], ['1-star rating', '-3'], ['No Show', '-4'], ['Late Show Up', '-2'], ['Cancelled Session', '-4'], ['Fraud', '-20']]
export const DEDUCTED_EDIT = [['No Show', '-2'], ['Late Show Up', '-2'], ['Cancelled Session', '-2'], ['Fraud', '-20']]

export const POINTS = [
  ['Referral', '200', 'When someone refers users to join'], ['Being Referred', '100', 'Refer someone who joins'], ['Study Completion', '50', 'Per study, upto 10 per year'],
  ['Full Profile Completion', '50', 'One-rime when user completes profile 100%'], ['Streak Completion', '50', 'When user completes 4 studies in one month'],
]

export const TRUST_NOTES = ['Onboarding is fixed at 50 and is the minimum Trust Score.', 'Study completion contributes up to 10 per year (max 10 studies).', 'Ratings are based on your last 10 ratings and can add up to 40.',
  'Adding a professional credential does not change your Trust Score.', 'Your score is always between 50 (minimum) and 100 (maximum).']
export const POINT_NOTES = ['Points are kept separate from your Trust Score.', 'Points have no expiry and can be redeemed anytime.']

/** The add-on parameter menu, drawn loose (2058:193797). */
export const PARAMETERS = ['Survey study', 'Video Call study', 'In-person study', 'Diary study', 'Roles', 'Skills']
