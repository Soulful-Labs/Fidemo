/**
 * Participant verifications as drawn (section 2022:168588: list Onboarding
 * 2022:168589, Reported 2036:142437; detail frames under "ID" 2036:111504 and
 * "Profession Credential" 2036:134317). Every string is the frame's own.
 */
const M = '/img/verifications/m.png'
const F = '/img/verifications/f.png'
const d = (n: number) => `Oct ${n}, 2026`

export interface Pending { id: string; photo: string; name: string; role: string; date: string; by?: string; flag: string; reason: string }
const P = (i: number, kind: 'iv' | 'pc', name: string, role: string, reason: string, photo = M): Pending =>
  ({ id: `${kind}-${i}`, photo, name, role, date: d(i), flag: kind === 'iv' ? 'Identity Verification' : 'Profession Credential', reason })

export const ONBOARDING: Pending[] = [
  P(1, 'iv', 'Samuel Lee', 'Software Engineer', 'Driving License ID could not be verified by system.'),
  P(2, 'pc', 'Maya Johnson', 'Physician', 'Medical License could not be found.', F),
  P(3, 'iv', 'James Smith', 'UI/UX Designer', 'Passport ID could not be verified by system.'),
  P(4, 'iv', 'Emily Davis', 'Data Analyst', 'Govt. Voter ID could not be verified by system.'),
  P(5, 'pc', 'Michael Brown', 'Lead Nurse', 'Nursing License/certificate could not be found.'),
  P(6, 'pc', 'Sophia Wilson', 'Lawyer', 'Bar License not be found by system.'),
  P(7, 'iv', 'Daniel Garcia', 'DevOps Engineer', 'Passport ID could not be verified by system.'),
  P(8, 'pc', 'Olivia Martinez', 'General Surgeon', 'Doctor’s Medical License could not be found by system'),
  P(9, 'iv', 'Lucas Rodriguez', 'Business Analyst', 'Govt. Voter ID could not be verified by system.'),
  P(10, 'iv', 'Ava Hernandez', 'Content Writer', 'Driving License ID could not be verified by system.'),
]
/** History repeats the ten with a remark and a result; only James Smith is Rejected. */
export const ONBOARDING_HISTORY = ONBOARDING.map((r, i) => ({ ...r, id: `${r.id}h`, reason: i === 0 ? 'An OCR error, manually verified and matched with record.' : r.reason, result: i === 2 ? 'Rejected' : 'Verified' }))

const AI = 'Study answers were found AI-generated'
const WRONG = 'This participant doesn’t have any knowledge or experience of the study.'
const R = (i: number, name: string, role: string, by: string, flag: string, reason: string, photo = M): Pending => ({ id: `rp-${i}`, photo, name, role, date: d(i), by, flag, reason })
export const REPORTED: Pending[] = [
  R(1, 'Samuel Lee', 'Software Engineer', 'System (Algo)', 'AI/Bot Activity', AI),
  R(2, 'Maya Johnson', 'Physician', 'Robert Warner', 'Abusive Behaviour', 'Hello Team, This participant has behaved inappropriately during the session.', F),
  R(3, 'Lucas Brown', 'Data Scientist', 'System (Algo)', 'Spam Apply', 'Applying every study seen on feed.'),
  R(4, 'Emma Wilson', 'Product Manager', 'Sophia Rodriguez', 'Wrong Match', WRONG, F),
  R(5, 'James Smith', 'Graphic Designer', 'Robert Warner', 'Wrong Match', WRONG),
  R(6, 'Olivia Davis', 'Marketing Specialist', 'System (Algo)', 'AI/Bot Activity', AI, F),
  R(7, 'Ethan Miller', 'UX Researcher', 'System (Algo)', 'AI/Bot Activity', AI),
  R(8, 'Ava Martinez', 'Web Developer', 'System (Algo)', 'AI/Bot Activity', AI, F),
  R(9, 'Noah Garcia', 'Network Administrator', 'Lucas Brown', 'Wrong Match', WRONG),
  R(10, 'Sophia Rodriguez', 'Content Writer', 'System (Algo)', 'AI/Bot Activity', AI, F),
]
const NO = 'This report has been rejected as there’s no AI activity found.'
const H = (i: number, name: string, by: string, flag: string, reason: string, result: string, photo = M) => ({ id: `rp-${i}h`, photo, name, role: '', date: d(i), by, flag, reason, result })
export const REPORTED_HISTORY = [
  H(1, 'Samuel Lee', 'System (Algo)', 'AI/Bot Activity', NO, 'Rejected'),
  H(2, 'Maya Johnson', 'Robert Warner', 'Wrong Match', 'This report has been found correct and has restricted the account.', 'Restricted', F),
  H(3, 'James Smith', 'Lucas Brown', 'Abusive Behaviour', 'This report has been found correct and due to repeated reports deactivated.', 'Deactivated'),
  H(4, 'Emily Davis', 'System (Algo)', 'Spam Activity', NO, 'Rejected'),
  H(5, 'Michael Clark', 'Ethan Harris', 'Impersonation', NO, 'Rejected', F),
  H(6, 'Ava Wilson', 'Jacqueline Taylor', 'Phishing Attempt', NO, 'Rejected'),
  H(7, 'Liam Martinez', 'System (Algo)', 'AI/Bot Activity', NO, 'Rejected'),
  H(8, 'Chloe Garcia', 'Ella Thompson', 'Content Violation', 'This report has been reviewed and a warning restriction applied.', 'Restricted', F),
  H(9, 'Noah Robinson', 'System (Algo)', 'AI/Bot Activity', NO, 'Rejected'),
  H(10, 'Isabella King', 'System (Algo)', 'AI/Bot Activity', NO, 'Rejected'),
]

/** The two people the detail frames draw, with the header exactly as each set of frames draws it. */
export const SUBJECT = {
  samuel: { name: 'Samuel Lee', role: 'Software Engineer', photo: '/img/participants/samuel.png', verified: true },
  maya: { name: 'Maya Johnson', role: 'Physician', photo: '/img/verifications/maya.png', verified: false },
}
