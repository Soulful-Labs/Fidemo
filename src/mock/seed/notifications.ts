import { paidAt } from '../../lib/derive'
import { dateTime } from '../../lib/format'
import type { AppNotification, Payout, PayoutMethod, PointsEntry, Referral, Study, Ticket } from '../types'

const DAY = 86_400_000
const shift = (iso: string, minutes: number) => new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()

interface Sources {
  studies: Study[]
  payouts: Payout[]
  payoutMethods?: PayoutMethod[]
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
  // "... at the Downtown Research Lab" for in-person sessions, nothing for calls.
  const venue = (s: Study) => { const l = s.locations?.find((x) => x.id === s.booking?.locationId); return l ? ` at the ${l.label}` : '' }
  const bank = (destination: string) => src.payoutMethods?.find((m: PayoutMethod) => m.accountNumber.replace(/\s/g, '').endsWith(destination.replace(/\D/g, '')))?.bankName ?? 'bank'

  for (const s of src.studies) {
    const applied = last(s, 'Applied')
    switch (s.status) {
      case 'invited_to_complete':
        add({ id: `nt-${s.id}-complete`, kind: 'study', title: "Congrats! You're invited to complete study!",
          body: `You've been qualified and invited to schedule study for ${s.title}`,
          at: last(s, 'Invited to complete') ?? applied ?? s.endsAt,
          actionLabel: 'Start Study', to: `/studies/${s.id}/${s.type === 'diary' ? 'diary' : 'survey'}`, secondaryActionLabel: 'View Details', secondaryTo: `/studies/${s.id}` })
        if (s.daysLeft <= 3) add({ id: `nt-${s.id}-deadline`, kind: 'study', title: 'Study deadline approaching!',
          body: `You have ${s.daysLeft <= 1 ? '24 hours' : `${s.daysLeft} days`} left to complete your ${s.title} study. Don't leave money on table!`,
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
          body: `Your ${label(s)} session for the ${s.title} study has been moved to ${s.booking ? dateTime(s.booking.date).replace(/,.*$/, '') + ', ' + s.booking.slot : 'a new time'}${venue(s)}.`, at: last(s, 'Rescheduled')!, to: `/studies/${s.id}` })
        break
      case 'in_process':
        if (s.diary) add({ id: `nt-${s.id}-diary`, kind: 'study', title: 'Daily diary entry reminder!',
          body: `Complete today's entry for the ${s.title} diary study. Entry #${(s.diary?.completedDays.length ?? 0) + 1} of ${s.diary?.totalDays ?? 5} is due today.`, at: shift(last(s, 'Diary completed') ?? s.endsAt, -24 * 60),
          actionLabel: `Resume Study - Day${s.diary.completedDays.length}/${s.diary.totalDays}`, to: `/studies/${s.id}/diary` })
        break
      case 'paid':
        add({ id: `nt-${s.id}-paid`, kind: 'money', title: `You've received $${s.reward}!`,
          body: `$${s.reward} reward has been received for the ${s.title} study completion!`, at: paidAt(s), to: '/wallet' })
        if (!s.userReview) add({ id: `nt-${s.id}-rate`, kind: 'study', title: 'How was your study experience?',
          body: `Please rate your experience with the ${s.title} study. Your feedback helps improve the platform and trust.`, at: shift(paidAt(s), 60), actionLabel: 'Rate Now', to: `/studies/${s.id}/rate` })
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
      body: `The ${s.title} study you saved now has ${3 + (Number(s.id.replace(/\D/g, '')) % 5)} spots remaining. Apply soon!`, at: new Date(Date.now() - 6 * DAY).toISOString(), actionLabel: 'Apply Now', to: `/studies/${s.id}` })
  }

  const best = [...src.studies].filter((s) => s.status === 'available' && !s.premium).sort((a, b) => b.matchScore - a.matchScore)[0]
  if (best) add({ id: `nt-${best.id}-match`, kind: 'study', title: 'New study match!',
    body: `A ${best.title} study (${money(best.reward)}) matches your profile. Apply before spots fill up!`,
    at: new Date(Date.now() - 12 * 60_000).toISOString(), to: `/studies/${best.id}` })

  for (const p of src.payouts) {
    if (p.status === 'completed') add({ id: `nt-${p.id}`, kind: 'money', title: 'Your withdrawal has been processed!',
      body: `Withdrawal of $${p.amount} has been completed and credited to your ${bank(p.destination)} account ${p.destination} successfully.`, at: shift(p.at, 2 * 24 * 60), to: `/wallet/payouts/${p.id}` })
    else add({ id: `nt-${p.id}`, kind: 'money', title: 'Withdrawal request submitted',
      body: `Your withdrawal request of $${p.amount} to ${bank(p.destination)} ${p.destination} has been submitted. Processing takes 3-5 business days.`, at: p.at, to: `/wallet/payouts/${p.id}` })
  }

  for (const e of src.pointsHistory) {
    if (e.kind === 'bonus' && e.detail === 'Joined by referral') add({ id: `nt-${e.id}`, kind: 'points', title: `You've earned ${e.amount} reward points!`, body: 'Points were added for being referred to HumanLayer.', at: e.at, to: '/points' })
    if (e.kind === 'streak') add({ id: `nt-${e.id}`, kind: 'points', title: `Earned ${e.amount} reward points for Monthly Streak!`,
      body: `You've completed the monthly streak of 4 studies and earned ${e.amount} reward points!`, at: e.at, to: '/points' })
  }

  for (const r of src.referrals) {
    if (r.status === 'joined') add({ id: `nt-${r.id}`, kind: 'referral', title: 'Your friend just signed up!',
      body: `${r.name.split(' ')[0]} ${r.name.split(' ')[1]?.charAt(0) ?? ''}. signed up using your referral link. You'll earn a bonus once they complete their first study!`, at: r.at, to: '/profile/referrals' })
  }

  for (const t of src.tickets) {
    const reply = [...t.messages].reverse().find((m) => m.from === 'support')
    if (t.status === 'open' && reply) add({ id: `nt-${t.id}`, kind: 'support', title: 'New reply on your support ticket',
      body: `The support team has responded to your ticket #${t.id} regarding ${t.topic === 'money' ? 'payout issues' : 'your request'}. Check update!`, at: reply.at, actionLabel: 'View Message', to: `/support/tickets/${t.id}` })
  }

  if (src.tier === 'gold' || src.tier === 'platinum') add({ id: 'nt-tier', kind: 'tier', title: `You've been upgraded to ${src.tier === 'gold' ? 'Gold' : 'Platinum'} tier!`,
    body: `Congratulations! Your consistent participation has earned you ${src.tier === 'gold' ? 'Gold' : 'Platinum'} tier status.`, at: new Date(Date.now() - 25 * DAY).toISOString(), to: '/trust-score/tiers' })
  add({ id: 'nt-trust', kind: 'trust', title: 'Your trust score increased!',
    body: `Great work! Your trust score has increased to ${src.trustScore}/100. A higher score means more study invitations.`, at: new Date(Date.now() - 17 * DAY).toISOString(), to: '/trust-score' })
  if (src.profileCompletion < 100) add({ id: 'nt-profile', kind: 'profile', title: 'Complete your profile for more studies',
    body: `Your profile is ${src.profileCompletion}% complete. Add your education and industry details to unlock more study opportunities.`, at: new Date(Date.now() - 7 * DAY).toISOString(), actionLabel: 'Complete Profile', to: '/profile/edit' })

  const sorted = out.sort((a, b) => b.at.localeCompare(a.at))
  return sorted.map((n, i) => ({ ...n, read: i >= 4 }))
}

const money = (n: number) => `$${n}`
const label = (s: Study) => ({ video_call: 'Video Call', group_video_call: 'Group Video Call', in_person: 'In-Person', in_person_group: 'In-Person Group', survey: 'Survey', diary: 'Diary' })[s.type]
