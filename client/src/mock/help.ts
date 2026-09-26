/**
 * Frequently Asked Questions (1663:104191). The first one is drawn open.
 *
 * **Only the first answer exists in Figma.** On every other accordion the
 * Description text node is switched off (`hidden="true"` on 1663:104207 and
 * its siblings), so the frame carries nine questions and one answer, and
 * eight of them opened onto nothing.
 *
 * The eight below are written from the three governing documents rather than
 * invented: the 58 step workflow, the signed Trust and Rewards policy and
 * what the build itself does. Each names where it comes from in this comment
 * so the copy can be checked:
 *
 * - certificates: the policy's certificate section, and 1663:104813
 * - managed vs self-managed: the workflow's opening banner and step 5
 * - the invoice: the billing card's own lines, plus steps 10, 33, 36 and 54
 * - underfilling: step 54
 * - completion: steps 42, 44 and 45
 * - the Pool: steps 23 and 24, and step 4 for what is not in this build
 * - audiences: steps 6 and 7, and micro-panels
 * - editing after launch: step 7
 *
 * Flagged in docs/Client-Screens-Not-In-Figma.md for the writer to approve.
 */
export const FAQS = [
  {
    q: "Why can't I see a respondent's name, email, or phone number?",
    a: "Every respondent profile is masked, everywhere in the product — Pool, Recruiting, Respondents, even Marketplace data you've purchased outright. This isn't a display setting; it's what keeps respondents interacting only through Focus Insite rather than going around the platform, and it's true even after you've paid for a study.",
  },
  {
    q: "What is the Certificate on my Settings page, and how does it differ from the certificate found on a study's Results tab?",
    a: 'They prove different things. The certificate on your Settings page is about you: it records that your business was verified — the tax number, the domain, the billing on file and the data handling agreement — and it stays on your account. The certificate on a study’s Results tab is about that one study: it records how many of its completions passed identity and duplicate checks, carries its own certificate ID and issue date, and can be shared with your own stakeholders so they can confirm the sample without taking our word for it.',
  },
  {
    q: 'What distinguishes Self-managed studies from Platform-managed studies?',
    a: 'Every study on the platform today is run by the Focus Insite team. You describe what you need, set the incentive and approve the draft; the team writes the screener, prices it, takes it live, moderates the sessions and delivers the results. Self-managed studies, where you would run all of that yourself, are planned for a later phase and will be marked Coming Soon when they arrive.',
  },
  {
    q: 'What exactly am I being charged for on my invoice?',
    a: 'Four things: a flat platform fee, a recruiting fee and an incentive per participant, and a moderation fee per participant. The incentive deposit you paid when the study was agreed is then taken off, so what you settle at the end is the difference. You are charged for the participants actually delivered, not the number you asked for.',
  },
  {
    q: 'What occurs if my study fails to reach its target number of respondents?',
    a: 'You are charged only for the participants who were delivered, and anything already taken beyond that is credited back against your next study. The setup fee is not refunded, because the recruiting work happened either way. Anyone who was booked is paid in full, whether or not the study reached its number.',
  },
  {
    q: "How is a respondent's completion determined, especially if they don't finish the survey?",
    a: 'For a survey or a diary, completion is the study finished in the app. For an interview or a focus group, a code is generated at the end of the session and shown to both sides; the participant enters it and so do you or the moderator. No code, no payment. Earnings are credited automatically once the study completes. Someone who turns up but is not needed on the day is still paid in full.',
  },
  {
    q: 'What is the difference between the Pool and the Marketplace?',
    a: 'The Pool is the platform’s own verified participants — everyone who has passed identity checks, however they arrived. You can search it, see each person’s score, tier and verification, and invite individuals into a live study. The Marketplace, where you would buy a panel someone else has already assembled, is not part of this build; for now every study recruits from the Pool, with the team sourcing outside it where the Pool falls short.',
  },
  {
    q: 'Do I need to create my own audience, or can I utilize an existing one?',
    a: 'Either. You can define the audience for a new study — the segmentation, the groups and the sample size — and the team turns that into screening questions. Or you can recruit from a micro-panel you have already built and saved, which is faster and cheaper than recruiting from scratch. Most studies also need people from outside the Pool, and the team sources those for you.',
  },
  {
    q: 'Is it possible to edit a study after it has been launched?',
    a: 'You can edit the draft and approve it before it goes live. After that, changes are possible but they go back through the team: a screener change in particular means the study is re-priced, because it changes how hard the audience is to find. Talk to us through Contact Support and we will tell you what the change costs before anything moves.',
  },
]

/** The contact card, drawn narrow beside the FAQs and wide under the tickets. */
export const DIRECT_HELP = {
  title: 'Need Direct Help?',
  body: 'Kindly contact us to get your any issues resolved!',
  cta: 'Contact Support',
}

/**
 * Workflow step 56 and the internal console's Support screen. **No frame
 * draws a reply time anywhere in this section** — no SLA, no queue position,
 * no business hours — so these are added from the workflow and flagged.
 *
 * "A person replies within one working day for clients and two for
 * participants. Anything about money, within one day."
 */
export const REPLY_TIMES = {
  client: 'A person replies within one working day.',
  money: 'Anything about money is answered within one day.',
  short: 'Replies within one working day',
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
  /** Step 56's reply time, which the frame does not carry. */
  replyTime: REPLY_TIMES.client,
}

/** Mark as solved? (1663:104539) is switched off; only its title is readable. */
export const MARK_SOLVED = { title: 'Mark as solved?' }
