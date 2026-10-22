/** Payments: the copy of the two card dialogs. Every figure on these screens is derived (mock/pay.ts, useBill). */
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

export const removeCardCopy = (brand: string, last4: string) => ({
  title: `Remove •••• ${last4} Card?`,
  body: `Are you sure you want to remove save payment method of ${brand === 'Mastercard' ? 'Master card' : brand} ending with ${last4}?`,
})
