import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { pricingView, sign, usePricing } from '../../mock/pricing'
import { platform } from '@shared/store'
import type { SettingsGroup, SettingsValues } from '@shared/types'
import { TEAM, say } from '../../platform'
import { AddOns } from './AddOns'
import { Edit, EditShell, Notes } from './parts'
import { UploadFill } from './UploadFill'

const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg border-1 border-stroke-1 bg-bg-1 p-4"><h3 className="border-b-1 border-stroke-input pb-3.5 text-title-s leading-[25px] text-text-title">{title}</h3><div className="flex flex-col gap-4 pt-4">{children}</div></section>
)
const Sub = ({ children, note }: { children: string; note?: string }) => <p className="border-t-1 border-stroke-input pt-4 text-body-medium text-text-title">{children}{note && <span className="font-normal text-text-subtitle"> &nbsp;•&nbsp; {note}</span>}</p>

const SCREENS = {
  'client-fees': { crumb: 'Fees', last: 'Edit Clients Fees', title: 'Edit Clients Fees', note: 'Configure study pricing by industry or other filters, and the charges', back: '/pricing', group: 'fees', name: 'Clients Fees' },
  'participant-fees': { crumb: 'Fees', last: 'Edit Participants Fees', title: 'Edit Participants Fees', note: 'Manage charges and rewards for participants', back: '/pricing', group: 'participants', name: 'Participants Fees' },
  tiers: { crumb: 'Gamification', last: 'Edit Tiers', title: 'Tiers', note: 'Set conditions for tiers', back: '/pricing?tab=gamification', group: 'tiers', name: 'Tiers' },
  'trust-score': { crumb: 'Gamification', last: 'Edit Trust Score', title: 'Trust Score', note: 'Set the score changes for different rules', back: '/pricing?tab=gamification', group: 'trust', name: 'Trust Score values' },
  'reward-points': { crumb: 'Gamification', last: 'Edit Reward Points', title: 'Reward Points', note: 'Set reward points for different sources to earn them', back: '/pricing?tab=gamification', group: 'points', name: 'Reward Points' },
} as const

/** What the warning says each change does (22 Oct 2026, policy v2 section 10). */
const WARNING: Record<SettingsGroup, string> = {
  fees: 'These fees go live across the whole platform for every client as soon as you save. Studies created from now on are priced with them; a study already created keeps the fees it was created with.',
  trust: 'These values go live across the whole platform as soon as you save, for everything that happens from now on. Scores already earned keep the values in force when they were earned, so nobody\'s score moves.',
  tiers: 'These thresholds go live across the whole platform as soon as you save. Every participant\'s tier is read from their score against them from now on; no score moves.',
  points: 'These values go live across the whole platform as soon as you save, for points earned from now on. Points already earned keep the value they were earned at, so no balance moves.',
  participants: 'These go live for every participant as soon as you save. A withdrawal already requested keeps the fee it was requested at, and points already redeemed keep the value they were redeemed at.',
}

/** A number typed into a field: "+4", "-2", "$100" and "10" all read as numbers. */
const num = (s: string) => Number(String(s).replace(/[$,\s]/g, ''))

/**
 * The five edit screens (`/pricing/:what`): Edit Clients Fees 2056:192920,
 * Edit Participants Fees 2058:193936, Edit Tiers 2058:195439, Edit Trust Score
 * 2058:196166, Edit Reward Points 2058:197423.
 *
 * Since 22 Oct 2026 four of them save (policy v2 section 10): Save Changes asks
 * first, saying the change goes live for the whole platform, then a master
 * admin's change is recorded and "Changes are published live!" (2058:193905)
 * confirms it. A changed value applies from then on and moves nothing already
 * earned or agreed. Since 23 Oct 2026 the participant fees save too (the
 * withdrawal fee and the value of 100 reward coins); the redemption minimum
 * stays the policy's. Edit Clients Fees has Upload file and fill.
 */
export default function EditPricing() {
  const { what = 'client-fees' } = useParams()
  const navigate = useNavigate()
  const key = (what in SCREENS ? what : 'client-fees') as keyof typeof SCREENS
  const s = SCREENS[key]
  const { values, POINT_NOTES } = usePricing()
  /** The form: every field as typed, starting from the values in force now. */
  const [draft, setDraft] = useState<SettingsValues>(() => {
    const d = JSON.parse(JSON.stringify(values)) as SettingsValues
    // The frame writes every Trust Score value signed: "+50", "+4", "-2".
    for (const k of Object.keys(d.trust) as (keyof SettingsValues['trust'])[]) if (k !== 'studyCap') (d.trust as unknown as Record<string, string>)[k] = sign(d.trust[k])
    return d
  })
  const [asking, setAsking] = useState(false)
  const [published, setPublished] = useState(false)
  const put = <G extends SettingsGroup>(g: G, k: keyof SettingsValues[G]) => (v: string) => setDraft((d) => ({ ...d, [g]: { ...d[g], [k]: v as unknown as number } }))
  const numeric = <G extends SettingsGroup>(g: G): SettingsValues[G] => {
    const o = { ...draft[g] } as Record<string, unknown>
    for (const k of Object.keys(o)) if (typeof o[k] === 'string' || typeof o[k] === 'number') o[k] = num(String(o[k]))
    return o as unknown as SettingsValues[G]
  }
  const save = () => {
    setAsking(false)
    if (say(platform().changeSettings(s.group, numeric(s.group), TEAM))) setPublished(true)
  }
  const t = draft.trust
  const view = pricingView(draft)
  return (
    <EditShell crumb={s.crumb} last={s.last} title={s.title} note={s.note} back={s.back} onSave={() => setAsking(true)}>
      {key === 'client-fees' && (
        <>
          <UploadFill onFill={(f) => setDraft((d) => ({ ...d, fees: { ...d.fees, ...f } }))} />
          <div className="grid grid-cols-2 gap-3"><Edit label="Platform Fees" value={String(draft.fees.platform)} unit="USD" onValue={put('fees', 'platform')} note="One-time per study" /><Edit label="Moderation Fees" value={String(draft.fees.moderation)} unit="USD" onValue={put('fees', 'moderation')} note="One-time per completed participant" /></div>
          <section className="mt-3 flex flex-col gap-3 rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
            <h3 className="text-body-regular text-text-title">Recruitment Fees</h3>
            <div className="rounded-md bg-bg-2 px-3 pb-3 pt-2.5 [&_label]:text-text-regular [&_label]:text-text-subtitle"><Edit plain label="Base" value={String(draft.fees.recruitmentBase)} unit="USD" onValue={put('fees', 'recruitmentBase')} /></div>
            <AddOns addOns={draft.fees.addOns} onChange={(addOns) => setDraft((d) => ({ ...d, fees: { ...d.fees, addOns } }))} />
            <p className="text-text-regular text-text-title">One-time per completed participant</p>
          </section>
        </>
      )}
      {key === 'participant-fees' && (
        <div className="grid grid-cols-2 gap-3">
          <Edit label="Withdrawal" value={String(draft.participants.withdrawal)} unit="USD" onValue={put('participants', 'withdrawal')} note="One-time charge per withdrawal" />
          <Edit label="Reward Points Value" value={String(draft.participants.pointsValue)} unit="USD" onValue={put('participants', 'pointsValue')} note="For 100 Reward Coins" />
        </div>
      )}
      {key === 'tiers' && (
        <div className="grid grid-cols-3 gap-3">
          {(['silver', 'gold', 'platinum'] as const).map((k) => <Edit key={k} label={`${k[0]!.toUpperCase()}${k.slice(1)} Tier`} value={String(draft.tiers[k])} unit="Trust Score" onValue={put('tiers', k)} note="Equal or above trust score to reach this tier" />)}
        </div>
      )}
      {key === 'reward-points' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            {(['referral', 'beingReferred', 'studyCompletion', 'fullProfile', 'streak', 'profilePicture', 'introVideo'] as const).map((k, i) => (
              <Edit key={k} label={view.POINTS[i]![0]!} value={String(draft.points[k])} unit="Points" onValue={put('points', k)} note={view.POINTS[i]![2]} />
            ))}
          </div>
          <Notes items={POINT_NOTES} />
        </div>
      )}
      {key === 'trust-score' && (
        /* Edit Trust Score as 2058:196166 draws it (redrawn 22 Oct 2026). No Show is the policy's -4, not the frame's -2. */
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 items-stretch gap-3">
            <Box title="Earned For">
              <Edit plain label="Onboarding" value={String(t.onboarding)} onValue={put('trust', 'onboarding')} />
              <div className="grid grid-cols-2 gap-4 border-t-1 border-stroke-input pt-4">
                <Edit plain label="Per Study Completion" value={String(t.studyCompletion)} unit={`${sign(num(String(t.studyCompletion)) * num(String(t.studyCap)) || 0)} total`} onValue={put('trust', 'studyCompletion')} />
                <Edit plain label="Max Study per year" value={String(t.studyCap)} onValue={put('trust', 'studyCap')} />
              </div>
              <Sub note="Counts For Last 10 studies">Participation Ratings</Sub>
              <Edit plain label="5-star rating" value={String(t.star5)} onValue={put('trust', 'star5')} />
              <Edit plain label="4-star rating" value={String(t.star4)} onValue={put('trust', 'star4')} />
              <Edit plain label="3-star rating" value={String(t.star3)} onValue={put('trust', 'star3')} />
            </Box>
            <Box title="Deducted For">
              <p className="text-body-medium text-text-title">Participation Ratings</p>
              <Edit plain label="2-star rating" value={String(t.star2)} onValue={put('trust', 'star2')} />
              <Edit plain label="1-star rating" value={String(t.star1)} onValue={put('trust', 'star1')} />
              <div className="border-t-1 border-stroke-input" />
              <Edit plain label="No Show" value={String(t.noShow)} onValue={put('trust', 'noShow')} />
              <Edit plain label="Late Show Up" value={String(t.lateShowUp)} onValue={put('trust', 'lateShowUp')} />
              <Edit plain label="Cancelled Session" value={String(t.cancelledSession)} onValue={put('trust', 'cancelledSession')} />
              <Edit plain label="Fraud" value={String(t.fraud)} onValue={put('trust', 'fraud')} />
            </Box>
          </div>
          <Notes items={pricingView(values).TRUST_NOTES} />
        </div>
      )}
      {(
        <Modal open={asking} onClose={() => setAsking(false)} layout="titled" title="Publish these changes live?"
          footer={<><Button variant="tertiary" onClick={() => setAsking(false)}>Cancel</Button><Button onClick={save}>Yes, Publish Live</Button></>}>
          <p className="text-text-regular leading-5 text-text-title">{WARNING[s.group]}</p>
        </Modal>
      )}
      <SuccessModal open={published} onClose={() => navigate(s.back)} title="Changes are published live!"
        body={`The updated ${s.name} are published live and apply from now on.`} action="Done" onAction={() => navigate(s.back)} />
    </EditShell>
  )
}
