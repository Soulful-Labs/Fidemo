import { FAQS } from '../mock/seed/account'
import type { Ticket } from '../mock/types'

/**
 * Workflow 56: participants hear back within two working days, one when the
 * ticket is about money. The first answer comes automatically from the FAQs
 * and guides; anything it cannot settle goes to a person on the team.
 */
export const REPLY_TIME: Record<Ticket['topic'], string> = {
  money: 'within 1 working day',
  general: 'within 2 working days',
}

export const TOPIC_LABEL: Record<Ticket['topic'], string> = {
  money: 'About money',
  general: 'Something else',
}

const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'how', 'can', 'not', 'my', 'is', 'of', 'to', 'do', 'are', 'in', 'on', 'it', 'a', 'i'])
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w))

/** Picks the FAQ that shares the most words with the ticket, if any. */
export function matchFaq(subject: string, message: string) {
  const asked = new Set(words(`${subject} ${message}`))
  let best: { faq: (typeof FAQS)[number]; score: number } | undefined
  for (const faq of FAQS) {
    const score = words(faq.q).filter((w) => asked.has(w)).length
    if (score > 0 && (!best || score > best.score)) best = { faq, score }
  }
  return best?.faq
}

/** The automated first reply, from the guides when one fits, otherwise a handover. */
export function autoReply(subject: string, message: string, topic: Ticket['topic']): string {
  const faq = matchFaq(subject, message)
  const handover = `a person on the support team will reply ${REPLY_TIME[topic]}.`
  if (!faq) return `Thanks, we have your message. ${handover.charAt(0).toUpperCase()}${handover.slice(1)}`
  return `From our guides, "${faq.q}": ${faq.a} If that does not settle it, ${handover}`
}
