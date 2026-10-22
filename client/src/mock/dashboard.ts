
/** The frame greets John; the account card in the navigation is Jennifer Lee. */
export const GREETING = {
  title: 'Welcome Back, John!',
  sub: 'Create and start tracking and managing your studies with ease...',
}

/** The three studies the frame puts under Ongoing Studies, in its order. */
export const DASHBOARD_STUDY_IDS = ['st-goal', 'st-sleep', 'st-pay']

export interface NotificationRow {
  id: string
  icon: 'study' | 'respondent' | 'session' | 'reminder' | 'completion' | 'target' | 'invoice' | 'message'
  title: string
  /** The study or ticket named inside the line, drawn in the title colour. */
  body: string
  emphasis?: string
  ago: string
  action?: string
  unread?: boolean
  /** Where the row goes, when the platform raised it about a particular screen. */
  to?: string
}

/** Every row of the Notifications panel (1518:71845), in the frame's order. */
export const NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'n1', icon: 'study', unread: true, title: 'Your study is live!',
    body: 'Your Business Finance Operations Analysis study is approved and live for participants to apply and start participating!',
    emphasis: 'Business Finance Operations Analysis', ago: '24 mins ago',
  },
  {
    id: 'n2', icon: 'respondent', unread: true, title: 'New respondent applied!',
    body: 'A new respondent has applied for your Environmental Sustainability Practices study!',
    emphasis: 'Environmental Sustainability Practices', ago: '15 mins ago', action: 'Review Screener',
  },
  {
    id: 'n3', icon: 'session', title: 'New session scheduled!',
    body: 'Scheduled on Aug 20 at 10:00 AM for your User Experience Research study!',
    emphasis: 'User Experience Research', ago: '30 mins ago',
  },
  {
    id: 'n4', icon: 'reminder', title: 'Session with John at 3:00 PM for [ABC] study!',
    body: 'Your session with John starts in 15 minutes for your User Experience Research study!',
    ago: '30 mins ago', action: 'Join Session',
  },
  {
    id: 'n5', icon: 'completion', title: 'New study completion!',
    body: 'A participant has completed the Mental Health Awareness study!',
    ago: '1 hour ago', action: 'View Result',
  },
  {
    id: 'n6', icon: 'target', title: 'Study target fulfilled!',
    body: 'The target number of participants has been reached for your Market Trends Analysis study!',
    ago: '2 hours ago', action: 'View All Results',
  },
  {
    id: 'n7', icon: 'invoice', title: 'Invoice due!',
    body: 'An invoice is due for your Website Usability Testing study.',
    ago: '3 hours ago', action: 'Pay Invoice',
  },
  {
    id: 'n8', icon: 'message', title: 'New message in support ticket!',
    body: "You have a new message in support ticket regarding 'User Feedback' - #13245",
    ago: '4 hours ago', action: 'View Message',
  },
]
