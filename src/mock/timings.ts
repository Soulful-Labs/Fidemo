/**
 * Every fake delay in the prototype, in one place. There is no backend, so a
 * few transitions need a nudge for a demo to show the whole loop. Change these
 * or set them to 0 to remove the simulation entirely.
 */
export const TIMINGS = {
  /** Applied -> invited, after the screener is submitted. */
  screenerToInvite: 3000,
  /** In process -> paid, after a study is completed. */
  completionToPaid: 5000,
  /** "Feels like a server" pause before an action resolves. */
  fakeServer: 600,
  /** Support ticket -> automated first reply from the guides. */
  autoReply: 2500,
  /** How long a toast stays up. */
  toast: 3000,
} as const
