/** Profile (1663:104600): two blocks of fields and one Save. */
export const PROFILE_FIELDS = {
  about: {
    label: 'About You',
    fields: [
      { label: 'Full Name', value: 'Jennifer Lee' },
      { label: 'Work Email', value: 'jenniferlee@soulfullabs.ai', locked: true },
      { label: 'Your Role', value: 'Product Manager' },
    ],
  },
  workspace: {
    label: 'Workspace',
    fields: [
      { label: 'Company Name', value: 'SoulfulLabs' },
      { label: 'VAT (Tax) Number', value: 'EAS56893231459' },
      { label: 'Company Website', value: 'https://www.soulfullabs.ai', locked: true, verified: true },
      { label: 'Industry', value: 'IT & Consultation', select: true },
      { label: 'Location', value: 'NYC, New York, USA' },
    ],
  },
}

/**
 * Rating & Reviews (1663:104635). The headline is the client's own score;
 * each row pairs a review with the rating the client gave that participant.
 */
export const CLIENT_RATING = { score: '4.5', of: 'of 1,468 reviews' }

export const CLIENT_REVIEWS = [
  {
    study: 'Digital patient consulting experience analysis', stars: 4, rating: '4.0', at: 'April 10, 2026',
    body: 'It was great working with Luke. He was clear about the requirements, responsive throughout the project, and very easy to communicate with.',
    to: 'Eliza D', toStars: 5, toRating: '5.0', toBody: 'The collaboration went smoothly, and I’d be happy to…',
  },
  {
    study: 'Mobile app design review', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'Working with Sarah was a pleasure.',
    to: 'John M', toStars: 4.5, toRating: '4.5',
  },
  {
    study: 'E-commerce website optimization', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'John was fantastic to work with. He understood the project goals from the start and delivered exceptional results that exceeded our expectations. I’d definitely recommend him to others!',
    to: 'Mark J', toStars: 5, toRating: '5.0',
  },
  {
    study: 'Social media marketing campaign', stars: 5, rating: '5', at: 'April 10, 2026',
    to: 'Henry L', toStars: 5, toRating: '5.0',
  },
  {
    study: 'Social media marketing campaign', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'Collaborating with Mia was delightful. She was proactive in her approach, and her insights into market trends helped shape a successful campaign. I look forward to partnering with her again!',
    to: 'Henry L', toStars: 5, toRating: '5.0', toBody: 'Mia’s strategic thinking was crucial for achieving ou…',
  },
]

/** Certificate (1663:104813). Every string on the screen. */
export const CERTIFICATE = {
  banner: 'You are a verified business!',
  since: 'Since July 2026',
  title: 'Human Layer Buyer Certificate',
  idLabel: 'Cert. ID:',
  id: 'HL-R-9F2A-3K7P',
  verifiedLabel: 'Verified',
  verified: [
    'EIN Business verified',
    'Domain ownership confirmed',
    'Verified billing on file',
    'Data handling agreement',
  ],
}

/** Settings (1663:104876). "Sudy" is the frame's own spelling. */
export const EMAIL_PREFS = [
  { label: 'Study gets live', sub: 'When your study gets published live' },
  { label: 'New application', sub: 'New respondent applies to your studies' },
  { label: 'Session booking', sub: 'When someone books session for study' },
  { label: 'Study completion', sub: 'When respondent completes your study and results are available' },
  { label: 'Sudy target fulfilled', sub: 'When study target gets fulfilled as defined' },
  { label: 'Invoices', sub: 'While invoices are issued and due' },
  { label: 'Support tickets', sub: 'For messages of your support tickets' },
]

export const CHANGE_PASSWORD = {
  title: 'Change Password',
  fields: [
    { label: 'Current Password', placeholder: 'Enter current password' },
    { label: 'New Password', placeholder: 'Enter new password' },
  ],
  rule: 'At least 1 special character, 1 uppercase character, and 1 number',
  confirm: { label: 'Confirm New Password', placeholder: 'Re-enter new password' },
}

export const DEACTIVATE = {
  title: 'Deactivate Account',
  note: 'Note:',
  body: 'Your account will be deactivated once all running studies gets ended. You can access and activate it again by logging in again.',
  ask: 'Enter your password to confirm deactivation.',
  field: { label: 'Current Password', placeholder: 'Enter current password' },
}

export const ACCOUNT_DIALOGS = {
  passwordUpdated: {
    title: 'Password has been updated!',
    body: 'Your new password has been updated with your account which you can use to login from now.',
  },
  deactivated: {
    title: 'Your account has been deactivated!',
    body: 'You can login back to reactivate and access your account.',
  },
  activeStudies: {
    title: 'Your account has active studies!',
    body: 'Account can be deactivated only after completing all the studies.',
    cta: 'Got It!',
  },
  logout: { title: 'Logout?', body: 'Are you sure you want to logout?' },
}
