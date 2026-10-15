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
      { label: 'Tax ID (optional)', value: '84-2931459' },
      { label: 'Company Website', value: 'https://www.soulfullabs.ai', locked: true, verified: true },
      { label: 'Industry', value: 'IT & Consultation', select: true },
      { label: 'Location', value: 'NYC, New York, USA' },
    ],
  },
}

/**
 * Certificate (1663:104813). The business certificate is its own object with
 * its own ID, FI-C-XXXX-XXXX, issued when the business check passes and kept
 * on the client's record (shared/derive.ts freshCertificateId). Policy
 * section 7: it claims only what the platform verifies, business registration
 * and billing. The frame's domain-ownership and data-handling lines, and its
 * fixed ID, are gone.
 */
export const CERTIFICATE = {
  banner: 'You are a verified business!',
  title: 'Human Layer Buyer Certificate',
  idLabel: 'Cert. ID:',
  verifiedLabel: 'Verified',
  registration: 'Business registration verified',
  billing: 'Billing on file',
  notIssued: 'Your business certificate is issued when your business verification passes.',
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
