import type { PreScreenQuestion, Question } from '../types'

/**
 * Screener sets, each written for its study. None of them asks age, location
 * or job: workflow 30 says those repeat profile questions are skipped, and
 * the screener screen says so.
 */

const single = (id: string, prompt: string, options: string[]): Question => ({ id, kind: 'single', prompt, options })
const multi = (id: string, prompt: string, options: string[], helper = 'Select as many applies'): Question => ({ id, kind: 'multi', prompt, options, helper })
const text = (id: string, prompt: string, placeholder = 'Type your answer here..'): Question => ({ id, kind: 'text', prompt, placeholder })
const image = (id: string, prompt: string): Question => ({ id, kind: 'image', prompt })
const scale = (id: string, prompt: string): Question => ({ id, kind: 'scale', prompt, options: ['Easy', 'Neutral', 'Hard'] })
const pre = (id: string, prompt: string, options: string[], passing: string[]): PreScreenQuestion => ({ id, prompt, options, passing })

export interface ScreenerSet {
  pre: PreScreenQuestion[]
  full: Question[]
}

export const SCREENERS: Record<string, ScreenerSet> = {
  oncology: {
    pre: [
      pre('p1', 'Do you currently treat patients with a GLP-1 medication?', ['Yes, regularly', 'Occasionally', 'No'], ['Yes, regularly', 'Occasionally']),
      pre('p2', 'Have you adjusted a GLP-1 care plan in the last 3 months?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Are you able to join a 45 minute video call this month?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      multi('q1', 'Which of these do you prescribe or manage?', ['GLP-1 agonists', 'Insulin', 'Oral antidiabetics', 'None of these']),
      single('q2', 'How many oncology patients on GLP-1s do you see a month?', ['1 to 5', '6 to 15', '16 to 30', 'More than 30']),
      scale('q3', 'How confident are you adjusting these plans?'),
      text('q4', 'Briefly, where does current guidance fall short?'),
    ],
  },
  education: {
    pre: [
      pre('p1', 'Do you teach in a mixed-ability classroom?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Which stage do you mostly teach?', ['Primary', 'Secondary', 'Further education', 'I do not teach'], ['Primary', 'Secondary', 'Further education']),
      pre('p3', 'Have you adapted materials for individual pupils this term?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      single('q1', 'How often do you adapt materials per pupil?', ['Every lesson', 'Weekly', 'Rarely']),
      multi('q2', 'Which supports do you use?', ['Teaching assistant', 'Adapted worksheets', 'Assistive technology', 'Small group time']),
      text('q3', 'What is the biggest barrier to inclusive practice?'),
      scale('q4', 'How well supported do you feel?'),
    ],
  },
  shopping: {
    pre: [
      pre('p1', 'How often do you shop online?', ['Weekly or more', 'Monthly', 'Rarely'], ['Weekly or more', 'Monthly']),
      pre('p2', 'Have you abandoned a checkout in the last month?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Do you shop on your phone?', ['Mostly', 'Sometimes', 'Never'], ['Mostly', 'Sometimes']),
    ],
    full: [
      multi('q1', 'Which do you use to shop?', ['Mobile app', 'Mobile browser', 'Desktop', 'In store']),
      single('q2', 'What usually makes you abandon a checkout?', ['Delivery cost', 'Account sign-up', 'Payment options', 'Slow pages']),
      image('q3', 'Share a screenshot of a checkout you recently abandoned'),
      scale('q4', 'How easy was your last online checkout?'),
    ],
  },
  telehealth: {
    pre: [
      pre('p1', 'Do you triage patients remotely as part of your role?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Which best describes your setting?', ['Hospital', 'Primary care', 'Telehealth provider', 'Not clinical'], ['Hospital', 'Primary care', 'Telehealth provider']),
      pre('p3', 'Can you join a 90 minute group call?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      single('q1', 'How many remote triage calls do you handle a week?', ['Under 10', '10 to 30', '31 to 60', 'More than 60']),
      multi('q2', 'Which tools do you use during triage?', ['Video', 'Phone', 'Chat', 'Patient portal']),
      text('q3', 'Describe a recent triage call that was hard to resolve remotely.'),
    ],
  },
  diaryHealth: {
    pre: [
      pre('p1', 'Do you track a health measure every day?', ['Yes', 'Most days', 'No'], ['Yes', 'Most days']),
      pre('p2', 'Can you commit to five short daily entries?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Do you use an app or a notebook to track it?', ['App', 'Notebook', 'Both', 'Neither'], ['App', 'Notebook', 'Both']),
    ],
    full: [
      single('q1', 'How long have you tracked it?', ['Under 3 months', '3 to 12 months', 'Over a year']),
      text('q2', 'What usually gets in the way of recording?'),
    ],
  },
  fitness: {
    pre: [
      pre('p1', 'Do you use a fitness or activity app?', ['Daily', 'A few times a week', 'No'], ['Daily', 'A few times a week']),
      pre('p2', 'Do you wear a tracker or smartwatch?', ['Yes', 'No'], ['Yes', 'No']),
      pre('p3', 'Have you changed fitness apps in the last year?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      multi('q1', 'Which apps have you used?', ['Strava', 'Apple Fitness', 'Google Fit', 'Nike Run Club', 'Other']),
      single('q2', 'What do you track most?', ['Steps', 'Runs or rides', 'Workouts', 'Sleep']),
      scale('q3', 'How easy was it to set up your current app?'),
      text('q4', 'What made you switch, or what would?'),
    ],
  },
  design: {
    pre: [
      pre('p1', 'Do you create social media posts for work or a business?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Which tools do you use?', ['Canva', 'Figma', 'Adobe Express', 'None'], ['Canva', 'Figma', 'Adobe Express']),
      pre('p3', 'How many posts do you design a week?', ['1 to 3', '4 to 10', 'More than 10', 'None'], ['1 to 3', '4 to 10', 'More than 10']),
    ],
    full: [
      multi('q1', 'Which platforms do you post to?', ['Instagram', 'LinkedIn', 'TikTok', 'X', 'Facebook']),
      text('q2', 'Walk us through how you make a typical post.'),
      image('q3', 'Share a post you designed recently'),
    ],
  },
  travel: {
    pre: [
      pre('p1', 'How many flights have you taken in the last 12 months?', ['None', '1 to 2', '3 to 6', 'More than 6'], ['1 to 2', '3 to 6', 'More than 6']),
      pre('p2', 'Do you book your own travel?', ['Yes', 'Someone else does'], ['Yes']),
      pre('p3', 'Can you attend a 90 minute group in Chicago?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      single('q1', 'What matters most when you book?', ['Price', 'Timing', 'Loyalty points', 'Comfort']),
      multi('q2', 'Where do you book?', ['Airline site', 'Aggregator', 'Travel agent', 'Company tool']),
      text('q3', 'Tell us about your last frustrating booking.'),
    ],
  },
  sleep: {
    pre: [
      pre('p1', 'Do you keep a regular bedtime?', ['Yes', 'Mostly', 'No'], ['Yes', 'Mostly', 'No']),
      pre('p2', 'Have you tried anything to improve your sleep this year?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Can you visit our Boston office for 60 minutes?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      single('q1', 'How many hours do you usually sleep?', ['Under 6', '6 to 7', '7 to 8', 'Over 8']),
      multi('q2', 'What disturbs your sleep?', ['Screens', 'Noise', 'Stress', 'Caffeine', 'Nothing in particular']),
      scale('q3', 'How rested do you feel most mornings?'),
    ],
  },
  cardiac: {
    pre: [
      pre('p1', 'Do you implant or follow up cardiac devices?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'How many device patients do you see a month?', ['Under 10', '10 to 40', 'More than 40'], ['10 to 40', 'More than 40']),
      pre('p3', 'Have you taken part in a device trial?', ['Yes', 'No'], ['Yes', 'No']),
    ],
    full: [
      multi('q1', 'Which devices do you work with?', ['Pacemakers', 'ICDs', 'Loop recorders', 'Wearable monitors']),
      text('q2', 'What slows onboarding a new device into your clinic?'),
      scale('q3', 'How confident are you with remote device follow-up?'),
    ],
  },
  radiology: {
    pre: [
      pre('p1', 'Do you report imaging studies?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Which modality do you report most?', ['CT', 'MRI', 'X-ray', 'Ultrasound', 'None'], ['CT', 'MRI', 'X-ray', 'Ultrasound']),
      pre('p3', 'Can you join a 75 minute group call?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      single('q1', 'How many reports do you write a day?', ['Under 20', '20 to 50', 'More than 50']),
      multi('q2', 'Which reporting aids do you use?', ['Structured templates', 'Voice dictation', 'AI pre-reads', 'None']),
      text('q3', 'Where does your reporting workflow lose the most time?'),
    ],
  },
  food: {
    pre: [
      pre('p1', 'Do you drink coffee at home?', ['Daily', 'A few times a week', 'Rarely'], ['Daily', 'A few times a week']),
      pre('p2', 'Who buys the groceries in your household?', ['Me', 'Shared', 'Someone else'], ['Me', 'Shared']),
      pre('p3', 'Have you tried a new food or drink brand this month?', ['Yes', 'No'], ['Yes', 'No']),
    ],
    full: [
      single('q1', 'How do you make coffee at home?', ['Pod machine', 'Filter', 'Espresso', 'Instant']),
      multi('q2', 'What do you look for on the pack?', ['Origin', 'Roast', 'Price', 'Sustainability']),
      scale('q3', 'How easy is it to find a coffee you like?'),
    ],
  },
  mobility: {
    pre: [
      pre('p1', 'Do you drive or lease an electric vehicle?', ['Yes', 'Considering one', 'No'], ['Yes', 'Considering one']),
      pre('p2', 'Where do you charge most?', ['Home', 'Work', 'Public', 'I do not charge'], ['Home', 'Work', 'Public']),
      pre('p3', 'How long is your commute?', ['Under 20 min', '20 to 60 min', 'Over an hour'], ['Under 20 min', '20 to 60 min', 'Over an hour']),
    ],
    full: [
      single('q1', 'How often do you charge?', ['Daily', 'Every few days', 'Weekly']),
      text('q2', 'Describe a charging problem you had recently.'),
      scale('q3', 'How easy is planning a longer trip?'),
    ],
  },
  insurance: {
    pre: [
      pre('p1', 'Do you hold a home insurance policy?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Have you renewed or switched in the last year?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Did you read the renewal documents?', ['Fully', 'Skimmed', 'Not at all'], ['Fully', 'Skimmed', 'Not at all']),
    ],
    full: [
      single('q1', 'What decided your renewal?', ['Price', 'Cover', 'Convenience', 'Loyalty']),
      text('q2', 'What was unclear in the renewal letter?'),
    ],
  },
  fintech: {
    pre: [
      pre('p1', 'Have you opened a new bank or card account in the last 6 months?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Did you do it on your phone?', ['Yes', 'No'], ['Yes']),
      pre('p3', 'Do you use more than one banking app?', ['Yes', 'No'], ['Yes', 'No']),
    ],
    full: [
      single('q1', 'How long did onboarding take?', ['Under 5 minutes', '5 to 15 minutes', 'Longer']),
      multi('q2', 'What did you have to provide?', ['ID photo', 'Selfie', 'Address proof', 'Income details']),
      scale('q3', 'How clear were the steps?'),
    ],
  },
  staffing: {
    pre: [
      pre('p1', 'Do you plan nurse rotas or shifts?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'Which software do you use?', ['A rota tool', 'Spreadsheets', 'Paper', 'None'], ['A rota tool', 'Spreadsheets']),
      pre('p3', 'How many staff do you schedule?', ['Under 20', '20 to 100', 'More than 100'], ['Under 20', '20 to 100', 'More than 100']),
    ],
    full: [
      multi('q1', 'Which tasks take longest?', ['Filling gaps', 'Swaps', 'Compliance checks', 'Reporting']),
      text('q2', 'What would you change about your current tool?'),
    ],
  },
  leadership: {
    pre: [
      pre('p1', 'Do you lead a nursing team?', ['Yes', 'No'], ['Yes']),
      pre('p2', 'How large is the team?', ['Under 10', '10 to 30', 'More than 30'], ['10 to 30', 'More than 30']),
      pre('p3', 'Can you attend a 90 minute roundtable in Chicago?', ['Yes', 'No'], ['Yes']),
    ],
    full: [
      multi('q1', 'Which topics matter most to you this year?', ['Retention', 'Training', 'Rostering', 'Wellbeing']),
      text('q2', 'What is one decision you wish leadership made faster?'),
    ],
  },
}

/** Survey and diary tasks, per study. */
export const TASKS: Record<string, Question[]> = {
  education: [
    single('t1', 'How often do you adapt materials per pupil?', ['Every lesson', 'Weekly', 'Rarely']),
    text('t2', 'What is the biggest barrier to inclusive practice?'),
    scale('t3', 'How well supported do you feel?'),
  ],
  glucose: [
    text('t1', 'What did you record today, and what did you skip?'),
    scale('t2', 'How difficult was tracking today?'),
  ],
  fitness: [
    single('t1', 'What did you notice first?', ['The layout', 'The colours', 'The copy', 'The sign-up']),
    multi('t2', 'Which screens felt unnecessary?', ['Goals', 'Permissions', 'Subscription', 'None']),
    scale('t3', 'How easy was the first workout?'),
    text('t4', 'What would stop you opening it tomorrow?'),
  ],
  payments: [
    single('t1', 'How did you pay for most things today?', ['Card', 'Phone wallet', 'Cash', 'Bank transfer']),
    text('t2', 'Anything that made a payment awkward today?'),
  ],
  goals: [
    single('t1', 'Which method do you use most?', ['App', 'Paper planner', 'Calendar', 'None']),
    multi('t2', 'What do you track goals for?', ['Fitness', 'Money', 'Work', 'Learning']),
    text('t3', 'What made you stick with, or drop, a goal this year?'),
  ],
  sleepDiary: [
    text('t1', 'Describe your wind-down routine tonight.'),
    scale('t2', 'How rested did you feel this morning?'),
  ],
  forms: [
    single('t1', 'How do patients complete intake today?', ['Paper', 'Tablet in clinic', 'Online before the visit', 'Mixed']),
    text('t2', 'What goes wrong most often with paper forms?'),
    scale('t3', 'How ready is your practice for a digital form?'),
  ],
  coffee: [
    single('t1', 'When do you drink your first coffee?', ['Before 7am', '7 to 9am', 'After 9am']),
    multi('t2', 'What do you add?', ['Milk', 'Plant milk', 'Sugar', 'Nothing']),
  ],
  meals: [
    text('t1', 'What did you plan for dinner today, and did it happen?'),
    scale('t2', 'How stressful was planning today?'),
  ],
  refill: [
    single('t1', 'How do you refill prescriptions?', ['App', 'Phone', 'In person', 'Automatic']),
    scale('t2', 'How easy was your last refill?'),
    text('t3', 'What would make refills easier?'),
  ],
  wellness: [
    single('t1', 'What did you notice first?', ['The layout', 'The colours', 'The copy', 'The sign-up']),
    scale('t2', 'How easy was sign-up?'),
    text('t3', 'What would make you come back tomorrow?'),
  ],
}
