/**
 * THE seed. One set of people, clients, studies, participations and money
 * for the respondent app, the client app and the internal console.
 *
 * The study a client manages is the study the console reviews is the study a
 * respondent applies to. Nothing here is a total, a count, a score or a
 * balance: those are computed by derive.ts from what is listed.
 *
 * Dates are relative to the moment the seed is built, so the demo never goes
 * stale: sessions are always a few days ahead and "paid last month" is
 * always last month.
 */
import { billing, freshCertificateId } from './derive'
import { avatarFor } from './avatar'
import { withdrawalExpectedBy } from './platform'
import { DEMO_SESSION_CODE, FEES, isSessionType, paymentPlan, priceStudy, rateFor } from './platform'
import { EMPTY_RATE_CARD, RATE_CARD, readCsv } from './ratecard'
import { RATE_CARD_FEES_CSV, RATE_CARD_SEGMENTS_CSV, RATE_CARD_SOURCE } from './seed/rateCardFiles'
import { SCREENERS, TASKS } from './seed/screeners'
import { catalogue } from './seed/catalogue'
import type { CatalogueEntry } from './seed/catalogue'
import { buildPool, starsSumming, targetScore } from './seed/people'
import { trustInputs } from './derive'
import { TRUST, pointsToUsd, starsForRating, trustForStars } from './rules'
import type { Answers, AudienceCriteria, SettingsChange } from './types'
import type { StudyGroup,
  Activity, Client, EarlierReview, Location, Participation, ParticipationState, Person, PlatformState,
  Question, RatingState, Report, Session, Stars, Study, StudyPayment, StudyReport, StudySetup, StudyType, TeamMember, Ticket,
} from './types'

export const SEED_VERSION = 22
export const DEMO_PERSON_ID = 'jonathan'
export const DEMO_PERSON_EMAIL = 'jonathan.reeve@example.com'
/** The respondent app's demo login (README). A front-end stand-in for real authentication, see Person.password. Every seeded participant has it. */
export const DEMO_PERSON_PASSWORD = 'Passw0rd!'
export const DEMO_CLIENT_ID = 'cl-soulful'
export const DEMO_CLIENT_EMAIL = 'jennifer@soulfullabs.com'
export const MASTER_ADMIN_ID = 'tm-peter'
/** The console's demo logins: the master admin, and a sub-admin limited to Studies and Participants. One password for every seeded team member. */
export const DEMO_ADMIN_EMAIL = 'peter@focusinsite.com'
export const DEMO_SUB_ADMIN_EMAIL = 'maya.thompson@humanlayer.com'
export const DEMO_TEAM_PASSWORD = 'demo1234'

const DAY = 86_400_000

/** In-person venues, per city. */
export const CITIES: Record<string, Location[]> = {
  'New York': [
    { id: 'nyc-ts', label: 'Times Square', short: 'Times Square, NYC, New York 160248', address: "124, Prestige Empire, Jenn's Street, Times Square, NYC, US 160248" },
    { id: 'nyc-bk', label: 'Brooklyn Heights', short: 'Brooklyn Heights, NYC, New York 160312', address: '8, Water Tower Road, Brooklyn Heights, NYC, US 160312' },
  ],
  Chicago: [
    { id: 'chi-loop', label: 'The Loop', address: '233 S Wacker Drive, Suite 4100, Chicago, IL 60606' },
    { id: 'chi-wp', label: 'Wicker Park', address: '1560 N Milwaukee Avenue, Chicago, IL 60622' },
  ],
  Boston: [
    { id: 'bos-bb', label: 'Back Bay', address: '500 Boylston Street, 8th Floor, Boston, MA 02116' },
    { id: 'bos-cam', label: 'Cambridge', address: '1 Broadway, Kendall Square, Cambridge, MA 02142' },
  ],
  Austin: [{ id: 'atx-dt', label: 'Downtown', address: '600 Congress Avenue, Austin, TX 78701' }],
}

const ALL_SLOTS = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:30 PM', '04:00 PM']

const CLIENT_KEYS: Record<string, string> = {
  rjp: 'cl-rjp', northwind: 'cl-northwind', procto: 'cl-procto', lumen: 'cl-lumen', brightline: 'cl-brightline',
  orbit: 'cl-orbit', meadow: 'cl-meadow', kinetic: 'cl-kinetic', harbor: 'cl-harbor', atlas: 'cl-atlas',
}

const er = (id: string, study: string, stars: number, at: string, comment: string | undefined, participant: EarlierReview['participant']): EarlierReview =>
  ({ id, study, stars, at, comment, participant })

const EARLIER: Record<string, EarlierReview[]> = {
  'cl-soulful': [
    er('sl-1', 'Digital patient consulting experience analysis', 4, '2026-04-10', 'It was great working with Jennifer. She was clear about the requirements, responsive throughout the project, and very easy to communicate with.', { name: 'Eliza D', stars: 5, comment: 'The collaboration went smoothly, and I’d be happy to work together again.' }),
    er('sl-2', 'Mobile app design review', 5, '2026-04-10', 'Working with the Soulful Labs team was a pleasure.', { name: 'Mark J', stars: 4 }),
    er('sl-3', 'E-commerce website optimization', 5, '2026-04-10', 'Fantastic to work with. They understood the project goals from the start and the session ran exactly to time.', { name: 'Henry L', stars: 5 }),
    er('sl-4', 'Social media marketing campaign', 5, '2026-03-22', undefined, { name: 'Mia T', stars: 5 }),
    er('sl-5', 'Social media marketing campaign', 4, '2026-03-20', 'Proactive, well prepared and paid on time.', { name: 'Noah W', stars: 5, comment: 'Strategic thinking that shaped the campaign.' }),
  ],
  'cl-rjp': [
    er('rjp-1', 'Oncology treatment planning interviews', 5, '2026-08-14', 'Clear brief, the moderator knew the clinical detail and the session ran to time.', { name: 'Eliza D', stars: 5, comment: 'Thoughtful answers, a pleasure to work with.' }),
    er('rjp-2', 'Biologics adherence survey', 4, '2026-07-02', 'Survey was long but the questions were relevant to daily practice.', { name: 'Marcus W', stars: 4 }),
    er('rjp-3', 'Specialist pharmacist panel', 5, '2026-05-19', 'Paid within two days. Would take part again.', { name: 'Priya N', stars: 5, comment: 'Excellent domain knowledge.' }),
  ],
  'cl-northwind': [
    er('nw-1', 'Inclusive classroom practices', 5, '2026-09-03', 'Friendly team and a clear purpose for the study.', { name: 'Tom A', stars: 5 }),
    er('nw-2', 'Assessment tooling feedback', 4, '2026-06-27', 'Slot ran ten minutes over, otherwise smooth.', { name: 'Dana O', stars: 4, comment: 'Detailed and constructive.' }),
    er('nw-3', 'Teacher planning habits diary', 5, '2026-04-11', 'Reminders arrived every day and payment was quick.', { name: 'Lena F', stars: 5 }),
    er('nw-4', 'Reading intervention interviews', 4, '2026-02-08', 'Good questions, the recording consent could be clearer.', { name: 'Ravi M', stars: 4 }),
  ],
  'cl-procto': [
    er('pr-1', 'Checkout drop-off interviews', 4, '2026-08-22', 'Straightforward session about a real checkout problem.', { name: 'Chloe B', stars: 4 }),
    er('pr-2', 'Loyalty programme survey', 3, '2026-05-30', 'Payment took over a week and support had to chase it.', { name: 'Noah W', stars: 4 }),
    er('pr-3', 'Store navigation walkthrough', 5, '2026-03-15', 'In person at their Brooklyn store, well organised.', { name: 'Mia T', stars: 5, comment: 'Great observations on the floor layout.' }),
  ],
  'cl-lumen': [
    er('lu-1', 'Remote monitoring clinician panel', 4, '2026-08-01', 'Useful discussion, though the group was larger than described.', { name: 'Sophia D', stars: 4 }),
    er('lu-2', 'Telehealth triage usability', 3, '2026-06-09', 'Session rescheduled twice by the client.', { name: 'Liam B', stars: 5 }),
    er('lu-3', 'Sleep app onboarding diary', 5, '2026-04-25', 'Short daily entries, generous reward.', { name: 'Amelia C', stars: 5 }),
  ],
  'cl-brightline': [
    er('br-1', 'Card onboarding flow test', 4, '2026-07-18', 'Prototype was rough but the researcher was excellent.', { name: 'James S', stars: 4 }),
    er('br-2', 'Budgeting habits survey', 4, '2026-03-02', 'Quick, paid on time.', { name: 'Olivia J', stars: 5 }),
  ],
  'cl-orbit': [
    er('or-1', 'Airport lounge experience groups', 5, '2026-08-30', 'Lovely venue, snacks provided, paid the same week.', { name: 'Lucas M', stars: 5, comment: 'Engaged and candid.' }),
    er('or-2', 'Booking flow interviews', 5, '2026-05-06', 'Very well prepared moderator.', { name: 'Ava R', stars: 4 }),
  ],
  'cl-meadow': [
    er('me-1', 'Breakfast cereal taste panel', 5, '2026-09-10', 'Fun session, clear instructions.', { name: 'Ethan K', stars: 5 }),
    er('me-2', 'Weekly meal planning diary', 4, '2026-07-21', 'Five days felt long but the reward was fair.', { name: 'Zoe P', stars: 4 }),
    er('me-3', 'Plant milk preferences survey', 5, '2026-01-28', 'Quick and relevant.', { name: 'Ben H', stars: 5 }),
  ],
  'cl-kinetic': [
    er('ki-1', 'Wearable comfort interviews', 4, '2026-08-08', 'Good questions about real use, session slightly rushed.', { name: 'Isla G', stars: 5 }),
    er('ki-2', 'Running app onboarding survey', 5, '2026-04-02', 'Paid the next day.', { name: 'Omar S', stars: 4 }),
  ],
  'cl-harbor': [
    er('ha-1', 'Claims process interviews', 4, '2026-06-15', 'Sensitive topic handled well.', { name: 'Grace L', stars: 4 }),
    er('ha-2', 'Renewal letter readability', 3, '2026-02-20', 'Invitation email arrived late; the session itself was fine.', { name: 'Henry C', stars: 5 }),
  ],
  'cl-atlas': [
    er('at-1', 'EV charging habits diary', 5, '2026-07-09', 'Clear daily prompts and a generous reward.', { name: 'Maya V', stars: 5, comment: 'Detailed logs every day.' }),
    er('at-2', 'Commuter focus group', 4, '2026-03-28', 'Group ran well, parking was hard to find.', { name: 'Leo F', stars: 4 }),
  ],
}

const SURVEY_SOCIAL: Question[] = [
  { id: 't1', kind: 'multi', prompt: 'Which tools do you design social posts in?', helper: 'Select as many applies', options: ['Canva', 'Figma', 'Adobe Express', 'Photoshop', 'In the social app itself'] },
  { id: 't2', kind: 'single', prompt: 'How many posts do you design in a typical week?', options: ['1 to 3', '4 to 10', '11 to 25', 'More than 25'] },
  { id: 't3', kind: 'scale', prompt: 'How easy is it to keep a consistent look across posts?', options: ['Easy', 'Neutral', 'Hard'] },
  { id: 't4', kind: 'text', prompt: 'What slows you down most when designing a post?', placeholder: 'Type your answer here..' },
]


/** A seeded study's audience as the read-back pills: each category it sets, or one pill saying it is open to everyone. */
function audiencePills(c: AudienceCriteria | undefined, required: number): StudySetup['audience'] {
  const pills: StudySetup['audience'] = [{ value: String(required), icon: 'people' }, { value: c?.countries?.join(', ') || 'Worldwide', icon: 'pin' }]
  if (!c || !Object.values(c).some((v) => Array.isArray(v) && v.length)) return [...pills, { label: 'Audience', value: 'Open to everyone' }]
  const add = (label: string, v?: string[]) => { if (v?.length) pills.push({ label, value: v.join(', ') }) }
  add('Gender', c.genders); add('Education', c.education); add('Age', c.ageRanges); add('Work Functions', c.functions)
  add('Roles', c.roles); add('Skills', c.skills); add('Industry', c.industries); add('Experience', c.experience)
  add('Household Income', c.income); add('Ethnicity', c.ethnicity); add('Area Type', c.areaTypes); add('Tiers', c.tiers)
  return pills
}

const setup = (studySummary: { label: string; value: string }, _roles?: string, screenerSummary = '8 inputs'): StudySetup => ({
  estimatedAudience: '1K',
  // Filled from the study's own audience once the seed is built (audiencePills).
  audience: [],
  screenerSummary, studySummary,
})

const SUMMARY: Record<StudyType, { label: string; value: string }> = {
  survey: { label: 'Survey Form', value: '10 inputs' },
  video_call: { label: 'Video Call', value: '1:1 sessions, 5 days/week, custom timings' },
  group_video_call: { label: 'Group Video Call', value: '2 sessions, 10 seats, 40 minutes each' },
  in_person: { label: 'In-Person', value: '2 addresses, available 5 days/week, custom timings, 2 days overrides' },
  in_person_group: { label: 'In-Person Group', value: '2 addresses, 2 sessions, 10 seats' },
  diary: { label: 'Diary Study Form', value: '5 questions, 5 days logs' },
}

interface Counts {
  rated?: number; completed?: number; unpaid?: number; noShow?: number; scheduled?: number; recruited?: number
  qualified?: number; disqualified?: number; applied?: number; invited?: number; matched?: number
}

export function buildSeed(now: Date = new Date()): PlatformState {
  // The rate card the seed's studies are priced from (24 Oct 2026): the team's own files, read as an upload reads them.
  const rateCard = { segments: readCsv(RATE_CARD_SEGMENTS_CSV)?.segments ?? [], fees: readCsv(RATE_CARD_FEES_CSV)?.fees ?? [] }
  RATE_CARD.current = rateCard
  const t0 = now.getTime()
  const at = (offsetDays: number, hour = 10, minute = 0): string => {
    const d = new Date(t0 + offsetDays * DAY)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }
  const plus = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * DAY).toISOString()
  /**
   * Times on the day the demo is built are counted back from the moment it is
   * built, never written as a fixed hour: "today at 9:00" is in the past or the
   * future depending on when the seed runs, and a session that "ran earlier
   * today" must have started before now whatever the hour (23 Oct 2026).
   */
  const minsAgo = (mins: number): string => new Date(t0 - mins * 60_000).toISOString()
  /** A session that started about `mins` ago, on a half hour: the booking's date and its slot. */
  const startedAgo = (mins: number): { date: string; slot: string } => {
    const d = new Date(t0 - mins * 60_000)
    d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0)
    return { date: d.toISOString(), slot: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
  }

  /** Availability that differs per study: some are wide open and some nearly full. */
  const availabilityFor = (n: number): Study['availability'] => {
    const days = [2, 3, 4, 5, 6, 7, 9, 10, 12].filter((_, i) => (n * 7 + i) % 3 !== 1).slice(0, 3 + (n % 4))
    return days.map((d, i) => ({ date: at(d), slots: ALL_SLOTS.filter((_, j) => (n + i + j) % (2 + (n % 3)) !== 0) }))
  }

  // ----------------------------------------------------------------- people

  const pool = buildPool({ at, minsAgo })
  const byId = new Map(pool.map((p) => [p.id, p]))

  const jonathan: Person = {
    // The demo participant starts with no picture, so adding one (and the consent to show it) can be shown from the start.
    id: DEMO_PERSON_ID, name: 'Jonathan Reeve', photoConsent: false, email: DEMO_PERSON_EMAIL, phone: '+1 555 0142 889',
    joinedAt: at(-420, 9, 0), lastActiveAt: minsAgo(45), status: 'active', location: 'New York, US',
    profile: {
      gender: 'Male', address: 'Brooklyn, New York', areaType: 'Urban', aboutMe: '', languages: ['English'],
      nationality: 'American', income: '', ethnicity: '', pets: ['Dog', 'Bird'], homeOwner: 'Yes',
      occupation: 'General Physician', experience: '10 years', licenseId: '98765012345678',
      industry: 'Healthcare', education: 'Bachelors Degree',
      topics: ['Wellness', 'Fitness & Yoga', 'Spirituality', 'Travel', 'Science'], workFunctions: ['Consultation', 'Patient Care'], skills: ['Diagnosis', 'Triage'],
      dob: '06 / 05 / 1988', idType: 'Passport',
    },
    onboarded: true, taxFormDone: false, sourceCode: 'HL-013-B',
    identity: { state: 'verified' }, profession: { state: 'verified' },
    consent: { shareProfession: false, shareProfile: true, essentialCookies: true, performanceCookie: true },
    emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
    /** His whole record is in the seed, so there is nothing from before it. */
    prior: { completedThisYear: 0, stars: [] },
    trustEvents: [],
    payoutMethods: [
      { id: 'pm-1', bankName: 'American Bank', accountNumber: '1245 8965 1034 7790', routingCode: '23567898', type: 'Checking', isDefault: true },
      { id: 'pm-2', bankName: 'Chase Bank', accountNumber: '9921 4410 7788 4521', routingCode: '80123344', type: 'Savings', isDefault: false },
    ],
    payouts: [
      { id: 'po-1', at: at(-1, 23, 0), amount: 100, destination: '****7790', txId: '#152356789107', status: 'pending', expectedBy: withdrawalExpectedBy(at(-1, 23, 0)), fee: FEES.WITHDRAWAL },
      { id: 'po-2', at: at(-120, 14, 20), amount: 250, destination: '****7790', txId: '#152356712004', status: 'paid', fee: FEES.WITHDRAWAL },
      { id: 'po-3', at: at(-330, 10, 5), amount: 500, destination: '****4521', txId: '#152356698771', status: 'paid', fee: FEES.WITHDRAWAL },
    ],
    redemptions: [{ id: 'rd-1', at: at(-52, 9, 0), points: 300, usd: pointsToUsd(300), reference: '#058260552' }],
    /** The eight people who joined through his link are in the pool; five have had a first study paid. */
    referrals: [
      { id: 'rf-1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', status: 'completed', at: at(-200) },
      { id: 'rf-2', name: 'Marcus Webb', email: 'marcus.webb@example.com', status: 'completed', at: at(-160) },
      { id: 'rf-3', name: 'Priya Nair', email: 'priya.nair@example.com', status: 'completed', at: at(-120) },
      { id: 'rf-4', name: 'Tom Alvarez', email: 'tom.alvarez@example.com', status: 'completed', at: at(-80) },
      { id: 'rf-5', name: 'Dana Okafor', email: 'dana.okafor@example.com', status: 'completed', at: at(-44) },
      { id: 'rf-6', name: 'Lena Fischer', email: 'lena.fischer@example.com', status: 'joined', at: at(-21) },
      { id: 'rf-7', name: 'Ravi Menon', email: 'ravi.menon@example.com', status: 'joined', at: at(-9) },
      { id: 'rf-8', name: 'Chloe Barnes', email: 'chloe.barnes@example.com', status: 'joined', at: at(-3) },
    ],
    savedStudyIds: [], notifications: [],
  }
  // Checks the automatic verification could not settle, and the ones already decided.
  const flag = (id: string, key: 'identity' | 'profession', reason: string, days: number) => {
    const p = byId.get(id)!
    p[key] = { state: 'flagged', reason, flaggedAt: at(-days, 11, 20) }
    if (key === 'identity') { p.onboarded = false; p.prior = { completedThisYear: 0, stars: [] } }
  }
  flag('samuel-l', 'identity', 'Uploaded passport file could not be verified with the govt. records. Verify it manually.', 1)
  flag('amelia-c', 'identity', 'Automatic ID match did not match the name on the account.', 2)
  flag('gen-05', 'identity', 'Uploaded driving licence photo is too blurred to read.', 4)
  flag('maya-j', 'profession', 'Uploaded Medical License could not be verified with the official records.', 2)
  flag('gen-09', 'profession', 'License number was not found on the state register.', 5)
  byId.get('gen-03')!.identity = { state: 'verified', reason: 'Automatic ID match did not match the name on the account.', flaggedAt: at(-12, 9, 0), note: 'An OCR error, manually verified and matched with record.', decidedAt: at(-10, 14, 5), decidedBy: 'tm-maya' }
  byId.get('gen-17')!.identity = { state: 'rejected', reason: 'Uploaded passport file could not be verified with the govt. records.', flaggedAt: at(-20, 9, 0), note: 'Did not submit the document as required.', decidedAt: at(-16, 10, 30), decidedBy: 'tm-james' }
  byId.get('gen-17')!.onboarded = false
  byId.get('gen-11')!.profession = { state: 'verified', reason: 'License number was not found on the state register.', flaggedAt: at(-30, 9, 0), note: 'Register lists the licence under a maiden name; matched manually.', decidedAt: at(-27, 15, 0), decidedBy: 'tm-maya' }
  const deactivate = (id: string, reason: string, days: number, by: string) => {
    const p = byId.get(id)!
    p.status = 'deactivated'; p.statusNote = { reason, at: at(-days, 12, 0), by }
  }
  deactivate('gen-33', 'Passport ID verification could not be done.', 11, 'tm-james')
  deactivate('gen-34', 'Account closed at the participant’s request.', 40, 'tm-maya')
  deactivate('gen-21', 'Third upheld report: study answers were found AI-generated.', 6, 'tm-maya')
  byId.get('gen-21')!.trustEvents = [{ kind: 'fraud', detail: 'Upheld report: AI-generated answers', at: at(-6, 12, 0) }]
  byId.get('gen-22')!.status = 'restricted'
  byId.get('gen-22')!.statusNote = { reason: 'Spam applications across unrelated studies.', at: at(-3, 16, 0), by: 'tm-james', until: at(12, 16, 0), category: 'Spam Apply' }
  // The ladder counts this one: it is the account's first restriction (policy section 9).
  byId.get('gen-22')!.restrictions = [{ at: at(-3, 16, 0), until: at(12, 16, 0), category: 'Spam Apply', reason: 'Spam applications across unrelated studies.', by: 'tm-james' }]

  const people = [jonathan, ...pool]
  for (const p of people) {
    p.password = DEMO_PERSON_PASSWORD
    p.demo = true
    // Seeded demo files for every ID already submitted: the name the ID type gives and a plausible size.
    if (p.identity.state !== 'not_started' && !p.identity.documents) {
      const kind = p.profile.idType || 'Passport'
      const size = 900_000 + (p.id.length * 131_071) % 1_400_000
      p.identity = { ...p.identity, documents: { front: { name: `${kind} front.jpg`, bytes: size }, back: { name: `${kind} back.jpg`, bytes: size - 61_440 } } }
    }
  }
  /** Everyone the generator may put on a study: verified, active, and not Jonathan (his part is written by hand). */
  const fillable = pool.filter((p) => p.status === 'active' && p.identity.state === 'verified')

  // ---------------------------------------------------------------- clients

  const client = (
    id: string, name: string, role: string, company: string, industry: string, location: string, n: number, extra: Partial<Client> = {},
  ): Client => ({
    id, name, role, company, industry, location,
    email: `${name.toLowerCase().split(' ')[0]}@${company.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14)}.com`,
    taxId: `${String(12 + (n % 80)).padStart(2, '0')}-${String(3456789 + n * 7919).slice(-7)}`, website: `https://www.${company.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14)}.com`,
    joinedAt: at(-(500 - n * 31), 9, 0), lastActiveAt: n % 9 === 0 ? minsAgo(40 + n * 13) : at(-(n % 9), 10 + (n % 6), 15), status: 'active',
    business: { state: 'verified' }, earlierReviews: EARLIER[id] ?? [], cards: [], simulated: true, ...extra,
  })
  const clients: Client[] = [
    client(DEMO_CLIENT_ID, 'Jennifer Lee', 'Product Manager', 'Soulful Labs', 'IT & Consultation', 'New York, US', 0, {
      email: DEMO_CLIENT_EMAIL, taxId: '84-2931459', website: 'https://www.soulfullabs.ai', simulated: false, lastActiveAt: minsAgo(20),
      cards: [{ brand: 'Mastercard', last4: '4242', expires: 'Expires 08/28', isDefault: true }, { brand: 'VISA', last4: '6080', expires: 'Expires 08/28' }],
    }),
    client('cl-rjp', 'Helen Marlow', 'Research Director', 'RJP Pharma Ltd.', 'Pharma', 'Boston, US', 1),
    client('cl-northwind', 'Marcus Bell', 'UX Researcher', 'Northwind Research', 'Education', 'Chicago, US', 2),
    client('cl-procto', 'Aisha Karim', 'Product Designer', 'Procto Platform', 'Retail', 'New York, US', 3),
    client('cl-lumen', 'Daniel Osei', 'Clinical Researcher', 'Lumen Health', 'Healthcare', 'Miami, US', 4),
    client('cl-brightline', 'Rachel Stein', 'Head of Research', 'Brightline Fintech', 'Finance', 'Austin, US', 5),
    client('cl-orbit', 'Pablo Reyes', 'Insights Lead', 'Orbit Travel', 'Travel', 'Los Angeles, US', 6),
    client('cl-meadow', 'Nora Whitman', 'Brand Manager', 'Meadow Foods', 'Food', 'Denver, US', 7),
    client('cl-kinetic', 'Kenji Watanabe', 'Product Manager', 'Kinetic Labs', 'Wellness', 'Seattle, US', 8),
    client('cl-harbor', 'Fiona Blake', 'Customer Insight Manager', 'Harbor Insurance', 'Finance', 'Boston, US', 9),
    client('cl-atlas', 'Greg Novak', 'Research Manager', 'Atlas Mobility', 'Automotive', 'Chicago, US', 10),
    // Business checks waiting on the team, and two already decided.
    client('cl-verda', 'Jennifer Winter', 'UX Researcher', 'Verda Clinics', 'Healthcare', 'San Francisco, US', 11, {
      joinedAt: at(-2, 10, 0), business: { state: 'flagged', reason: 'Tax ID for business registration could not be found', flaggedAt: at(-2, 10, 5) } }),
    client('cl-pine', 'Owen Hart', 'Founder', 'Pinecrest Analytics', 'Consultancy', 'Denver, US', 12, {
      joinedAt: at(-4, 15, 0), business: { state: 'flagged', reason: 'Website and tax ID for business registration could not be found', flaggedAt: at(-4, 15, 5) } }),
    client('cl-quill', 'Tara Singh', 'Content Head', 'Quill Media', 'Media', 'Seattle, US', 13, {
      joinedAt: at(-25, 9, 0), business: { state: 'verified', reason: 'Tax ID for business registration could not be found', flaggedAt: at(-25, 9, 5), note: 'An OCR error, manually verified and matched with record.', decidedAt: at(-23, 11, 0), decidedBy: 'tm-robert' } }),
    client('cl-brix', 'Ivan Petrov', 'Director', 'Brix Labs', 'IT', 'Miami, US', 14, {
      joinedAt: at(-33, 9, 0), status: 'deactivated', statusNote: { reason: 'Could not verify the business, hence deactivated.', at: at(-30, 12, 0), by: 'tm-robert' },
      business: { state: 'rejected', reason: 'Website and tax ID for business registration could not be found', flaggedAt: at(-33, 9, 5), note: 'Did not submit the tax ID document for verification as required.', decidedAt: at(-30, 12, 0), decidedBy: 'tm-robert' } }),
  ]

  // ---------------------------------------------------------------- studies

  let cursor = 0
  /**
   * Puts people on a study from counts, so the counts and the list can never
   * disagree. Each person is on a study once: the pool is walked from a
   * different place for each study and nobody is taken twice.
   */
  const fill = (study: Study, counts: Counts, opts: { doneFrom: number; doneTo: number; skip?: string[] }): Participation[] => {
    const taken = new Set([...(opts.skip ?? []), ...study.participations.map((p) => p.personId)])
    const start = cursor
    cursor += 13
    let i = 0
    const next = (): Person | undefined => {
      while (i < fillable.length) {
        const p = fillable[(start + i) % fillable.length]!
        i += 1
        if (!taken.has(p.id)) { taken.add(p.id); return p }
      }
      return undefined
    }
    const out: Participation[] = []
    const session = isSessionType(study.type)
    const group = study.type === 'group_video_call' || study.type === 'in_person_group'
    const applied = (k: number) => at(opts.doneFrom - 9 - (k % 6), 9 + (k % 8), (k * 13) % 60)
    const take = (n: number | undefined, make: (p: Person, k: number) => Participation) => {
      for (let k = 0; k < (n ?? 0); k += 1) { const p = next(); if (p) out.push(make(p, k)) }
    }
    const span = Math.max(1, opts.doneTo - opts.doneFrom)
    const doneAt = (k: number, total: number) => at(opts.doneFrom + Math.floor((k / Math.max(1, total)) * span), 13, (k * 7) % 60)
    const code = { value: DEMO_SESSION_CODE, byParticipant: true, byClient: true }
    const done = (counts.rated ?? 0) + (counts.completed ?? 0) + (counts.unpaid ?? 0)
    const finished = (p: Person, k: number, extra: Partial<Participation>): Participation => {
      const completedAt = doneAt(k, done)
      const paidAt = extra.paidAt === undefined ? plus(completedAt, 2) : extra.paidAt || undefined
      return {
        personId: p.id, state: 'completed', prescreener: 'passed', completedAt,
        code: session ? code : undefined, booking: session ? { date: completedAt, slot: ALL_SLOTS[k % ALL_SLOTS.length]!, sessionId: group ? (study.state === 'completed' && k % 2 ? 's2' : 's1') : undefined, rescheduleCount: 0 } : undefined,
        diaryDays: study.diary ? [1, 2, 3, 4, 5].slice(0, 4 + (k % 2)) : undefined,
        events: [{ label: 'Applied', at: applied(k) }, { label: 'Qualified', at: plus(applied(k), 2) }, { label: 'Completed', at: completedAt },
          ...(paidAt ? [{ label: 'Payout processed by the team', at: paidAt }, { label: 'Paid', at: paidAt }] : [])],
        ...extra, paidAt,
      }
    }
    take(counts.rated, (p, k) => {
      const state: RatingState = k % 11 === 5 ? 'poor' : k % 4 === 3 ? 'good' : 'excellent'
      const completedAt = doneAt(k, done)
      return finished(p, k, { rating: { stars: starsForRating(state), state, at: plus(completedAt, 2) } })
    })
    take(counts.completed, (p, k) => finished(p, k + (counts.rated ?? 0), {}))
    take(counts.unpaid, (p, k) => finished(p, k + (counts.rated ?? 0) + (counts.completed ?? 0), { paidAt: '' }))
    take(counts.noShow, (p, k) => ({
      personId: p.id, state: 'no_show', prescreener: 'passed',
      booking: session ? { date: doneAt(k, 3), slot: ALL_SLOTS[(k + 3) % ALL_SLOTS.length]!, sessionId: group ? 's1' : undefined, rescheduleCount: 0 } : undefined,
      events: [{ label: 'Applied', at: applied(k) }, { label: 'Qualified', at: plus(applied(k), 2) }, { label: 'No Show', at: doneAt(k, 3) }],
    }))
    take(counts.scheduled, (p, k) => {
      /** The first three sessions ran in the hours before the demo was built, so their participants have entered the code; the rest are ahead, from tomorrow. */
      const ran = k < 3 && !group
      const when = ran ? startedAgo(60 * (3 - k) + 30) : { date: at(1 + (k % 5), 10, 0), slot: group ? '10:00 AM' : ALL_SLOTS[k % ALL_SLOTS.length]! }
      return {
        personId: p.id, state: 'scheduled', prescreener: 'passed',
        booking: { date: when.date, slot: when.slot, sessionId: group ? 's2' : undefined, locationId: study.locations?.[k % study.locations.length]?.id, rescheduleCount: 0 },
        code: { value: DEMO_SESSION_CODE, byParticipant: ran, byClient: false },
        events: [{ label: 'Applied', at: applied(k) }, { label: 'Qualified', at: plus(applied(k), 2) }, { label: 'Scheduled', at: plus(applied(k), 3) }],
      }
    })
    take(counts.recruited, (p, k) => ({ personId: p.id, state: 'recruited', prescreener: 'passed', events: [{ label: 'Applied', at: applied(k) }, { label: 'Qualified', at: plus(applied(k), 2) }] }))
    take(counts.qualified, (p, k) => ({ personId: p.id, state: 'qualified', prescreener: 'passed', decidedAt: at(-2 - (k % 3), 15, 0), events: [{ label: 'Applied', at: applied(k) }, { label: 'Qualified', at: at(-2 - (k % 3), 15, 0) }] }))
    take(counts.disqualified, (p, k) => ({ personId: p.id, state: 'disqualified', prescreener: k % 2 ? 'terminated' : 'passed', decidedAt: at(-3 - (k % 4), 11, 0), events: [{ label: 'Applied', at: applied(k) }, { label: 'Rejected', at: at(-3 - (k % 4), 11, 0) }] }))
    take(counts.applied, (p, k) => ({ personId: p.id, state: 'applied', prescreener: 'passed', heldForReview: k % 5 === 0, events: [{ label: 'Applied', at: at(-1 - (k % 6), 9 + (k % 9), (k * 11) % 60) }] }))
    take(counts.invited, (p, k) => ({ personId: p.id, state: 'invited', events: [{ label: 'Invited', at: at(-1 - (k % 4), 12, 0) }] }))
    take(counts.matched, (p) => ({ personId: p.id, state: 'matched', events: [] }))
    return out
  }

  const payment = (study: Study, kind: StudyPayment['kind'], amount: number, when: string, confirmedBy?: string): StudyPayment =>
    ({ id: `${study.id}-${kind}`, kind, amount, at: when, confirmedBy })

  /**
   * The payment structure (23 Oct 2026, shared/platform.ts): priced at submission at the rate for what the
   * study asks (rateFor), the upfront deposit taken then, and the incentive deposit when the team took it live.
   */
  const deposits = (study: Study) => {
    if (study.state === 'draft' || !study.submittedAt || study.required <= 0) return
    study.ratePeriods = [{ rate: rateFor(study), from: study.submittedAt }]
    const plan = paymentPlan(study.ratePeriods[0]!.rate, study.required)
    study.payments.push({ id: `${study.id}-deposit-upfront`, kind: 'deposit', stage: 'upfront', amount: plan.upfront, at: study.submittedAt })
    if (study.approvedAt) study.payments.push({ id: `${study.id}-deposit-incentive`, kind: 'deposit', stage: 'incentive', amount: plan.incentive, at: study.approvedAt })
  }

  /** What a finished study came to (shared/derive.ts billing): the final bill less the deposits, paid some days after it ended. */
  const settle = (study: Study, paidDaysAfter: number | null) => {
    const net = billing(study).net
    if (net > 0 && paidDaysAfter != null && study.completedAt) study.payments.push(payment(study, 'balance', net, plus(study.completedAt, paidDaysAfter)))
    return net
  }

  const base = (s: Partial<Study> & Pick<Study, 'id' | 'clientId' | 'title' | 'description' | 'type' | 'state' | 'industry' | 'durationMins' | 'required' | 'endsAt' | 'createdAt' | 'targetProfession'>, incentive: number, screenerSet: string, tasks?: Question[]): Study => {
    const inPerson = s.type === 'in_person' || s.type === 'in_person_group'
    const n = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0)
    const study: Study = {
      repeatRule: 'allow', rates: priceStudy(s.type, incentive), linkCode: `HL-${String(n % 1000).padStart(3, '0')}-${['A', 'B', 'C', 'D'][n % 4]}`,
      preScreener: SCREENERS[screenerSet]!.pre, screener: SCREENERS[screenerSet]!.full, tasks,
      locations: inPerson ? CITIES[s.city ?? 'New York'] : undefined,
      availability: s.type === 'video_call' || s.type === 'in_person' ? availabilityFor(n) : undefined,
      diary: s.type === 'diary' ? { totalDays: 5, minDays: 4, unit: 'Day', frequency: 'Every day' } : undefined,
      setup: setup(SUMMARY[s.type], undefined, `${SCREENERS[screenerSet]!.pre.length + SCREENERS[screenerSet]!.full.length} inputs`),
      participations: [], payments: [], revisions: [],
      ...s,
    }
    deposits(study)
    return study
  }

  /** Two sessions for a group study: one that has run and one ahead, whose date and slot are also what a respondent books. */
  const sessionsFor = (study: Study, ranDaysAgo: number, aheadDays: number): Session[] => {
    const sessions: Session[] = [
      { id: 's1', date: at(-ranDaysAgo, 10, 0), slot: '10:00 AM', seats: Math.ceil(study.required / 2), locationId: study.locations?.[0]?.id },
      { id: 's2', date: at(aheadDays, 10, 0), slot: '10:00 AM', seats: Math.ceil(study.required / 2), locationId: study.locations?.[1]?.id ?? study.locations?.[0]?.id },
    ]
    return sessions
  }

  // -- The demo client's own studies: the six the client app and the console are drawn around.

  const live = (
    id: string, title: string, type: StudyType, state: Study['state'], industry: string, durationMins: number, description: string,
    image: string, required: number, daysLeft: number, createdDaysAgo: number, repeatRule: Study['repeatRule'], screenerSet: string,
    targetProfession: string, extra: Partial<Study> = {}, tasks?: Question[],
  ): Study => base({
    id, clientId: DEMO_CLIENT_ID, title, type, state, industry, durationMins, description, image: `/img/${image}`, required, repeatRule,
    createdAt: at(-createdDaysAgo - 1, 11, 0), submittedAt: at(-createdDaysAgo - 1, 16, 0), approvedAt: at(-createdDaysAgo, 14, 30),
    endsAt: state === 'completed' ? at(-daysLeft, 18, 0) : at(daysLeft, 18, 0), completedAt: state === 'completed' ? at(-daysLeft, 18, 0) : undefined,
    targetProfession, ...extra,
  }, 100, screenerSet, tasks)

  const goal = live('st-goal', 'About goal-tracking methods', 'video_call', 'recruiting', 'Business', 60,
    'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.',
    'goals.jpg', 40, 16, 74, 'allow', 'education', 'People who set and track personal goals')
  goal.participations = [
    /** The search has shortlisted Jonathan for this one; the client can invite him from Matched. */
    { personId: DEMO_PERSON_ID, state: 'matched', events: [] },
    ...fill(goal, { recruited: 6, scheduled: 4, qualified: 10, disqualified: 5, applied: 15, invited: 8, matched: 8 }, { doneFrom: -10, doneTo: -1 }),
  ]

  const pay = live('st-pay', 'How do you make your digital payments mostly?', 'diary', 'recruiting', 'Finance', 60,
    'Share about your ways of digital spending and payment methods you use in your daily life.',
    'card.jpg', 30, 36, 79, 'allow', 'fintech', 'Adults who pay by card or phone wallet most days', {}, TASKS.payments)
  pay.participations = fill(pay, { rated: 3, completed: 13, unpaid: 4, noShow: 2, recruited: 4, qualified: 9, disqualified: 6, applied: 19, invited: 7, matched: 9 }, { doneFrom: -40, doneTo: -1 })

  const sleep = live('st-sleep', 'Share about your sleep cycle', 'in_person', 'completed', 'Healthcare', 60,
    'Share about your sleep cycle, how you track it and what changes it through the week.',
    'sleep.svg', 60, 6, 89, 'allow', 'sleep', 'Adults who have tried to improve their sleep this year', { city: 'Boston' })
  // Two completed and not yet paid: the study ended 6 days ago, so Finance > Payouts shows 8 of the 14 days left (23 Oct 2026).
  sleep.participations = fill(sleep, { rated: 12, completed: 46, unpaid: 2, noShow: 3, disqualified: 8 }, { doneFrom: -70, doneTo: -8 })

  const fitness = live('st-fitness', 'Fitness tracker apps experience', 'group_video_call', 'ongoing', 'Health', 60,
    'Talk through the fitness tracker apps you use and what keeps you coming back to them.',
    'fitness.svg', 60, 12, 84, 'allow', 'fitness', 'Regular users of a fitness or activity app')
  fitness.sessions = sessionsFor(fitness, 6, 3)
  fitness.participations = fill(fitness, { rated: 2, completed: 16, unpaid: 2, noShow: 4, recruited: 2, scheduled: 10, qualified: 6, disqualified: 7, applied: 12, invited: 6, matched: 9 }, { doneFrom: -30, doneTo: -6 })

  const travel = live('st-travel', 'Travel preferences and experiences', 'in_person_group', 'completed', 'Travel', 60,
    'Talk through how you plan and book travel, and what changes your mind at the last minute.',
    'travel.svg', 45, 18, 94, 'allow', 'travel', 'Frequent flyers who book their own travel', { city: 'Chicago' })
  travel.sessions = sessionsFor(travel, 40, -20)
  // Three completed and not yet paid on a study that ended 18 days ago: past the 14 days, so overdue in Finance > Payouts and on the console dashboard.
  travel.participations = fill(travel, { rated: 6, completed: 31, unpaid: 3, noShow: 2, disqualified: 5 }, { doneFrom: -60, doneTo: -19 })
  /**
   * Demo data for the Final bill drawn in two rate periods (Pay - Completed Study, 23 Oct 2026): the study's
   * requirements changed part way, and the rate agreed then applies to the people who completed after it.
   * Nothing in the app changes a rate today; the rate sheet will (shared/platform.ts rateFor).
   */
  travel.ratePeriods = [...travel.ratePeriods!, { rate: travel.ratePeriods![0]!.rate + 100, from: at(-40, 10, 0) }]

  const social = live('st-social', 'Social media posts designing apps', 'survey', 'recruiting', 'Consumer', 30,
    'How do you design social media posts and what tools do you use for it',
    'canva.jpg', 30, 36, 94, 'exclude', 'design', 'Marketers, Small business owners, Content creators', {}, SURVEY_SOCIAL)
  social.audience = { roles: ['Influencer', 'Creator', 'Marketer', 'Designer', 'Business Owner'] }
  social.setup = setup(SUMMARY.survey, undefined, `${social.preScreener.length + social.screener.length} inputs`)
  // Revisions History (client 2322:211934): the team asked for changes and edited the description, then the client resubmitted.
  const sent = social.submittedAt!
  const after = (hours: number) => new Date(new Date(sent).getTime() + hours * 3_600_000).toISOString()
  const optioned = social.screener.findIndex((q) => 'options' in q && q.options.length > 0)
  const option = optioned >= 0 ? (social.screener[optioned] as { options: string[] }).options.at(-1) : undefined
  social.firstSubmittedAt = sent
  social.submittedAt = after(5)
  social.revisions = [{
    text: 'We have reviewed your study and noticed the following things should be updated:\n\n1. About section:\n    a. The description is too vague to tell what the study is about.\n2. Screener section:\n    a. Some answers do not suit the type of question.\n\nUpdate the above and resubmit it to get it live. Thanks!',
    at: after(1), by: 'tm-maya',
  }]
  social.edits = [
    { at: after(3), by: 'team', byId: 'tm-maya', changes: [{ path: ['About', 'Description'], from: 'Tell us about the posts you make', to: social.description }] },
    { at: after(5), by: 'client', changes: [
      { path: ['About', 'Title'], from: 'Designing posts for social media', to: social.title },
      { path: ['Audience', 'Industries'], added: [social.industry], removed: ['Lifestyle'] },
      ...(option ? [{ path: ['Screener', `Q${optioned + 1}`, 'Option'], added: [option] }] : []),
    ] },
  ]
  social.participations = fill(social, { rated: 1, completed: 4, noShow: 1, recruited: 5, qualified: 8, disqualified: 4, applied: 14, invited: 7, matched: 9 }, { doneFrom: -20, doneTo: -2 })

  /** One of the demo client's studies is waiting on the team, so the console's To Review queue starts with it. */
  const onboardingStudy = base({
    id: 'st-remote', clientId: DEMO_CLIENT_ID, title: 'Remote onboarding experience', type: 'video_call', state: 'in_review', industry: 'IT',
    durationMins: 45, description: 'How new joiners experience their first two weeks when the whole onboarding is remote.', image: '/img/staffing.svg',
    required: 12, createdAt: at(-1, 10, 0), submittedAt: at(-1, 15, 20), endsAt: at(30, 18, 0), targetProfession: 'People who started a remote job this year',
  }, 120, 'staffing')

  const draft = (id: string, title: string, type: StudyType, daysAgo: number): Study => base({
    id, clientId: DEMO_CLIENT_ID, title, type, state: 'draft', industry: '', durationMins: 60, description: '', required: 0,
    createdAt: at(-daysAgo, 12, 0), endsAt: at(30, 18, 0), targetProfession: '',
  }, 100, 'education')
  const drafts = [
    draft('dr-1', 'Meal kit subscriptions, first month', 'survey', 3),
    draft('dr-2', 'Household budgeting diary', 'diary', 8),
    draft('dr-3', 'Pharmacy counter walkthrough', 'in_person', 18),
    draft('dr-4', 'Wearables and sleep, one to one', 'video_call', 13),
    draft('dr-5', 'Commuters on shared mobility', 'in_person_group', 23),
  ]

  const archived = (id: string, title: string, type: StudyType, required: number, completed: number, doneDaysAgo: number): Study => {
    const s = base({
      id, clientId: DEMO_CLIENT_ID, title, type, state: 'completed', industry: 'Healthcare', durationMins: 60, description: '', required,
      image: undefined, createdAt: at(-doneDaysAgo - 45, 10, 0), submittedAt: at(-doneDaysAgo - 44, 10, 0), approvedAt: at(-doneDaysAgo - 43, 10, 0),
      endsAt: at(-doneDaysAgo, 18, 0), completedAt: at(-doneDaysAgo, 18, 0), targetProfession: '', repeatRule: 'allow',
      city: type === 'in_person' || type === 'in_person_group' ? 'New York' : undefined,
    }, 100, 'telehealth', type === 'survey' ? TASKS.forms : type === 'diary' ? TASKS.sleepDiary : undefined)
    s.participations = fill(s, { rated: Math.floor(completed / 3), completed: completed - Math.floor(completed / 3) }, { doneFrom: -doneDaysAgo - 30, doneTo: -doneDaysAgo - 1 })
    settle(s, 4)
    return s
  }
  const archive = [
    archived('cp-1', 'Patient Trust in Telehealth', 'survey', 30, 30, 100),
    archived('cp-2', 'Mobile App Usability Testing', 'diary', 30, 25, 130),
    archived('cp-3', 'Healthcare OS review study', 'in_person', 35, 32, 160),
    archived('cp-4', 'Business Finance Operations Study', 'video_call', 60, 60, 190),
    archived('cp-5', 'Digital patient consulting experience analysis', 'in_person_group', 50, 40, 220),
  ]

  // -- Everyone else's studies, with Jonathan's part in each.

  const mapStatus: Record<CatalogueEntry['status'], ParticipationState | null> = {
    available: null, invited_to_apply: 'invited', applying: 'applying', draft: 'draft', applied: 'applied',
    invited_to_schedule: 'qualified', invited_to_complete: 'qualified', scheduled: 'scheduled', pin_confirmed: 'scheduled',
    in_process: 'completed', paid: 'completed', rejected: 'disqualified', no_show: 'no_show', late_show: 'completed', not_needed: 'completed',
  }
  const PAYOUT_STEPS = ['Awaiting payout', 'Payout processed by the team', 'Paid']

  const others = catalogue({ at, minsAgo, startedAgo, CLIENTS: CLIENT_KEYS }).map((e): Study => {
    const n = Number(e.id.replace(/\D/g, ''))
    const daysLeft = e.daysLeft ?? 6 + (n % 17)
    const timeline = e.timeline ?? []
    const ended = daysLeft === 0
    const doneEvent = timeline.filter((t) => !PAYOUT_STEPS.includes(t.label)).at(-1)?.at
    const endsAt = ended && doneEvent ? doneEvent : at(daysLeft, 18, 0)
    const doneDaysAgo = ended ? Math.round((t0 - new Date(endsAt).getTime()) / DAY) : 0
    const session = isSessionType(e.type)
    const state: Study['state'] = ended ? 'completed' : (e.status === 'scheduled' || e.status === 'pin_confirmed' || e.status === 'in_process') ? 'ongoing' : 'recruiting'
    const required = 8 + ((n * 5) % 25)
    const approvedAt = ended ? at(-doneDaysAgo - 30, 10, 0) : at(-(21 - Math.min(20, daysLeft)) - 9, 10, 0)
    const study = base({
      id: e.id, clientId: e.client ?? 'cl-rjp', title: e.title, description: e.description, type: e.type, state, industry: e.industry,
      durationMins: e.durationMins, image: e.image, required, endsAt, completedAt: ended ? endsAt : undefined,
      createdAt: plus(approvedAt, -2), submittedAt: plus(approvedAt, -1), approvedAt,
      targetProfession: e.targetProfession, premium: e.premium, city: e.city, audience: e.audience,
      repeatRule: e.repeatRule ?? (['allow', 'allow', 'exclude'] as const)[n % 3]!,
    }, e.reward, e.screenerSet, e.tasksSet ? TASKS[e.tasksSet] : undefined)
    study.linkCode = `HL-${String(n).padStart(3, '0')}-${['A', 'B', 'C', 'D'][n % 4]}`
    if (e.diary) study.diary = { totalDays: e.diary.totalDays, minDays: e.diary.minDays, unit: 'Day', frequency: 'Every day' }
    if (e.type === 'group_video_call' || e.type === 'in_person_group') study.sessions = sessionsFor(study, ended ? doneDaysAgo + 1 : 5, ended ? -doneDaysAgo : 4)
    if (e.saved) jonathan.savedStudyIds.push(e.id)

    const mine = mapStatus[e.status]
    if (mine) {
      const paidAt = timeline.find((t) => t.label === 'Paid')?.at
      const completedAt = mine === 'completed' ? (doneEvent ?? paidAt) : undefined
      const stars = e.clientReview?.stars as Stars | undefined
      study.participations.push({
        personId: DEMO_PERSON_ID, state: mine,
        prescreener: mine === 'invited' ? undefined : 'passed',
        booking: e.booking, diaryDays: e.diary?.completedDays.length ? e.diary.completedDays : undefined,
        code: session && (e.status === 'pin_confirmed' || mine === 'completed')
          ? { value: DEMO_SESSION_CODE, byParticipant: true, byClient: mine === 'completed' }
          : session && mine === 'scheduled' ? { value: DEMO_SESSION_CODE, byParticipant: false, byClient: false } : undefined,
        lateShow: e.status === 'late_show' || undefined, notNeeded: e.status === 'not_needed' || undefined,
        completedAt, paidAt,
        rating: e.clientReview && stars ? {
          stars, state: stars >= 5 ? 'excellent' : stars >= 4 ? 'good' : 'poor', comment: e.clientReview.comment,
          expertise: e.clientReview.expertise, reliability: e.clientReview.reliability, communication: e.clientReview.communication,
          at: paidAt ?? completedAt ?? endsAt,
        } : undefined,
        events: timeline,
      })
    }
    const size = Math.max(4, Math.round(required * 0.8))
    const k = n % 5
    study.participations.push(...(ended
      ? fill(study, { rated: Math.floor(size / 2), completed: size - Math.floor(size / 2) - 1, noShow: n % 3, disqualified: 2 + (n % 4) }, { doneFrom: -doneDaysAgo - 20, doneTo: -doneDaysAgo - 1, skip: [DEMO_PERSON_ID] })
      : fill(study, {
        rated: Math.floor((required * k) / 20), completed: Math.floor((required * k) / 20), scheduled: session ? 2 + (n % 3) : 0,
        qualified: 2, disqualified: 1 + (n % 3), applied: 3 + (n % 4), invited: 2, matched: 4,
      }, { doneFrom: -12, doneTo: -1, skip: [DEMO_PERSON_ID] })))
    if (ended) settle(study, 3)
    return study
  })

  // -- Waiting on the team, and two that underfilled.

  const inReview = [
    base({
      id: 'st-rv-1', clientId: 'cl-northwind', title: 'Assessment tooling feedback', type: 'survey', state: 'in_review', industry: 'Education', durationMins: 20,
      description: 'A short survey for teachers on the assessment tools they use and what they would change.', image: '/img/classroom.svg', required: 25,
      createdAt: at(-3, 10, 0), submittedAt: at(-2, 11, 45), endsAt: at(28, 18, 0), targetProfession: 'Teachers, Teaching Assistants',
    }, 60, 'education', TASKS.education),
    base({
      id: 'st-rv-2', clientId: 'cl-orbit', title: 'Booking flow interviews', type: 'video_call', state: 'in_review', industry: 'Travel', durationMins: 45,
      description: 'One to one calls on how people compare and book flights, and where they abandon the flow.', image: '/img/travel.svg', required: 15,
      createdAt: at(-5, 10, 0), submittedAt: at(-4, 9, 10), endsAt: at(26, 18, 0), targetProfession: 'Frequent flyers who book their own travel',
    }, 140, 'travel'),
    onboardingStudy,
  ]
  inReview[1]!.revisions = [{ text: 'Requested changes: the screener asks for age, which the profile already holds. Please remove question 2.', at: at(-3, 16, 0), by: 'tm-maya' }]

  const underfilled = (id: string, clientId: string, title: string, required: number, completed: number, doneDaysAgo: number, confirmedBy?: string): Study => {
    const s = base({
      id, clientId, title, type: 'survey', state: 'completed', industry: 'Finance', durationMins: 20, description: 'A short survey that closed before it filled.',
      image: '/img/house.svg', required, createdAt: at(-doneDaysAgo - 30, 10, 0), submittedAt: at(-doneDaysAgo - 29, 10, 0), approvedAt: at(-doneDaysAgo - 28, 10, 0),
      endsAt: at(-doneDaysAgo, 18, 0), completedAt: at(-doneDaysAgo, 18, 0), targetProfession: 'Home insurance policy holders', repeatRule: 'allow',
    }, 100, 'insurance', TASKS.forms)
    s.participations = fill(s, { rated: 2, completed: completed - 2, disqualified: 3 }, { doneFrom: -doneDaysAgo - 20, doneTo: -doneDaysAgo - 1 })
    const net = settle(s, null)
    if (confirmedBy && net < 0) s.payments.push(payment(s, 'refund', -net, at(-doneDaysAgo + 2, 11, 0), confirmedBy))
    return s
  }
  const refunds = [
    underfilled('st-uf-1', 'cl-harbor', 'Renewal letter readability', 30, 6, 4),
    underfilled('st-uf-2', 'cl-brightline', 'Budgeting habits survey', 25, 5, 9),
    underfilled('st-uf-3', 'cl-atlas', 'Commuter parking survey', 20, 4, 35, 'tm-michael'),
  ]

  /** The two finished studies the demo client still owes on stay unpaid, which is what the client app's Billing pill is. */
  settle(sleep, null)
  settle(travel, null)

  const studies = [goal, pay, sleep, fitness, travel, social, ...drafts, ...archive, ...others, ...inReview, ...refunds]

  // ---------------------------------------------------------------- reports

  const reports: Report[] = [
    { id: 'rp-1', personId: 'maya-j', reportedBy: DEMO_CLIENT_ID, reason: 'AI/Bot Activity', detail: 'Study answers were found AI-generated', studyId: 'st-social', at: at(-1, 10, 21) },
    { id: 'rp-2', personId: 'gen-14', reportedBy: 'cl-lumen', reason: 'Abusive Behaviour', detail: 'Used abusive language towards the moderator during the session', studyId: 'st-08', at: at(-2, 14, 0) },
    { id: 'rp-3', personId: 'gen-25', reportedBy: 'cl-lumen', reason: 'Spam Apply', detail: 'The same copied answers were given to every screener question', studyId: 'st-08', at: at(-2, 9, 30) },
    { id: 'rp-4', personId: 'gen-07', reportedBy: DEMO_CLIENT_ID, reason: 'Wrong Match', detail: 'Stated role does not match the answers given in the screener', studyId: 'st-pay', at: at(-4, 16, 15) },
    { id: 'rp-5', personId: 'gen-22', reportedBy: 'cl-procto', reason: 'Spam Apply', detail: 'Screener answers were pasted in from another study', studyId: 'st-29', at: at(-5, 9, 0), outcome: 'restricted', note: 'Restricted for 15 days as for the 1st time.', decidedAt: at(-3, 16, 0), decidedBy: 'tm-james' },
    { id: 'rp-6', personId: 'gen-21', reportedBy: 'cl-procto', reason: 'AI/Bot Activity', detail: 'Study answers were found AI-generated', studyId: 'st-29', at: at(-9, 10, 0), outcome: 'deactivated', note: 'Deactivated the account.', decidedAt: at(-6, 12, 0), decidedBy: 'tm-maya' },
    { id: 'rp-7', personId: 'gen-30', reportedBy: 'cl-meadow', reason: 'Wrong Match', detail: 'Reported as not a daily coffee drinker', studyId: 'st-25', at: at(-14, 10, 0), outcome: 'rejected', note: 'Screener answers support the stated habit; report rejected.', decidedAt: at(-12, 9, 30), decidedBy: 'tm-james' },
  ]

  // ---------------------------------------------------------------- support

  type M = [from: 'user' | 'team' | 'auto', text: string, atIso: string, by?: string]
  const ticket = (id: string, owner: Ticket['owner'], subject: string, topic: Ticket['topic'], status: Ticket['status'], messages: M[], studyTitle?: string, createdByTeam?: boolean): Ticket => ({
    id, owner, subject, message: messages[0]![1], studyTitle, topic, status, createdByTeam,
    createdAt: messages[0]![2], lastActivityAt: messages.at(-1)![2], closedAt: status === 'closed' ? messages.at(-1)![2] : undefined,
    messages: messages.map(([from, text, atIso, by], i) => ({ id: `m${i + 1}`, from, text, at: atIso, by })),
  })
  const me: Ticket['owner'] = { kind: 'participant', id: DEMO_PERSON_ID }
  const her: Ticket['owner'] = { kind: 'client', id: DEMO_CLIENT_ID }
  const tickets: Ticket[] = [
    ticket('FI-S562357', me, 'Incentive payment not received', 'money', 'open', [
      ['user', 'I completed the Commuting and EV charging call two weeks ago and the incentive has not reached my wallet yet.', at(-4, 9, 0)],
      ['auto', 'Payments are processed by the Focus Insite team once the study finishes. Your session on this study shows as completed, so your reward is on the payout list.', at(-4, 9, 1)],
      ['team', 'This has now been approved and should land in your wallet within 2 working days.', at(-2, 10, 15), 'tm-sophia'],
    ], 'Commuting and EV charging'),
    ticket('FI-S562401', me, 'Reschedule outside the app', 'general', 'open', [
      ['user', 'The moderator asked to move my Nurse staffing session by an hour. Can that be done without using one of my two reschedules?', at(-1, 15, 30)],
      ['auto', 'A reschedule requested by the client does not count against your two. A person on the team will confirm the new time with the moderator and update your booking.', at(-1, 15, 31)],
    ], 'Nurse staffing software review'),
    ticket('FI-S562388', me, 'Which ID types are accepted?', 'general', 'open', [
      ['user', 'My passport has expired. Can I verify with a state ID card instead?', at(-3, 11, 0)],
      ['auto', 'We accept a passport, a driving licence or a government voter ID card. A state ID card is fine as a government ID.', at(-3, 11, 1)],
      ['team', 'Following up: did the state ID upload go through for you? Let us know and we will close this.', at(-2, 9, 45), 'tm-sophia'],
    ]),
    ticket('FI-S562290', me, 'Withdrawal shows Processing for a week', 'money', 'closed', [
      ['user', 'My $250 withdrawal has said Processing since last Tuesday.', at(-118, 10, 0)],
      ['auto', 'Withdrawals reach your bank within 2-3 working days. Yours crossed a public holiday, which added a day.', at(-118, 10, 1)],
      ['team', 'Confirmed with the payments team: it was sent this morning and should show in your account today.', at(-116, 16, 20), 'tm-michael'],
      ['user', 'Received, thank you.', at(-116, 16, 40)],
    ]),
    ticket('FI-S561904', me, 'Cannot upload my ID document', 'general', 'closed', [
      ['user', 'The back side of my driving license fails to upload every time.', at(-21, 15, 0)],
      ['auto', 'Please try a .jpg or .png under 10MB. Let us know if it still fails.', at(-21, 15, 1)],
      ['user', 'That worked, thank you.', at(-19, 9, 45)],
    ]),
    ticket('FI-S561722', me, 'Referral points not credited', 'money', 'closed', [
      ['user', 'Dana Okafor finished her first study last week but I have not received the 200 points.', at(-42, 8, 30)],
      ['auto', 'Referral points are credited once the referred person’s first study is paid, not when it is completed. Dana’s payout was approved yesterday, so the points should be in your history now.', at(-42, 8, 31)],
      ['user', 'I see them now, thanks.', at(-41, 12, 0)],
    ]),
    ticket('FI-S562510', her, 'Study results not accessible', 'general', 'open', [
      ['user', 'We are currently experiencing issues retrieving the study results. Study: Healthcare OS review study. Let me know asap.', at(-2, 16, 26)],
      ['auto', 'Hey Jennifer thanks for reaching out! Could you please describe what exactly are you seeing on your side while accessing the results of your “Healthcare OS review study”? Or you can share screenshot of that exact results tab.', at(-2, 16, 27)],
      ['user', 'Sure! I’ll be sending that today.', at(-2, 16, 40)],
      ['team', 'Hi Jennifer, thanks for the screenshot. All the results are restored and available under the Results tab again.', at(-1, 11, 5), 'tm-sophia'],
    ], 'Healthcare OS review study'),
    ticket('FI-S562358', her, 'Invoice shows the wrong participant count', 'money', 'closed', [
      ['user', 'The invoice for Mobile App Usability Testing bills 30 participants but only 25 completed.', at(-128, 10, 0)],
      ['auto', 'Invoices are built from the people who actually completed. We are checking this one against the study record.', at(-128, 10, 1)],
      ['team', 'You were right. The invoice has been reissued for 25 participants.', at(-127, 14, 20), 'tm-michael'],
    ], 'Mobile App Usability Testing'),
    ticket('FI-S562359', her, 'Can a paused study keep its matched list?', 'general', 'closed', [
      ['user', 'If I pause recruiting on a study, do the people already matched stay on the list?', at(-60, 9, 30)],
      ['auto', 'Yes. Pausing stops new invitations and applications; everyone already matched, invited or recruited stays where they are.', at(-60, 9, 31)],
      ['user', 'Perfect, thanks.', at(-60, 10, 0)],
    ]),
    ticket('FI-S562611', { kind: 'participant', id: 'sarah-j' }, 'Session link did not open', 'general', 'open', [
      ['user', 'The Join Call button for my Fitness tracker group session opens a blank page.', minsAgo(95)],
      ['auto', 'Session links open ten minutes before the start time. If yours is within that window, try a different browser while we look into it.', minsAgo(94)],
    ], 'Fitness tracker apps experience'),
    ticket('FI-S562612', { kind: 'client', id: 'cl-lumen' }, 'Refund for an underfilled study', 'money', 'open', [
      ['user', 'Our remote monitoring panel closed two people short. When is the unused incentive returned?', at(-1, 13, 10)],
      ['auto', 'Unused incentive on an underfilled study is refunded once the team confirms the shortfall, usually within 5-7 working days.', at(-1, 13, 11)],
    ], 'Remote monitoring, clinician panel'),
    ticket('FI-S562455', { kind: 'participant', id: 'samuel-l' }, 'Identity verification: a clearer passport photo is needed', 'general', 'open', [
      ['team', 'Hi Samuel, the passport photo you uploaded could not be matched with the records. Could you upload a clearer photo of the photo page?', at(-1, 12, 0), 'tm-maya'],
      ['user', 'Uploading a new one this evening.', at(-1, 18, 30)],
    ], undefined, true),
  ]

  // ------------------------------------------------------------------- team

  const member = (id: string, name: string, role: string, access: TeamMember['access'], active = true): TeamMember =>
    ({ id, name, role, email: `${name.toLowerCase().replace(' ', '.')}@humanlayer.com`, photo: avatarFor(id), access, active, password: DEMO_TEAM_PASSWORD })
  const team: TeamMember[] = [
    { id: MASTER_ADMIN_ID, name: 'Peter Devian', role: 'Master Admin', email: DEMO_ADMIN_EMAIL, photo: avatarFor(MASTER_ADMIN_ID), master: true, active: true, password: DEMO_TEAM_PASSWORD,
      access: ['Dashboard', 'Studies', 'Participants', 'Clients', 'Support', 'Finance', 'Pricing & Rewards', 'Sub-Admin'] },
    member('tm-maya', 'Maya Thompson', 'Studies Manager', ['Studies', 'Participants']),
    member('tm-robert', 'Robert Mayfield', 'Community Manager', ['Dashboard', 'Clients', 'Participants'], false),
    member('tm-michael', 'Michael Chen', 'Finance Manager', ['Finance']),
    member('tm-sophia', 'Sophia Garcia', 'Support Executive', ['Studies', 'Participants', 'Clients', 'Support']),
    member('tm-emily', 'Emily Davis', 'System Admin', ['Sub-Admin', 'Dashboard']),
    member('tm-james', 'James Wilson', 'Community Manager', ['Dashboard', 'Studies', 'Participants']),
  ]

  /** What the team has already done in this seed. Each line is an action the lists above record the result of. */
  const nm = (id: string) => byId.get(id)?.name ?? id
  const activity: Activity[] = ([
    ['Confirmed a refund for Commuter parking survey', 'Finance / Refunds / Confirm', at(-33, 11, 0), 'tm-michael'],
    ['Rejected business verification of Brix Labs', 'Clients / Verifications / Reject', at(-30, 12, 0), 'tm-robert'],
    [`Verified profession of ${nm('gen-11')}`, 'Participants / Verifications / Verify', at(-27, 15, 0), 'tm-maya'],
    ['Verified business of Quill Media', 'Clients / Verifications / Verify', at(-23, 11, 0), 'tm-robert'],
    [`Rejected identity verification of ${nm('gen-17')}`, 'Participants / Verifications / Reject', at(-16, 10, 30), 'tm-james'],
    [`Rejected a report on ${nm('gen-30')}`, 'Participants / Reported / Reject', at(-12, 9, 30), 'tm-james'],
    [`Deactivated the account of ${nm('gen-33')}`, 'Participants / Profile / Deactivate', at(-11, 12, 0), 'tm-james'],
    [`Verified identity of ${nm('gen-03')}`, 'Participants / Verifications / Verify', at(-10, 14, 5), 'tm-maya'],
    [`Deactivated the account of ${nm('gen-21')}`, 'Participants / Reported / Deactivate', at(-6, 12, 0), 'tm-maya'],
    ['Requested changes on Booking flow interviews', 'Studies / Review / Request Changes', at(-3, 16, 0), 'tm-maya'],
    [`Restricted the account of ${nm('gen-22')}`, 'Participants / Reported / Restrict', at(-3, 16, 0), 'tm-james'],
    ['Replied to ticket #FI-S562510', 'Support / Tickets / Reply', at(-1, 11, 5), 'tm-sophia'],
    ['Created ticket #FI-S562455 for Samuel Lee', 'Support / Tickets / Create', at(-1, 12, 0), 'tm-maya'],
  ] as [string, string, string, string][]).map(([what, path, when, by], i) => ({ id: `ac-${i + 1}`, what, path, at: when, by }))
    .sort((a, b) => b.at.localeCompare(a.at))

  /**
   * The demo's finished surveys and diaries carry answers, as a real one would
   * (a participation is its answers). They are picked from each question's own
   * options, or from a few plain sentences, the same way every time.
   */
  const SAID = ['It did what I needed without much effort.', 'I would use it again, with a few changes.', 'The first step took longer than I expected.', 'Clear enough once I had done it twice.']
  const answersFor = (study: Study, k: number): Answers => Object.fromEntries((study.tasks ?? []).map((q, i): [string, Answers[string]] => {
    if (q.kind === 'single' || q.kind === 'scale') return [q.id, q.options[(i + k) % q.options.length]!]
    if (q.kind === 'multi') return [q.id, q.options.filter((_, n) => (n + k) % 2 === 0).slice(0, 2)]
    if (q.kind === 'image') return [q.id, 'photo.jpg']
    return [q.id, q.format === 'number' ? 1 + ((i + k) % 5) : SAID[(i + k) % SAID.length]!]
  }))
  for (const study of studies) {
    if (!study.tasks?.length) continue
    study.participations.forEach((part, k) => {
      if (study.type === 'survey' && part.state === 'completed') part.taskAnswers = answersFor(study, k)
      if (study.type === 'diary' && part.diaryDays?.length) part.diaryAnswers = Object.fromEntries(part.diaryDays.map((d) => [String(d), answersFor(study, k + d)]))
    })
  }

  // Finance > Payouts (console 2317:159697): a few participants have asked to withdraw what they earned; one was released last week.
  const withdraw = (personId: string, id: string, amount: number, daysAgo: number, bank: string, account: string, type: 'Savings' | 'Checking', paid?: boolean) => {
    const p = people.find((x) => x.id === personId)
    if (!p) return
    p.payoutMethods.push({ id: `pm-${id}`, bankName: bank, accountNumber: account, routingCode: '021000021', type, isDefault: p.payoutMethods.length === 0 })
    p.payouts.unshift({ id, at: at(-daysAgo, 11, 0), amount, destination: `****${account.replace(/\s/g, '').slice(-4)}`, txId: `#2356${id.replace(/\D/g, '').padStart(4, '0')}`, status: paid ? 'paid' : 'pending', fee: FEES.WITHDRAWAL, expectedBy: withdrawalExpectedBy(at(-daysAgo, 11, 0)), ...(paid ? { releasedAt: at(-daysAgo + 2, 15, 0), releasedBy: 'tm-maya' } : {}) })
  }
  withdraw('gen-13', 'po-g13', 60, 4, 'American Bank', '1234 5678 9012 1234', 'Savings')
  withdraw('gen-16', 'po-g16', 80, 3, 'Chase Bank', '4410 2290 7788 3301', 'Checking')
  withdraw('gen-18', 'po-g18', 50, 2, 'Wells Fargo', '6012 4455 1290 5528', 'Savings')
  withdraw('gen-07', 'po-g07', 90, 9, 'Bank of America', '3300 1122 8890 4417', 'Checking', true)

  // Reported Studies (console 2314:146859): respondents report live studies; one round on the survey study was resolved before.
  const sr = (id: string, studyId: string, personId: string, reason: string, detail: string, when: string, resolution?: StudyReport['resolution']): StudyReport =>
    ({ id, studyId, personId, reason, detail, at: when, ...(resolution ? { resolution } : {}) })
  const settled = { id: 'rs-1', at: at(-6, 9, 30), by: 'tm-maya', statement: 'We have talked with the client and guided about the fair practice and can ensure the same for the future activities.' }
  const studyReports: StudyReport[] = [
    sr('sr-1', 'st-social', 'gen-13', 'Client is offering payment outside', 'The screener asks to be paid through another app for a bonus.', at(-1, 17, 35)),
    sr('sr-2', 'st-social', 'gen-14', 'Client is offering payment outside', 'Asked to message them outside the platform for extra payment.', at(-1, 14, 45)),
    sr('sr-3', 'st-social', 'gen-15', 'Study seems illegal or unethical', 'Asks for login details of a social account.', at(-1, 9, 30)),
    sr('sr-4', 'st-goal', 'gen-16', 'Study is unclear or incomplete', 'The description does not say what the call will cover.', at(-2, 11, 0)),
    sr('sr-5', 'st-goal', 'gen-18', 'Study is unclear or incomplete', 'No questions match the title.', at(-2, 16, 10)),
    sr('sr-6', 'st-fitness', 'gen-07', 'Study contains contact information', 'A phone number is written in the study description.', at(-3, 10, 15)),
    sr('sr-7', 'st-social', 'gen-07', 'Client is offering payment outside', 'Offered a gift card for answering outside the study.', at(-8, 10, 0), settled),
    sr('sr-8', 'st-social', 'gen-11', 'Client is misrepresenting their identity', 'The company name does not match the website.', at(-7, 11, 15), settled),
  ]
  // Billing (22 Oct 2026): a finished study whose bill is still open has stopped recruiting but is not completed.
  for (const st of studies) {
    if (st.state === 'completed' && billing(st).outstanding > 0) { st.state = 'billing'; st.stoppedAt = st.completedAt; st.stoppedBy = 'client'; st.completedAt = undefined }
  }
  /**
   * Interview notes (23 Oct 2026): demo data only, on the seeded in-person studies, so the demo's finished
   * interviews read as written. A study made after sign-up starts with no notes; the client and the team
   * write them on the booking or the group session (shared/store.ts setSessionNotes).
   */
  const DEMO_NOTES = [
    ['Interview Notes', 'Wakes twice most nights; blames the phone by the bed.', '• Tried a sleep app for two weeks, stopped when it asked to pay.', '• Would share sleep data with a doctor, not with an insurer.'],
    ['Interview Notes', 'Tracks bedtime in a paper diary, not an app.', '• Caffeine after 4 PM is the main thing they would change.', '• Wants a weekly summary, not a daily score.'],
    ['Interview Notes', 'Shift worker; sleep moves with the rota.', '• Blackout blinds made the biggest difference.', '• Finds wearables uncomfortable at night.'],
  ].map((lines) => lines.join('\n'))
  for (const st of studies) {
    if (st.type === 'in_person') {
      st.participations.filter((x) => x.state === 'completed' && x.booking).forEach((x, i) => { x.notes = DEMO_NOTES[i % DEMO_NOTES.length] })
    }
    if (st.type === 'in_person_group') {
      for (const [i, session] of (st.sessions ?? []).entries()) {
        if (st.participations.some((x) => x.booking?.sessionId === session.id && x.state === 'completed')) {
          session.notes = `Interview Notes
Group ${i + 1}: most book travel on a phone, but pay on a laptop.
• Price alerts are the feature everyone uses.
• Two people had been charged twice by a booking site; trust came up often.`
        }
      }
    }
  }
  // The audience pills Manage and Review read back are the study's own criteria (D38), not a sample list.
  for (const study of studies) if (!study.form && study.setup) study.setup = { ...study.setup, audience: audiencePills(study.audience, study.required) }
  /** The rate card's first version: the team's July 2026 sheet, read from its files the way an upload is (24 Oct 2026). */
  const rateCardLog: SettingsChange[] = [{ id: 'set-rate-card-july', group: 'rateCard', at: at(-100, 10, 0), by: MASTER_ADMIN_ID, before: EMPTY_RATE_CARD, after: rateCard, source: RATE_CARD_SOURCE }]
  /** One group of the demo client's studies (Studies - with groups, 23 Oct 2026); the rest are under Others. */
  const studyGroups: StudyGroup[] = [{ id: 'grp-digital', clientId: DEMO_CLIENT_ID, name: 'My Digital Studies Group', studyIds: ['st-social', 'st-goal'], createdAt: at(-5, 11, 0) }]
  const state: PlatformState = { version: SEED_VERSION, seededAt: now.toISOString(), people, clients, studies, reports, tickets, team, activity, pending: [], teamNotices: [], studyReports, studyGroups, settingsLog: rateCardLog }
  /**
   * Certificates issued at verification (policy section 7), each ID generated
   * once and never reused. A fixed sequence stands in for Math.random so the
   * demo is the same every time it is reset.
   */
  let n = 0x9e3779b9
  const draw = () => { n = (Math.imul(n ^ (n >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; return n / 4_294_967_296 }
  for (const person of people) if (person.identity.state === 'verified') person.certificateId = freshCertificateId(state, 'participant', draw)
  for (const client of clients) if (client.business.state === 'verified') client.certificateId = freshCertificateId(state, 'business', draw)

  /**
   * Each person's record from before the seed (`prior`) was written to give
   * the score the frames drew for them. The studies above then add completed,
   * rated participations on top, which on their own would push most of the
   * pool to 100. So the prior record is rewritten here to leave room for what
   * the seed added: the score is still computed by the policy from the
   * stored inputs, and it lands on the intended number.
   */
  for (const person of pool) {
    const target = targetScore(person.id)
    if (target === undefined) continue
    person.prior = { completedThisYear: 0, stars: [] }
    const seeded = trustInputs(state, person.id, now)
    const studies = Math.max(0, Math.min(TRUST.STUDY_COMPLETION_CAP_PER_YEAR, 8) - seeded.completedThisYear)
    const completions = Math.min(TRUST.STUDY_COMPLETION_CAP_PER_YEAR, seeded.completedThisYear + studies) * TRUST.STUDY_COMPLETION
    const deductions = seeded.noShows * TRUST.NO_SHOW + seeded.lateShows * TRUST.LATE_SHOW_UP + seeded.cancelledSessions * TRUST.CANCELLED_SESSION + seeded.frauds * TRUST.FRAUD
    const recent = seeded.stars.slice(-TRUST.RATINGS_WINDOW)
    const room = TRUST.RATINGS_WINDOW - recent.length
    const need = target - TRUST.ONBOARDING - completions - deductions - recent.reduce((n, x) => n + trustForStars(x), 0)
    person.prior = { completedThisYear: studies, stars: starsSumming(need, room) }
  }

  return state
}
