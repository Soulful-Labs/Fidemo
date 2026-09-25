/** The three figures across the top of Payments (1663:103326). */
export const PAYMENT_STATS = [
  { label: 'Due Payments', value: '$6,874', suffix: 'of 5 studies', tint: true },
  { label: 'All Time Spent', value: '$25,890', suffix: 'for 5 studies' },
  { label: 'Average Study Cost', value: '$3,876', suffix: 'from 15 studies' },
]

/** An invoice row. The same five are drawn under both states of the toggle. */
export const INVOICES = Array.from({ length: 5 }, () => ({
  number: 'INV-1024366',
  study: 'Patient Trust in Telehealth',
  date: 'Aug 10, 2026',
  amount: '$750',
}))

/** Saved Payment Methods, under the invoice table on the same page. */
export const CARDS = [
  { brand: 'Mastercard', last4: '4242', expires: 'Expires 08/28', isDefault: true },
  { brand: 'VISA', last4: '6080', expires: 'Expires 08/28' },
]

/** Invoice Details (1663:103948 paid, 1664:127262 to pay). */
export const INVOICE = {
  title: 'Invoice Details (INV-1024366) - Mobile App Usability Testing',
  number: 'Invoice Number: INV-1024366',
  study: 'How do you make your digital payments mostly?',
  paidStudy: 'Mobile App Usability Testing',
  issued: 'Marked completed and invoice issued on 10 August, 2026, 10:00 PM',
  amount: '$350',
  due: 'Due on Aug 10, 2026',
  autoDebit: 'If not paid manually, will be auto-debited from',
  paidTitle: 'Paid $350 successfully!',
  paidAt: 'Aug 6, 2026, 04:36 PM',
  net: { label: 'Net Total Paid', amount: '$350' },
}

/** Make Payment (1666:127878), raised by the invoice panel's Make Payment. */
export const MAKE_PAYMENT = {
  toPay: 'To Pay',
  amount: '$350',
  link: 'Invoice Details',
  from: 'From saved card',
  change: 'Change method',
  cta: 'Pay $350',
}

/** Add New Card (1663:103923). */
export const ADD_CARD = {
  fields: [
    { label: 'Card Number', placeholder: '0000  0000  0000  0000', wide: true },
    { label: 'Expiry Date', placeholder: 'MM / YYYY' },
    { label: 'CVV', placeholder: '000' },
    { label: 'Name on Card', placeholder: 'Enter name', wide: true },
  ],
  note: '$0.1 will be debited and credited back by merchant to confirm this method.',
}

export const PAID_MODAL = {
  title: '$350 paid successfully!',
  body: 'Your payment has been done and this study has been completed.',
}

export const REMOVE_CARD = {
  title: 'Remove **** 4242 Card?',
  body: 'Are you sure you want to remove save payment method of Master card ending with 4242?',
}
