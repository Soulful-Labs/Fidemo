/** Frequently Asked Questions (1663:104191). The first one is drawn open. */
export const FAQS = [
  {
    q: "Why can't I see a respondent's name, email, or phone number?",
    a: "Every respondent profile is masked, everywhere in the product — Pool, Recruiting, Respondents, even Marketplace data you've purchased outright. This isn't a display setting; it's what keeps respondents interacting only through Focus Insite rather than going around the platform, and it's true even after you've paid for a study.",
  },
  { q: "What is the Certificate on my Settings page, and how does it differ from the certificate found on a study's Results tab?" },
  { q: 'What distinguishes Self-managed studies from Platform-managed studies?' },
  { q: 'What exactly am I being charged for on my invoice?' },
  { q: 'What occurs if my study fails to reach its target number of respondents?' },
  { q: "How is a respondent's completion determined, especially if they don't finish the survey?" },
  { q: 'What is the difference between the Pool and the Marketplace?' },
  { q: 'Do I need to create my own audience, or can I utilize an existing one?' },
  { q: 'Is it possible to edit a study after it has been launched?' },
]

/** The contact card, drawn narrow beside the FAQs and wide under the tickets. */
export const DIRECT_HELP = {
  title: 'Need Direct Help?',
  body: 'Kindly contact us to get your any issues resolved!',
  cta: 'Contact Support',
}

/** A row of the tickets list (1663:104228). */
export interface Ticket {
  id: string
  subject: string
  last: string
  unread?: boolean
  status: 'Open' | 'Solved'
  activity: string
  created: string
  number: string
}

export const TICKETS: Ticket[] = [
  {
    id: 'fi-s562357-open', subject: 'Study results not accessible',
    last: 'Ronny: Hi Jennifer, Thanks for reaching out! I would like to let you know that all the re…',
    unread: true, status: 'Open', activity: 'Aug 10, 2026', created: 'Aug 10, 2026', number: 'FI-S562357',
  },
  {
    id: 'fi-s562357', subject: 'Study results not accessible',
    last: 'You: Hi, Thanks for reaching out! I would like to let you know that all the results will be th…',
    status: 'Solved', activity: 'Aug 10, 2026', created: 'Aug 10, 2026', number: 'FI-S562357',
  },
  {
    id: 'fi-s562358', subject: 'Data analysis ongoing',
    last: "You: Hello! We're currently in the process of analyzing the data and it will be available sh…",
    status: 'Solved', activity: 'Sep 15, 2026', created: 'Sep 15, 2026', number: 'FI-S562358',
  },
  {
    id: 'fi-s562359', subject: 'Results published',
    last: 'You: Good news! The study results have been published and can be accessed at our web…',
    status: 'Solved', activity: 'Oct 5, 2026', created: 'Oct 5, 2026', number: 'FI-S562359',
  },
  {
    id: 'fi-s562360', subject: 'Feedback collection phase',
    last: 'You: Hi! We are collecting feedback on the study results from participants until the end o…',
    status: 'Solved', activity: 'Oct 31, 2026', created: 'Oct 31, 2026', number: 'FI-S562360',
  },
]

/** The thread (1663:104436). The first reply carries the frame's own badge. */
export const THREAD = {
  subject: 'Study results not accessible',
  number: '#FI-S562357',
  day: 'Aug 16, Sunday',
  info: {
    heading: 'Ticket Info',
    subjectLabel: 'Subject',
    subject: 'Study results not accessible.',
    messageLabel: 'Message',
    lines: [
      'We are currently experiencing issues retrieving the study results. Please bear with us as we work to resolve this matter.',
      'Study: Healthcare OS review study',
      'Let me know asap.',
    ],
    at: '04:26 PM',
  },
  reply: {
    lines: [
      'Hey Jennifer thanks for reaching out!',
      'Could you please describe what exactly are you seeing on your side while accessing the results of your “Healthcare OS review study”?',
      'Or you can share screenshot of that exact results tab.',
    ],
    /** The frame's own wording, typo included. */
    badge: 'FI-Smart Assitant here!',
    at: '04:26 PM',
  },
  answer: { text: 'Sure! I’ll be sending that today.', at: '04:26 PM' },
  composer: 'Write a message...',
}

/** Ask Support (1663:104557). */
export const ASK_SUPPORT = {
  title: 'Ask Support',
  heading: 'Contact us',
  sub: 'Send us a message',
  /** The frame reuses the Rate panel's placeholder here. */
  placeholder: 'Describe your experience with Ferry here..',
}

export const SENT_MODAL = {
  title: 'Sent successfully!',
  body: 'Our team and assistants will review and reach out to you shortly.',
}

/** Mark as solved? (1663:104539) is switched off; only its title is readable. */
export const MARK_SOLVED = { title: 'Mark as solved?' }
