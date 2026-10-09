import type { StudyType } from '../components/app/StudyTypeTag'

/**
 * Clients as drawn: the list (Active 2049:118695, Deactivated 2049:118738),
 * the profile (About 2051:129453, deactivated 2051:137137, Studies
 * 2051:132253 / 2051:134144, Payments 2051:135099), the invoice panels
 * (2051:130623 paid, 2051:130751 to pay) and client verifications (section
 * 2051:143182, mislabelled "Participants - Verifications").
 */
export interface Client { id: string; photo: string; name: string; role: string; company: string; industry: string; location: string; date: string }
const c = (n: number, name: string, role: string, company: string, industry: string, location: string, date: string): Client => ({ id: `c-${n}`, photo: `/img/clients/c${n}.png`, name, role, company, industry, location, date })
export const CLIENTS: Client[] = [
  c(1, 'Jennifer Lee', 'UX Researcher', 'SoulfulLabs', 'IT', 'San Francisco, USA', 'Oct 1, 2026'),
  c(2, 'Robert Mayfield', 'UX Researcher', 'Google', 'Consultancy', 'Miami, USA', 'Today'),
  c(3, 'Jenny Vance', 'Hearth Researcher', 'Microsoft', 'Healthcare', 'Miami, USA', 'Oct 4, 2026'),
  c(4, 'Angela Patel', 'Project Manager', 'Amazon', 'Marketing', 'New York, USA', 'Oct 3, 2026'),
  c(5, 'Michael Chen', 'Data Analyst', 'Linear', 'Finance', 'Los Angeles, USA', 'Sep 30, 2026'),
  c(6, 'Sophia Garcia', 'Product Designer', 'BenQ', 'IT', 'Austin, USA', 'Sep 28, 2026'),
  c(7, 'David Johnson', 'Sales Lead', 'HP', 'Retail', 'Chicago, USA', 'Oct 2, 2026'),
  c(8, 'Emily Davis', 'Content Head', 'Dell', 'Media', 'Seattle, USA', 'Oct 4, 2026'),
  c(9, 'James Wilson', 'Network Administrator', 'Apple', 'IT', 'Boston, USA', 'Oct 2, 2026'),
  c(10, 'Linda Thompson', 'HR Specialist', 'JP Morgan', 'Consultancy', 'Denver, USA', 'Oct 1, 2026'),
]

export const ACCOUNT = [['Work Email', 'jenniferlee@soulfullabs.ai'], ['Role', 'UX Researcher'], ['Company Name', 'SoulfulLabs'], ['VAT (Tax) Number', 'EAS56893231459'],
  ['Company Website', 'https://www.soulfullabs.ai'], ['Industry', 'IT & Consultation'], ['Location', 'NYC, New York, USA']]

/** Reviews on the client's About tab: what participants said of the client, and under each what the client said "To participant". */
export const CLIENT_REVIEWS = [
  { study: 'Digital patient consulting experience analysis', stars: 4, score: '4.0', text: 'It was great working with Luke. He was clear about the requirements, responsive throughout the project, and very easy to communicate with.', to: 'Eliza D', back: 5, backScore: '5.0', reply: 'The collaboration went smoothly, and I’d be happy to work again.' },
  { study: 'Mobile app design review', stars: 5, score: '5', text: 'Working with Sarah was a pleasure.', to: 'John M', back: 4.5, backScore: '4.5', reply: '' },
  { study: 'E-commerce website optimization', stars: 5, score: '5', text: 'John was fantastic to work with. He understood the project goals from the start and delivered exceptional results that exceeded our expectations. I’d definitely recommend him to others!', to: 'Mark J', back: 5, backScore: '5.0', reply: '' },
  { study: 'Social media marketing campaign', stars: 5, score: '5', text: '', to: 'Henry L', back: 5, backScore: '5.0', reply: '' },
  { study: 'Social media marketing campaign', stars: 5, score: '5', text: 'Collaborating with Mia was delightful. She was proactive in her approach, and her insights into market trends helped shape a successful campaign. I look forward to partnering with her again!', to: 'Henry L', back: 5, backScore: '5.0', reply: 'Mia’s strategic thinking was crucial for achieving the goals.' },
]

export interface ClientStudy { id: string; name: string; thumb: string; type: StudyType | string; billed: string; required: string; completed: string; date: string }
const t = (n: string) => `/img/studies/${n}-40.png`
const s = (id: string, name: string, thumb: string, type: StudyType | string, billed: string, required: string, completed: string, date: string): ClientStudy => ({ id, name, thumb: t(thumb), type, billed, required, completed, date })
export const CLIENT_STUDIES: ClientStudy[] = [
  s('st-goal', 'About goal-tracking methods', 'goal-tracking', 'video', '$15,085', '40', '37', '30 Jul, 2026'),
  s('st-pay', 'How Do You Make Your Digital Payments Mostly?', 'digital-payments', 'diary', '$10,085', '56', '32', '25 Jul, 2026'),
  s('st-sleep', 'Share About Your Sleep Cycle', 'sleep-cycle', 'in-person', '$17,085', '76', '57', '15 Jul, 2026'),
  s('st-fitness', 'Fitness Tracker Apps Experience', 'fitness-tracker', 'video-group', '$12,085', '90', '68', '20 Jul, 2026'),
  s('st-travel', 'Travel preferences and experiences', 'travel-preferences', 'in-person-group', '$20,698', '92', '88', '10 Jul, 2026'),
  s('st-social', 'Social media posts designing apps', 'social-media', 'survey', '$24,684', '94', '56', '10 Jul, 2026'),
]
/** The Completed sub-tab adds four more, with study types the rest of the file never uses. */
export const CLIENT_STUDIES_MORE: ClientStudy[] = [
  s('x1', 'E-commerce website UI kits', 'social-media', 'Focus Group', '$32,150', '88', '48', '15 Aug, 2026'),
  s('x2', 'Mobile app prototypes for health', 'social-media', 'Interview', '$18,900', '75', '50', '22 Sep, 2026'),
  s('x3', 'Brand identity design packages', 'social-media', 'Poll', '$27,500', '92', '53', '30 Oct, 2026'),
  s('x4', 'Interactive dashboard designs', 'social-media', 'Case Study', '$45,230', '97', '60', '05 Nov, 2026'),
]

export const PENDING_INVOICES = ['$2,750', '$3,896', '$1,244', '$1,750', '$750']
export const COMPLETED_INVOICES = ['$10,750', '$14,851', '$10,896', '$24,833', '$16,740']

const M = '/img/verifications/m.png'
const F = '/img/verifications/f.png'
const VAT = 'VAT number for business registration could not be found'
const BOTH = 'Website and VAT number for business registration could not be found'
export interface ClientCheck { id: string; photo: string; name: string; role: string; date: string; reason: string; result?: string }
const v = (n: number, name: string, role: string, reason: string, photo = M): ClientCheck => ({ id: `cv-${n}`, photo, name, role, date: `Oct ${n}, 2026`, reason })
export const CLIENT_PENDING: ClientCheck[] = [
  v(1, 'Jennifer Lee', 'UX Researcher', VAT, '/img/clients/c1.png'), v(3, 'James Smith', 'DevOps Engineer', BOTH), v(4, 'Emily Davis', 'Data Analyst', VAT),
  v(2, 'Maya Johnson', 'Physician', VAT, F), v(5, 'Michael Brown', 'Lead Nurse', VAT), v(6, 'Sophia Wilson', 'Lawyer', BOTH), v(7, 'Daniel Garcia', 'DevOps Engineer', BOTH),
  v(8, 'Olivia Martinez', 'General Surgeon', VAT), v(9, 'Lucas Rodriguez', 'Business Analyst', VAT), v(10, 'Ava Hernandez', 'Content Writer', BOTH),
]
export const CLIENT_HISTORY: ClientCheck[] = [
  v(1, 'Jennifer Lee', 'UX Researcher', VAT, '/img/clients/c1.png'), v(2, 'Maya Johnson', 'Physician', 'Could not verify the business, hence deactivated.', F), v(3, 'James Smith', 'UI/UX Designer', BOTH),
  v(4, 'Emily Davis', 'Data Analyst', VAT), v(5, 'Michael Brown', 'Lead Nurse', VAT), v(6, 'Sophia Wilson', 'Lawyer', BOTH), v(7, 'Daniel Garcia', 'DevOps Engineer', VAT),
  v(8, 'Olivia Martinez', 'General Surgeon', VAT), v(9, 'Lucas Rodriguez', 'Business Analyst', VAT), v(10, 'Ava Hernandez', 'Content Writer', BOTH),
].map((r, i) => ({ ...r, id: `${r.id}h`, result: i === 1 ? 'Rejected' : 'Verified' }))
