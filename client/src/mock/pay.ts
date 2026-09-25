/** A line of the billing card (1627:96779). `sub` is the working under it. */
export interface BillingRow {
  label: string
  amount: string
  sub?: string
  info?: boolean
}

export const BILLING: BillingRow[] = [
  { label: 'Platform Fee', amount: '$100' },
  { label: 'Recruiting Fee', amount: '$500', sub: '$20 x 25 participants', info: true },
  { label: 'Incentives', amount: '$2,500', sub: '$100 x 25 participants', info: true },
  { label: 'Moderation Fee', amount: '$250', sub: '$10 x 25 participants', info: true },
]

/** The two rows under the rule, which the frames draw as one block. */
export const BILLING_TOTAL = {
  total: { label: 'Total cost', amount: '$3,350' },
  less: { label: 'Less: Incentive Deposit', amount: '-$3000', sub: '$100 x 30 participants', info: true },
  net: { label: 'Net payable cost', amount: '$350' },
}

export const TRANSACTIONS = [
  { label: 'Incentive Deposit Paid', amount: '$3,000', at: 'Aug 5, 2026, 10:24 AM', sub: '$20 x 30 participants' },
]

/**
 * Pay while ongoing (1627:96779) and Pay, due as completed (1627:97128) are
 * one tab in two states. Only these five things change between the frames.
 */
export const PAY_STATE = {
  ongoing: {
    dueLabel: 'Payment Due',
    due: '$1,000',
    totalCost: '$4,000',
    billingAs: 'As on today, 11 Aug, 2026',
    payable: false,
    net: false,
  },
  due: {
    dueLabel: 'Payment Due by 12 Aug, 2026',
    due: '$350',
    totalCost: '$3,850',
    billingAs: undefined,
    payable: true,
    net: true,
  },
}

/** Bill Payment (1627:96956): the checkout Pay Balance opens. */
export const BILL = {
  crumb: 'Bill Payment',
  status: 'Billing',
  completed: '25', completedOf: '/30',
  qualified: '35', qualifiedOf: '/60',
  progress: '83%',
  markedAt: 'Marked completed on 10 August, 2026, 10:00 PM',
  heading: 'Invoice Breakdown',
  card: {
    title: 'Payment',
    number: '2548 2698 5420 0008',
    expiry: '05 / 2036',
    cvv: '672',
    name: 'Jennifer Lee',
    address: 'Kelly-Bay, NYC',
    zip: '023548',
    cta: 'Pay $350',
  },
  notes: [
    { text: '3% merchant processing fee applies when using a credit card. ', link: 'Learn about payment options' },
    { text: 'You are only charged for participants that complete your research.' },
  ] as { text: string; link?: string }[],
}

/** Download Sessions Results (1627:110569 in-person, 1627:107040 video). */
export const SESSION_FILES = [
  { title: 'Session 1', at: 'Aug 20, Fri, 12:00 PM ET', participants: '4 participants' },
  { title: 'Session 2', at: 'Aug 20, Fri, 12:00 PM ET', participants: '6 participants' },
]
