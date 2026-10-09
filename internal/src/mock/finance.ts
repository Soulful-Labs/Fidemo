/**
 * Finance as drawn (section 2051:154237): Overview with five transaction tabs
 * (All 2051:154238, Participant Earning 2051:163894, Participant Payouts
 * 2051:165267, Study Payments 2051:165906, Client Refunds 2051:166552),
 * Refunds 2051:167524, refund detail to confirm 2051:169194 and confirmed
 * 2051:170363. Every figure as drawn.
 */
export const TILES = [
  { label: 'Clients Spent', value: '$18,560,637', note: '12.6% vs last year' },
  { label: 'Participants Earned', value: '$8,623,419', note: '34.8% vs last year' },
  { label: 'Gross Revenue', value: '$10,873,400', note: '22.6% vs last year' },
  { label: 'Refunds Pending', value: '$38,956', note: '24 underfilled studies', warn: true },
]

export type TxKind = 'all' | 'earning' | 'payouts' | 'payments' | 'refunds'
export const TX_TABS = [{ key: 'all', label: 'All transactions' }, { key: 'earning', label: 'Participant Earning' }, { key: 'payouts', label: 'Participant Payouts' }, { key: 'payments', label: 'Study Payments' }, { key: 'refunds', label: 'Client Refunds' }]
export interface Tx { id: string; date: string; kind?: string; what: string; type: string; to?: string; from?: string; amount: string }
const S = (kind: string, what: string) => ({ kind, what })
const HL = 'HumanLayer'
const tx = (i: number, date: string, w: { kind?: string; what: string }, type: string, to: string | undefined, from: string | undefined, amount: string): Tx => ({ id: `tx-${i}`, date, ...w, type, to, from, amount })
const W = (what: string) => ({ what })

export const TX: Record<TxKind, Tx[]> = {
  all: [
    tx(1, '30 Jul, 2026', S('Study', 'About goal-tracking methods'), 'Participant Earning', 'Jennifer Winter', HL, '$150'),
    tx(2, '30 Jul, 2026', S('Study', 'Evaluating productivity trends'), 'Participant Earning', 'Jennifer Winter', HL, '$150'),
    tx(3, '15 Aug, 2026', W('Bank Withdrawal To **** 1263'), 'Participant Payout', 'Michael Smith', HL, '$2,000'),
    tx(4, '22 Sep, 2026', S('Survey', 'Assessing user satisfaction with apps'), 'Study Payment', HL, 'Emma Brown', '$4,350'),
    tx(5, '10 Oct, 2026', S('Study Deposit', 'Evaluating productivity trends'), 'Client Refunds', 'Liam Johnson', HL, '$935'),
    tx(6, '30 Jul, 2026', S('Study', 'Assessing user satisfaction with apps'), 'Participant Earning', 'Jennifer Winter', HL, '$150'),
    tx(7, '30 Jul, 2026', S('Study', 'About goal-tracking methods'), 'Participant Earning', 'Jennifer Winter', HL, '$250'),
    tx(8, '15 Aug, 2026', W('Bank Withdrawal To **** 1263'), 'Participant Payout', 'Michael Smith', HL, '$200'),
    tx(9, '22 Sep, 2026', S('Survey', 'Assessing user satisfaction with apps'), 'Study Payment', HL, 'Emma Brown', '$12,350'),
    tx(10, '10 Oct, 2026', S('Study Deposit', 'Evaluating productivity trends'), 'Client Refund', 'Liam Johnson', HL, '$475'),
  ],
  earning: [
    ['About goal-tracking methods', 'Jennifer Winter', '$150'], ['Exploring user engagement metrics', 'Michael Smith', '$200'], ['Investigating app design preferences', 'Sophia Lee', '$175'],
    ['Evaluating productivity trends', 'Jennifer Winter', '$150'], ['Analyzing feature usability', 'Daniel Kim', '$225'], ['Surveying user feedback on functionality', 'Emily Rodriguez', '$180'],
    ['Assessing user satisfaction with apps', 'Jennifer Winter', '$150'], ['Understanding consumer behavior in apps', 'Alex Johnson', '$200'], ['About goal-tracking methods', 'Jennifer Winter', '$250'],
    ['Evaluating interactive design elements', 'Isabella Garcia', '$190'],
  ].map(([w, to, a], i) => tx(i, '30 Jul, 2026', S('Study', w!), 'Participant Earning', to, undefined, a!)),
  payouts: [
    ['30 Jul, 2026', 'Jennifer Winter', '$4,350'], ['30 Jul, 2026', 'Jennifer Winter', '$4,350'], ['15 Aug, 2026', 'Michael Smith', '$2,000'], ['22 Sep, 2026', 'Emma Brown', '$4,350'],
    ['10 Oct, 2026', 'Liam Johnson', '$2,000'], ['30 Jul, 2026', 'Jennifer Winter', '$2,000'], ['30 Jul, 2026', 'Jennifer Winter', '$2,000'], ['15 Aug, 2026', 'Michael Smith', '$4,350'],
    ['22 Sep, 2026', 'Emma Brown', '$4,350'], ['10 Oct, 2026', 'Liam Johnson', '$4,350'],
  ].map(([d, to, a], i) => tx(i, d!, W('Bank Withdrawal To **** 1263'), 'Participant Payouts', to, undefined, a!)),
  payments: [
    ['22 Sep, 2026', 'Study', 'Assessing user satisfaction with apps', 'Emma Brown', '$4,350'], ['22 Sep, 2026', 'Study', 'Assessing user satisfaction with apps', 'Emma Brown', '$12,350'],
    ['30 Jul, 2026', 'Study', 'About goal-tracking methods', 'Jennifer Winter', '$4,350'], ['30 Jul, 2026', 'Study', 'Evaluating productivity trends', 'Michael Smith', '$4,350'],
    ['15 Aug, 2026', 'Study', 'Evaluating productivity trends', 'Liam Johnson', '$12,000'], ['10 Oct, 2026', 'Study Deposit', 'Evaluating productivity trends', 'Jennifer Winter', '$12,350'],
    ['30 Jul, 2026', 'Study', 'Assessing user satisfaction with apps', 'Michael Smith', '$4,350'], ['30 Jul, 2026', 'Study', 'About goal-tracking methods', 'Liam Johnson', '$4,350'],
    ['15 Aug, 2026', 'Study', 'Evaluating productivity trends', 'Jennifer Winter', '$4,350'], ['10 Oct, 2026', 'Study', 'Assessing user satisfaction with apps', 'Liam Johnson', '$4,350'],
  ].map(([d, k, w, f, a], i) => tx(i, d!, S(k!, w!), 'Study Payment', undefined, f, a!)),
  refunds: [
    ['10 Oct, 2026', 'Evaluating productivity trends', 'Client Refunds', 'Liam Johnson', '$2,000'], ['10 Oct, 2026', 'Evaluating productivity trends', 'Client Refund', 'Liam Johnson', '$1,475'],
    ['30 Jul, 2026', 'About goal-tracking methods', 'Client Refunds', 'Jennifer Winter', '$2,000'], ['30 Jul, 2026', 'Evaluating productivity trends', 'Client Refunds', 'Jennifer Winter', '$4,350'],
    ['15 Aug, 2026', 'About goal-tracking methods', 'Client Refunds', 'Michael Smith', '$2,000'], ['22 Sep, 2026', 'Assessing user satisfaction with apps', 'Client Refunds', 'Michael Smith', '$4,350'],
    ['30 Jul, 2026', 'Assessing user satisfaction with apps', 'Client Refunds', 'Jennifer Winter', '$1,500'], ['30 Jul, 2026', 'About goal-tracking methods', 'Client Refunds', 'Jennifer Winter', '$2,550'],
    ['15 Aug, 2026', 'Assessing user satisfaction with apps', 'Client Refunds', 'Michael Smith', '$2,000'], ['22 Sep, 2026', 'Assessing user satisfaction with apps', 'Client Refunds', 'Michael Smith', '$12,350'],
  ].map(([d, w, t, to, a], i) => tx(i, d!, S('Study Deposit', w!), t!, to, undefined, a!)),
}

/** The two loose menus (2065:207945, 2065:208135). */
export const TYPE_OPTIONS = ['All Types', 'Participant Earning', 'Participant Payouts', 'Study Payments', 'Client Refunds']
export const PERIOD_OPTIONS = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months']

export interface Refund { id: string; date: string; type: string; study: string; client: string; target: string; shortfall: string; billed: string; refund: string }
export const REFUNDS: Refund[] = [
  ['30 Jul, 2026', 'Survey', 'Business Finance Operations', 'Jennifer Winter', '150', '20', '$14,400', '$1,600'], ['15 Aug, 2026', 'Video Call', 'Marketing Strategy', 'Michael Smith', '200', '35', '$28,000', '$1,400'],
  ['05 Sep, 2026', 'In-Person', 'Product Development', 'Sarah Lee', '250', '40', '$32,500', '$1,300'], ['20 Sep, 2026', 'Diary', 'Customer Experience', 'David Chen', '180', '25', '$27,000', '$1,500'],
  ['10 Oct, 2026', 'In-Person Group', 'Sales Performance', 'Emily Davis', '130', '15', '$19,500', '$1,300'], ['25 Oct, 2026', 'Survey', 'Market Trends', 'Brian Johnson', '220', '30', '$34,000', '$1,400'],
  ['05 Nov, 2026', 'In-Person Group', 'Sales Strategy', 'Laura Kim', '160', '20', '$24,000', '$1,200'], ['15 Nov, 2026', 'Survey', 'Competitive Analysis', 'James Wilson', '210', '28', '$30,500', '$1,300'],
  ['30 Nov, 2026', 'Video Call Group', 'Brand Awareness', 'Olivia Brown', '190', '26', '$28,800', '$1,200'], ['10 Dec, 2026', 'Video Call Group', 'Social Media Impact', 'Thomas Green', '170', '22', '$26,400', '$1,200'],
].map(([date, type, study, client, target, shortfall, billed, refund], i) => ({ id: `rf-${i + 1}`, date: date!, type: type!, study: study!, client: client!, target: target!, shortfall: shortfall!, billed: billed!, refund: refund! }))
