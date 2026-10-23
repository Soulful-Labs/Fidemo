import { WAITS } from '@shared/platform'

/** Words and images the respondent screens show that are not data: the Help FAQs and the learn video still. */

/** FAQ list from PRD 12.2, used by Help and Support. Answers are prototype copy. */
export const FAQS: { q: string; a: string }[] = [
  { q: 'What is status of incentive payment?', a: 'Open the study from My Studies > History. Its banner shows In Process until the Focus Insite team processes the payout, after the study finishes, then Paid with the date.' },
  { q: 'How HumanLayer works (How can I earn money)', a: `Apply to studies that match your profile, pass the short eligibility check and screener, take part when invited, and the reward is paid into your wallet by the Focus Insite team within ${WAITS.PAYOUT_AFTER_STUDY_ENDS_DAYS} days after the study ends.` },
  { q: 'What are the eligibility criteria for participation?', a: 'Anyone can browse. To apply you need a verified government ID and a completed profile. Premium studies also need a verified professional credential.' },
  { q: 'When will I receive updates about my earnings?', a: "You can track the updates of the participated studies in the 'Applied' or 'Invited' tab of studies menu" },
  { q: 'How can I track my payment status?', a: 'Wallet > Payouts lists every withdrawal with a Processing or Completed status and the expected date.' },
  { q: "What should I do if I don't receive my payment?", a: 'Raise a ticket from Contact Us and mark it as about money. Money tickets are answered within one working day.' },
  { q: 'Are there specific payment schedules I should be aware of?', a: `Rewards are paid into your wallet by the Focus Insite team within ${WAITS.PAYOUT_AFTER_STUDY_ENDS_DAYS} days after the study ends. Withdrawals from your wallet reach your bank within ${WAITS.WITHDRAWAL}.` },
  { q: 'Who can I contact for payment inquiries?', a: 'Use Contact Us on this screen. Payment questions are routed straight to the payments team.' },
  { q: 'What payment methods are available for my earnings?', a: 'Bank transfer to any savings or checking account you add under Manage Payout Methods.' },
]

/** Still for the "Learn about HumanLayer" video card (PRD 5.2). */
export const LEARN_VIDEO_IMAGE = '/img/learn-video.jpg'
