import { POINTS } from '../../lib/rules'
import { paidAt } from '../../lib/derive'
import type { AppNotification, Payout, PointsEntry, Referral, Study, Ticket } from '../types'

const DAY = 86_400_000
const shift = (iso: string, minutes: number) => new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()

interface Sources {
  studies: Study[]
  payouts: Payout[]
  pointsHistory: PointsEntry[]
  referrals: Referral[]
  tickets: Ticket[]
  trustScore: number
  tier: string
  profileCompletion: number
}

/**
 * Builds the notification list from the seed data, so every row refers to a
 * study that exists and a state it is really in (PRD 11 copy, workflow
 * events). Rows are sorted newest first; the newest few are unread.
 */
export function buildNotifications(src: Sources): AppNotification[] {
  const out: AppNotification[] = []
  const add = (n: Omit<AppNotification, 'read'>) => out.push({ ...n, read: true })
  const last = (s: Study, label: string) => s.timeline.find((t) => t.label === label)?.at

  for (const s of src.studies) {
    const applied = last(s, 'Applied')
    switch (s.status) {
      case 'invited_to_complete':
        add({ id: `nt-${s.id}-complete`, kind: 'study', title: "Congrats! You're invited to complete study!",
          body: `You've been qualified and invited to complete ${s.title}. Reward ${money(s.reward)} on completion.`,
          at: last(s, 'Invited to complete') ?? applied ?? s.endsAt,
          actionLabel: 'Start Study', to: `/studies/${s.id}/${s.type === 'diary' ? 'diary' : 'survey'}`, secondaryActionLabel: 'View Details', secondaryTo: `/studies/${s.id}` })
        if (s.daysLeft <= 3) add({ id: `nt-${s.id}-deadline`, kind: 'study', title: 'Study deadline approaching!',
          body: `${s.title} closes in ${s.daysLeft} day${s.daysLeft === 1 ? '' : 's'}. Complete it to earn ${money(s.reward)}.`,
          at: shift(s.endsAt, -3 * 24 * 60), actionLabel: 'Complete Study - Earn Faster!', to: `/studies/${s.id}` })
        break
      case 'invited_to_schedule':
        add({ id: `nt-${s.id}-schedule`, kind: 'study', title: "You've been selected to complete!",
          body: `Congratulations! You've been selected for the ${s.title} study. Schedule your session now.`,
          at: last(s, 'Invited to schedule') ?? applied ?? s.endsAt, actionLabel: 'Schedule Now', to: `/studies/${s.id}/schedule` })
        break
      case 'invited_to_apply':
        add({ id: `nt-${s.id}-invite`, kind: 'study', title: "You've been invited to a study!",
          body: `A researcher has directly invited you to participate in the ${s.title} study (${money(s.reward)}). Review the details and apply.`,
          at: new Date(Date.now() - (s.daysLeft % 3 + 1) * DAY).toISOString(), actionLabel: 'View Invitation', to: `/studies/${s.id}` })
        break
      case 'applied':
        add({ id: `nt-${s.id}-screener`, kind: 'study', title: 'Screener submitted',
          body: `Your screener for the ${s.title} study has been submitted. You'll hear back within 48 hours.`,
          at: applied ?? s.endsAt, to: `/studies/${s.id}` })
        add({ id: `nt-${s.id}-update`, kind: 'study', title: 'Application update!',
          body: `Your application for ${s.title} is still under consideration. Check back for the outcome.`,
          at: shift(applied ?? s.endsAt, 26 * 60), to: `/studies/${s.id}` })
        break
      case 'scheduled':
        if (s.booking) add({ id: `nt-${s.id}-soon`, kind: 'session', title: 'Session starting in 15 minutes!',
          body: `Your ${label(s)} session for the ${s.title} study starts at ${s.booking.slot}. Make sure your camera and mic are ready.`,
          at: shift(s.booking.date, -15), actionLabel: 'Join Session', to: `/studies/${s.id}` })
        if (s.timeline.some((t) => t.label === 'Rescheduled')) add({ id: `nt-${s.id}-resched`, kind: 'session', title: 'Your session has been rescheduled',
          body: `Your ${label(s)} session for the ${s.title} study has been moved. Check the new time.`, at: last(s, 'Rescheduled')!, to: `/studies/${s.id}` })
        break
      case 'pin_confirmed':
        if (s.timeline.some((t) => t.label === 'Rescheduled')) add({ id: `nt-${s.id}-resched`, kind: 'session', title: 'Your session has been rescheduled',
          body: `Your ${label(s)} session for the ${s.title} study has been moved to ${s.booking?.slot ?? 'a new time'}.`, at: last(s, 'Rescheduled')!, to: `/studies/${s.id}` })
        break
      case 'in_process':
        if (s.diary) add({ id: `nt-${s.id}-diary`, kind: 'study', title: 'Daily diary entry reminder!',
          body: `${s.title} is waiting for today's entry.`, at: shift(last(s, 'Diary completed') ?? s.endsAt, -24 * 60),
          actionLabel: `Resume Study - Day ${s.diary.completedDays.length}/${s.diary.totalDays}`, to: `/studies/${s.id}/diary` })
        break
      case 'paid':
        add({ id: `nt-${s.id}-paid`, kind: 'money', title: `You've received $${s.reward}!`,
          body: `$${s.reward} reward has been received for the ${s.title} study completion!`, at: paidAt(s), to: '/wallet' })
        if (!s.userReview) add({ id: `nt-${s.id}-rate`, kind: 'study', title: 'How was your study experience?',
          body: `Tell ${s.client.name} how ${s.title} went.`, at: shift(paidAt(s), 60), actionLabel: 'Rate Now', to: `/studies/${s.id}/rate` })
        break
      case 'rejected':
        add({ id: `nt-${s.id}-rejected`, kind: 'study', title: 'Application update!',
          body: `Unfortunately, you were not selected for the ${s.title} study. Keep applying to other studies!`,
          at: last(s, 'Rejected') ?? s.endsAt, to: `/studies/${s.id}` })
        break
      case 'late_show':
        add({ id: `nt-${s.id}-late`, kind: 'trust', title: 'Late show up recorded',
          body: `You arrived late for ${s.title}. You are paid in full; the policy deducts 2 from your Trust Score. Points are never deducted.`,
          at: last(s, 'Late show up') ?? paidAt(s), to: `/studies/${s.id}` })
        add({ id: `nt-${s.id}-paid`, kind: 'money', title: `You've received $${s.reward}!`,
          body: `$${s.reward} reward has been received for the ${s.title} study completion!`, at: paidAt(s), to: '/wallet' })
        break
      case 'not_needed':
        add({ id: `nt-${s.id}-notneeded`, kind: 'money', title: `You've received $${s.reward}!`,
          body: `You turned up for ${s.title} but weren't needed. You are paid in full and your Trust Score is unaffected.`, at: paidAt(s), to: `/studies/${s.id}` })
        break
      default:
        break
    }
    if (s.status === 'available' && s.saved) add({ id: `nt-${s.id}-saved`, kind: 'study', title: 'Update on a saved study',
      body: `${s.title} is now open to applications.`, at: new Date(Date.now() - 6 * DAY).toISOString(), actionLabel: 'Apply Now', to: `/studies/${s.id}` })
  }

  const best = [...src.studies].filter((s) => s.status === 'available' && !s.premium).sort((a, b) => b.matchScore - a.matchScore)[0]
  if (best) add({ id: `nt-${best.id}-match`, kind: 'study', title: 'New study match!',
    body: `A ${best.title} study (${money(best.reward)}) matches your profile. Apply before spots fill up!`,
    at: new Date(Date.now() - 12 * 60_000).toISOString(), to: `/studies/${best.id}` })

  for (const p of src.payouts) {
    if (p.status === 'completed') add({ id: `nt-${p.id}`, kind: 'money', title: 'Your withdrawal has been processed!',
      body: `Withdrawal of $${p.amount} has been completed and credited to your account ${p.destination} successfully.`, at: shift(p.at, 2 * 24 * 60), to: `/wallet/payouts/${p.id}` })
    else add({ id: `nt-${p.id}`, kind: 'money', title: 'Withdrawal request submitted',
      body: `Your withdrawal request of $${p.amount} to account ${p.destination} has been submitted. Processing takes 3-5 business days.`, at: p.at, to: `/wallet/payouts/${p.id}` })
  }

  for (const e of src.pointsHistory) {
    if (e.kind === 'bonus' && e.detail === 'Joined by referral') add({ id: `nt-${e.id}`, kind: 'points', title: `You've earned ${e.amount} reward points!`, body: 'Points were added for being referred to HumanLayer.', at: e.at, to: '/points' })
    if (e.kind === 'streak') add({ id: `nt-${e.id}`, kind: 'points', title: `Earned ${e.amount} reward points for Monthly Streak!`,
      body: `You've completed the monthly streak of 4 studies and earned ${e.amount} reward points!`, at: e.at, to: '/points' })
  }

  for (const r of src.referrals) {
    if (r.status === 'joined') add({ id: `nt-${r.id}`, kind: 'referral', title: 'Your friend just signed up!',
      body: `${r.name} joined using your referral link. You earn ${POINTS.REFERRAL} points when they finish their first study.`, at: r.at, to: '/profile/referrals' })
  }

  for (const t of src.tickets) {
    const reply = [...t.messages].reverse().find((m) => m.from === 'support')
    if (t.status === 'open' && reply) add({ id: `nt-${t.id}`, kind: 'support', title: 'New reply on your support ticket',
      body: `Support has replied to #${t.id}: ${reply.text.slice(0, 70)}…`, at: reply.at, actionLabel: 'View Message', to: `/support/tickets/${t.id}` })
  }

  if (src.tier === 'gold' || src.tier === 'platinum') add({ id: 'nt-tier', kind: 'tier', title: `You've been upgraded to ${src.tier === 'gold' ? 'Gold' : 'Platinum'} tier!`,
    body: `Your Trust Score is ${src.trustScore}, past the ${src.tier === 'gold' ? 70 : 90} needed for ${src.tier === 'gold' ? 'Gold' : 'Platinum'}. Tier is determined by your current Trust Score.`, at: new Date(Date.now() - 25 * DAY).toISOString(), to: '/trust-score/tiers' })
  add({ id: 'nt-trust', kind: 'trust', title: 'Your trust score increased!',
    body: `Great work! Your trust score has increased to ${src.trustScore}/100 through study completion and client ratings.`, at: new Date(Date.now() - 17 * DAY).toISOString(), to: '/trust-score' })
  if (src.profileCompletion < 100) add({ id: 'nt-profile', kind: 'profile', title: 'Complete your profile for more studies',
    body: `Your profile is ${src.profileCompletion}% complete. Finish it to unlock more relevant invitations.`, at: new Date(Date.now() - 7 * DAY).toISOString(), actionLabel: 'Complete Profile', to: '/profile/edit' })

  const sorted = out.sort((a, b) => b.at.localeCompare(a.at))
  return sorted.map((n, i) => ({ ...n, read: i >= 4 }))
}

const money = (n: number) => `$${n}`
const label = (s: Study) => ({ video_call: 'Video Call', group_video_call: 'Group Video Call', in_person: 'In-Person', in_person_group: 'In-Person Group', survey: 'Survey', diary: 'Diary' })[s.type]
