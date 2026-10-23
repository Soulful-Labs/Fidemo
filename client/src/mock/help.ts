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
 * - audiences: steps 6 and 7, and the Pool
 * - editing after launch: step 7
 *
 * Flagged in docs/Client-Screens-Not-In-Figma.md for the writer to approve.
 */
export const FAQS = [
  {
    q: "Why can't I see a respondent's name, email, or phone number?",
    a: "Every respondent profile is masked, everywhere in the product — Pool, Recruiting, Respondents, even Marketplace data you've purchased outright. This isn't a display setting; it's what keeps respondents interacting only through HumanLayer rather than going around the platform, and it's true even after you've paid for a study.",
  },
  {
    q: "What is the Certificate on my Settings page, and how does it differ from the certificate found on a study's Results tab?",
    a: 'They prove different things. The certificate on your Settings page is about you: it records that your business was verified — the tax number, the domain, the billing on file and the data handling agreement — and it stays on your account. The certificate on a study’s Results tab is about that one study: it records how many of its completions passed identity and duplicate checks, carries its own certificate ID and issue date, and can be shared with your own stakeholders so they can confirm the sample without taking our word for it.',
  },
  {
    q: 'What distinguishes Self-managed studies from Platform-managed studies?',
    a: 'Every study on the platform today is run by the Focus Insite team. You describe what you need and approve the draft; the team sets the cost per participant, writes the screener, prices it, takes it live, moderates the sessions and delivers the results. Self-managed studies, where you would run all of that yourself, are planned for a later phase and will be marked Coming Soon when they arrive.',
  },
  {
    q: 'What exactly am I being charged for on my invoice?',
    a: 'One cost per participant, which the team sets for your study and which already includes the incentive paid to each participant: your Total Recruiting Cost is that rate times the participants. You pay 20% when you publish and 30% when the study goes live. The final bill counts only the participants who completed, less those two deposits, and that difference is what you settle at the end.',
  },
  {
    q: 'What occurs if my study fails to reach its target number of respondents?',
    a: 'You are charged only for the participants who completed. Where the deposits you paid come to more than the final bill, the difference is credited back against your next study. Anyone who was booked is paid in full, whether or not the study reached its number.',
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
    a: 'Either. You can define the audience for a new study — the segmentation, the groups and the sample size — and the team turns that into screening questions. Or you can search the Pool and invite the people you want to a live study yourself. Most studies also need people from outside the Pool, and the team sources those for you.',
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
  status: 'Open' | 'Closed'
  activity: string
  created: string
  number: string
}

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
export const MARK_SOLVED = { title: 'Close this ticket?' }
