import type { StudyType } from '../components/app/StudyTypeTag'

/**
 * A managed study as its own Manage section draws it (Overview and Manage
 * Study frames). Each of the six type sections draws a different study, and
 * each is one of the six rows on the Studies list, so the list row opens its
 * own section. Every string is as drawn, slips included: three Manage Study
 * frames carry another study's title or description in the About card.
 */
export interface ManagedStudy {
  id: string
  type: StudyType
  title: string
  image: string
  thumbnail: string
  time: string
  industry: string
  description: string
  /** The Overview tiles' Qualified figure (the survey frame draws 1000 /1200 against 35 /60 in the header). */
  tileQualified: [string, string]
  /** The About card on Manage Study. */
  about: { title: string; description: string; time: string }
  roles: string
  /** The Study card's summary pill. */
  summary: [string, string]
  /** The tabs whose frames draw the "Congrats!" banner: video 1:1 on Overview and Manage Study, survey on Recruited. */
  congrats?: string[]
  /** Every video 1:1 frame sits 16 inside the shell; the rest 24. */
  tight?: boolean
  /** The diary section's options menu shows two more items. */
  fullMenu?: boolean
}

const GOALS = 'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.'
const FITNESS = 'Share your experience of using any fitness apps for tracking your weight, steps, diet, etc. and improving them.'
const DOCTORS = 'Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner'
const SESSIONS = 'Available 5 days a week, custom timings, 2 days overrides'
const img = (id: string) => ({ image: `/img/manage/${id}.png`, thumbnail: `/img/manage/${id}-thumb.png` })

export const MANAGED: ManagedStudy[] = [
  { id: 'st-social', type: 'survey', title: 'Social media posts designing apps', ...img('st-social'), time: '30 minutes', industry: 'Consumer',
    description: 'How do you design social media posts and what tools do you use for it', tileQualified: ['1000', '/1200 applied'],
    about: { title: 'Business Finance Operations Study', description: GOALS, time: '30 minutes' },
    roles: 'Social Media Influencer, Creator, Digital Marketer, Graphic Designer', summary: ['Survey Form:', '10 inputs'], congrats: ['recruited'] },
  { id: 'st-fitness', type: 'video-group', title: 'Fitness tracker apps experience', ...img('st-fitness'), time: '1 hour', industry: 'Healthcare',
    description: FITNESS, tileQualified: ['35', '/60 applied'],
    about: { title: 'Fitness tracker apps experience', description: FITNESS, time: '1 hour' },
    roles: DOCTORS, summary: ['Group Video Call:', SESSIONS] },
  { id: 'st-goal', type: 'video', title: 'About goal-tracking methods', ...img('st-goal'), time: '1 hour', industry: 'Business',
    description: GOALS, tileQualified: ['35', '/60 applied'],
    about: { title: 'Business Finance Operations Study', description: GOALS, time: '30 minutes' },
    roles: DOCTORS, summary: ['Video Call (Individual):', SESSIONS], congrats: ['overview', 'manage'], tight: true },
  { id: 'st-pay', type: 'diary', title: 'How do you make your digital payments mostly?', ...img('st-pay'), time: '1 hour', industry: 'Finance',
    description: 'Share about your ways of digital spending and payment methods you use in your daily life.', tileQualified: ['35', '/60 applied'],
    about: { title: 'How do you make your digital payments mostly?', description: 'Share about your ways of digital spending and payment methods you use in your daily life.', time: '1 hour' },
    roles: DOCTORS, summary: ['Diary Study Form:', '5 questions, 5 days logs'], fullMenu: true },
  { id: 'st-sleep', type: 'in-person', title: 'Share about your sleep cycle', ...img('st-sleep'), time: '1 hour', industry: 'Healthcare',
    description: 'How are you experiencing your sleep cycle and what helps you having deep sleep.', tileQualified: ['35', '/60 applied'],
    about: { title: 'Fitness tracker apps experience', description: FITNESS, time: '1 hour' },
    roles: DOCTORS, summary: ['In-Person:', '2 addresses, available 5 days/week, custom timings, 2 days overrides'] },
  { id: 'st-travel', type: 'in-person-group', title: 'Travel preferences and experiences', ...img('st-travel'), time: '1 hour', industry: 'Travel',
    description: 'Let us know about your travel choices and your experiences that you have or would like to get.', tileQualified: ['35', '/60 applied'],
    about: { title: 'Travel preferences and experiences', description: 'Let us know about your travel choices and your experiences that you have or would like to get.', time: '1 hour' },
    roles: DOCTORS, summary: ['In-Person Group:', '2 sessions, 10 seats per sessions, 1 address'] },
]

/** The figures every header and Overview draws, whatever the study. */
export const FIGURES = {
  status: 'Recruiting',
  completed: ['20', '/30'], qualified: ['35', '/60 applied'], daysRemaining: '36', progress: '66%',
  shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
  activeSince: 'July 10, 2026, 02:30 PM',
  estimatedAudience: '1K', screening: '8 inputs', incentive: '$700',
}

export const MANAGE_CLIENT = {
  name: 'Jennifer Lee', role: 'Product Manager', email: 'jenniferlee@soulfullabs.ai', avatar: '/img/review/jennifer-lee.png',
  rows: [['Company', 'SoulfulLabs'], ['Website', 'www.soulfullabs.ai'], ['Industry', 'IT & Consultation'], ['Location', 'NYC, New York, USA']],
}

/** The audience pills on Manage Study, in the order drawn (Age appears twice). */
export const audiencePills = (roles: string): { label?: string; value: string; icon?: 'users' | 'pin' }[] => [
  { value: '10', icon: 'users' }, { value: 'Worldwide', icon: 'pin' },
  { label: 'Gender:', value: 'All' }, { label: 'Education:', value: 'High school graduate' },
  { label: 'Age:', value: '18-22, 31-40' }, { label: 'Age:', value: '18-22, 31-40' },
  { label: 'Work Functions:', value: 'Consultation' }, { label: 'Roles:', value: roles },
  { label: 'Industry:', value: 'Healthcare, Pharma' }, { label: 'Organization Size:', value: 'Self employed, 1-10, 10-50' },
]
