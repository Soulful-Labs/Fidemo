import type { StudyType } from '../components/app/StudyTypeTag'
import type { Tier } from '../components/app/TierTag'

/**
 * All Participants as drawn (Active 1992:101341, Deactivated 2003:134529).
 * Both tabs draw the same ten people and the same dates; only the count line
 * and the last column's heading change.
 */
export interface Participant { id: string; photo: string; name: string; role: string; industry: string; score: string; tier: Tier; gender: string; location: string; date: string }

const row = (n: number, name: string, role: string, industry: string, score: string, tier: Tier, gender: string, location: string, date: string): Participant =>
  ({ id: `p-${n}`, photo: `/img/participants/p${n}.png`, name, role, industry, score, tier, gender, location, date })

export const PARTICIPANTS: Participant[] = [
  row(1, 'Samuel Lee', 'Software Engineer', 'IT', '90', 'Platinum', 'Male', 'San Francisco, USA', 'Oct 1, 2026'),
  row(2, 'Robert Mayfield', 'Assistant Accountant', 'Consultancy', '78', 'Gold', 'Male', 'Miami, USA', 'Today'),
  row(3, 'Jenny Vance', 'Physician, Therapist', 'Healthcare', '65', 'Silver', 'Female', 'Miami, USA', 'Oct 4, 2026'),
  row(4, 'Angela Patel', 'Project Manager', 'Marketing', '75', 'Gold', 'Female', 'New York, USA', 'Oct 3, 2026'),
  row(5, 'Michael Chen', 'Data Analyst', 'Finance', '85', 'Gold', 'Male', 'Los Angeles, USA', 'Sep 30, 2026'),
  row(6, 'Sophia Garcia', 'UX Designer', 'IT', '98', 'Platinum', 'Female', 'Austin, USA', 'Sep 28, 2026'),
  row(7, 'David Johnson', 'Sales Executive', 'Retail', '95', 'Platinum', 'Male', 'Chicago, USA', 'Oct 2, 2026'),
  row(8, 'Emily Davis', 'Content Writer', 'Media', '60', 'Silver', 'Female', 'Seattle, USA', 'Oct 4, 2026'),
  row(9, 'James Wilson', 'Network Administrator', 'IT', '88', 'Gold', 'Male', 'Boston, USA', 'Oct 2, 2026'),
  row(10, 'Linda Thompson', 'HR Specialist', 'Consultancy', '67', 'Silver', 'Female', 'Denver, USA', 'Oct 1, 2026'),
]

export const COUNTS = { active: '126,872 active participants', deactivated: '10,572 deactivated participants' }

/** The four dropdowns' menus, drawn loose on the section canvas (2003:133961, 2003:134036, 2003:134101, 2003:134356). */
export const FILTERS = {
  lastActive: ['Last Active: All', 'Today', 'Last 7 days', 'This Month', 'Last 30 days', 'Last 3 months'],
  profession: ['Profession verified', 'All', 'Profession Verified'],
  gender: ['Gender: All', 'Male', 'Female', 'Other'],
  tier: ['Tier: All', 'Platinum (90+ score)', 'Gold (70 to 90 score)', 'Silver (up to 70 score)'],
}

/** Advanced Filters (2003:133781): four fields, each with the values drawn as chips. */
export const ADVANCED = [
  { label: 'Roles', placeholder: 'Select roles', chips: ['Physician'] },
  { label: 'Domain', placeholder: 'Select domains', chips: ['Healthcare', 'Pharma', 'Fitness & Nutrition'] },
  { label: 'Location', placeholder: 'Select city, country', chips: ['New York, US'] },
  { label: 'Language', placeholder: 'Select languages', chips: ['English'] },
]

/** Reviews of Samuel Lee (1992:103368). The names inside the reviews are not his, as drawn. */
export const REVIEWS = [
  { study: 'Digital patient consulting experience analysis', stars: 4, score: '4.0', date: 'April 10, 2026', text: 'It was great working with Luke. He was clear about the requirements, responsive throughout the project, and very easy to communicate with. The collaboration went smoothly, and I’d be happy to work with him again on future projects. Thanks!', client: 'Google Labs', back: 5, backScore: '5.0', reply: 'The collaboration went smoothly, and I’d be happy to work with him again.' },
  { study: 'Mobile app design review', stars: 5, score: '5', date: 'April 10, 2026', text: 'Working with Sarah was a pleasure. She brought innovative ideas to the table and was open to feedback, making the design process very collaborative. I’m looking forward to our next project together!', client: 'Tech Innovations', back: 4.5, backScore: '4.5', reply: 'Her creativity and willingness to adapt to changes were impressive.' },
  { study: 'E-commerce website optimization', stars: 5, score: '5', date: 'April 10, 2026', text: 'John was fantastic to work with. He understood the project goals from the start and delivered exceptional results that exceeded our expectations. I’d definitely recommend him to others!', client: 'Retail Solutions', back: 5, backScore: '5.0', reply: 'His expertise in user experience made a real difference.' },
  { study: 'Social media marketing campaign', stars: 5, score: '5', date: 'April 10, 2026', text: 'Collaborating with Mia was delightful. She was proactive in her approach, and her insights into market trends helped shape a successful campaign. I look forward to partnering with her again!', client: 'Marketing Gurus', back: 4.5, backScore: '4.5', reply: 'Mia’s strategic thinking was crucial for the campaign.' },
]

/** Invite To Study (1992:103508): three active studies; every one is tagged Healthcare. */
export const INVITE_STUDIES: { id: string; title: string; type: StudyType; thumb: string }[] = [
  { id: 'st-goal', title: 'About goal-tracking methods', type: 'video', thumb: '/img/participants/study1.png' },
  { id: 'st-sleep', title: 'Share about your sleep cycle', type: 'in-person', thumb: '/img/participants/study2.png' },
  { id: 'st-pay', title: 'How do you make your digital payments mostly?', type: 'diary', thumb: '/img/participants/study3.png' },
]
