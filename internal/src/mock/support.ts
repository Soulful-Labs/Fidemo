/**
 * Support as drawn (section 2036:160943: list New 2036:159859, Ongoing
 * 2044:49967, Closed 2044:50380; ticket New 2045:51486, Ongoing 2045:52936,
 * Closed 2045:53435). The Ongoing and Closed lists draw the same ten tickets;
 * Closed prefixes each last message with "You:" where Ongoing names the sender.
 */
export interface Ticket { id: string; subject: string; who: string; last: string; from: string; date: string; number: string; unread?: boolean }
const T = (n: number, subject: string, who: string, last: string, from: string, date: string, number: string, unread = false): Ticket => ({ id: `tk-${n}`, subject, who, last, from, date, number, unread })

export const TICKETS: Ticket[] = [
  T(1, 'Study results not accessible', 'Ronny', 'Hi Jennifer, Thanks for reaching out! I would like to let you know that all the results are being processed.', 'Ronny McCoy', 'Aug 10, 2026', 'FI-S562357', true),
  T(2, 'Study results not accessible', 'Robert Dwayne', 'Hi, Thanks for reaching out! I would like to let you know that all the results are being processed.', 'Robert Dwayne', 'Aug 10, 2026', 'FI-S562357', true),
  T(3, 'Data analysis ongoing', 'Mia', 'Hello! We’re currently in the process of analyzing the data and it will be available soon.', 'Mia Jorden', 'Sep 15, 2026', 'FI-S562358', true),
  T(4, 'Results published', 'John', 'Good news! The study results have been published and can be accessed at our website.', 'John McCoy', 'Oct 5, 2026', 'FI-S562359', true),
  T(5, 'Project Update', 'Lisa', 'The new features are fully implemented and ready for testing. Check the project board.', 'Lisa Tran', 'Oct 6, 2026', 'FI-S562360'),
  T(6, 'Budget Approval', 'Mark', 'The budget for Q4 has been approved. We can proceed with the marketing plan.', 'Mark Johnson', 'Oct 7, 2026', 'FI-S562361'),
  T(7, 'Team Outing', 'Emily', 'Reminder about the team outing scheduled for next Friday. Please RSVP by Wednesday.', 'Emily Chen', 'Oct 8, 2026', 'FI-S562362'),
  T(8, 'Client Feedback', 'Raj', 'We received feedback from the client regarding the last presentation, and they loved it.', 'Raj Patel', 'Oct 9, 2026', 'FI-S562363'),
  T(9, 'New Hire Announcement', 'Sarah', 'We have a new team member joining us next week! Welcome, Tom, to the team.', 'Sarah Williams', 'Oct 10, 2026', 'FI-S562364'),
  T(10, 'Product Launch', 'George', 'The launch date for the new product has been set for Nov 15, 2026. Mark your calendars.', 'George Smith', 'Oct 11, 2026', 'FI-S562365'),
]

export const HEADINGS = { new: ['Pending Tickets', '3'], ongoing: ['Ongoing Tickets', '4 messages'], closed: ['Completed Tickets', '628'] } as const

export const THREAD = {
  subject: 'Study results not accessible', number: '#FI-S562357', day: 'Aug 16, Sunday', time: '04:26 PM',
  info: { subject: 'Study results not accessible.', message: ['We are currently experiencing issues retrieving the study results. Please bear with us as we work to resolve this matter.', 'Study: Healthcare OS review study', 'Let me know asap.'] },
  ask: ['Hey Jennifer!', 'Could you please describe what exactly are you seeing on your side while accessing the results of your “Healthcare OS review study”?', 'Or you can share screenshot of that exact results tab.'],
  reply: 'Sure! I’ll be sending that today.',
  bye: ['Thanks for contacting us!', 'Let us know if you need any help further.\nHave a great time!'],
  closed: ['This ticket has been resolved and closed', 'Sep 10, 2026, 04:26 PM'],
}
