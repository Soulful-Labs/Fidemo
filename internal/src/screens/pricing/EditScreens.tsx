import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Pill from '../../components/app/Pill'
import Button, { IconButton } from '../../components/ui/Button'
import { Chip } from '../../components/ui/controls'
import { Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Overlay'
import { DEDUCTED_EDIT, EARNED, EARNED_STARS, PARAMETERS, POINTS, POINT_NOTES, TIERS_EDIT, TRUST_NOTES, FEE, DEDUCTED_VIEW } from '../../mock/pricing'
import { Edit, EditShell, Notes, Pencil } from './parts'

const Trash = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l.800 11a2 2 0 0 0 2 2h4.400a2 2 0 0 0 2-2L17 7M10.500 11v5M13.500 11v5" /></svg>
)
const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg border-1 border-stroke-1 bg-bg-1 p-4"><h3 className="border-b-1 border-stroke-input pb-3.5 text-title-s leading-[25px] text-text-title">{title}</h3><div className="flex flex-col gap-4 pt-4">{children}</div></section>
)
const Sub = ({ children, note }: { children: string; note?: string }) => <p className="border-t-1 border-stroke-input pt-4 text-body-medium text-text-title">{children}{note && <span className="font-normal text-text-subtitle"> &nbsp;•&nbsp; {note}</span>}</p>

function AddOnRow({ name, amount, pills }: { name: string; amount: string; pills: [string | undefined, string][] }) {
  return (
    <div className="flex items-center justify-between rounded-md border-1 border-stroke-1 px-3 py-2.5">
      <div><p className="text-body-regular text-text-subtitle">{name}</p>
        <p className="flex items-center gap-2 pt-1.5 text-text-regular text-text-subtitle"><span className="text-title-s text-text-title">{amount}</span><span aria-hidden="true">•</span>For{pills.map(([l, v]) => <Pill key={v} label={l} className="h-7 px-2.5">{v}</Pill>)}</p></div>
      <div className="flex gap-3"><IconButton label={`Edit ${name}`} className="h-12 w-12 rounded-md"><Pencil /></IconButton><IconButton label={`Delete ${name}`} className="h-12 w-12 rounded-md"><Trash /></IconButton></div>
    </div>
  )
}

const SCREENS = {
  'client-fees': { crumb: 'Fees', last: 'Edit Clients Fees', title: 'Edit Clients Fees', note: 'Configure study pricing by industry or other filters, and the charges', back: '/pricing' },
  'participant-fees': { crumb: 'Fees', last: 'Participants', title: 'Edit Participants Fees', note: 'Manage charges and rewards for participants', back: '/pricing' },
  tiers: { crumb: 'Gamification', last: 'Edit Tiers', title: 'Tiers', note: 'Set conditions for tiers', back: '/pricing?tab=gamification' },
  'trust-score': { crumb: 'Gamification', last: 'Edit Trust Score', title: 'Trust Score', note: 'Set the score changes for different rules', back: '/pricing?tab=gamification' },
  'reward-points': { crumb: 'Gamification', last: 'Edit Reward Points', title: 'Reward Points', note: 'Set reward points for different sources to earn them', back: '/pricing?tab=gamification' },
}

/**
 * The five edit screens (`/pricing/:what`): Edit Clients Fees 2056:192920,
 * Edit Participants Fees 2058:193936, Edit Tiers 2058:195439, Edit Trust Score
 * 2058:196166, Edit Reward Points 2058:197423. Every field is a free input
 * with no limit drawn. The drawn confirmation, "Clients Fees are updated!"
 * (2058:193905), claimed a save that never happened. These values come from
 * the signed Trust and Rewards policy and the platform's own rules
 * (shared/platform.ts), so this build cannot change them from here: the
 * screen says so up front, and Save Changes says so again and stores nothing.
 */
export default function EditPricing() {
  const { what = 'client-fees' } = useParams()
  const navigate = useNavigate()
  const key = (what in SCREENS ? what : 'client-fees') as keyof typeof SCREENS
  const s = SCREENS[key]
  const [saved, setSaved] = useState(false)
  const [creating, setCreating] = useState(true)
  const [chips, setChips] = useState(['Study Type: Survey', 'Skills', 'Roles'])
  return (
    <EditShell {...s} onSave={() => setSaved(true)}>
      <p role="note" className="mb-3 rounded-md border-1 border-stroke-input bg-bg-1 px-4 py-3 text-text-regular text-text-title">These values are set by the signed Trust and Rewards policy and the platform's pricing rules. They cannot be changed from the console in this build, so nothing on this screen is saved.</p>
      {key === 'client-fees' && (
        <>
          <div className="grid grid-cols-2 gap-3"><Edit label="Platform Fees" value={FEE.platform} note="One-time per study" /><Edit label="Moderation Fees" value={FEE.moderation} note="One-time per completed participant" /></div>
          <section className="mt-3 flex flex-col gap-3 rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
            <h3 className="text-body-regular text-text-title">Recruitment Fees</h3>
            <div className="rounded-md bg-bg-2 px-3 pb-3 pt-2.5 [&_label]:text-text-regular [&_label]:text-text-subtitle"><Edit plain label="Base" value={FEE.recruitmentBase} /></div>
            <AddOnRow name="Add-on 1" amount={FEE.typeAddOn} pills={[['Study Type:', 'Video Call, In-Person, Diary Study'], [undefined, 'Roles']]} />
            <AddOnRow name="Add-on 2" amount={FEE.skillsAddOn} pills={[[undefined, 'Skills']]} />
            <Button variant="secondary" size="md" className="self-start px-3" onClick={() => setCreating(true)}>+ Create Add-on</Button>
            {creating && (
              <div className="rounded-md border-1 border-stroke-1 bg-bg-0 p-4">
                <div className="flex items-center justify-between pb-3"><h4 className="text-title-s text-text-title">Create Add-on</h4>
                  <div className="flex gap-3"><Button size="md" className="px-3" onClick={() => setCreating(false)}>Create</Button><Button variant="secondary" size="md" className="px-3" onClick={() => setCreating(false)}>Cancel</Button></div></div>
                <div className="grid grid-cols-2 gap-5 [&_label]:text-text-regular [&_label]:text-text-subtitle">
                  <Edit plain label="Add-on Amount" value={FEE.skillsAddOn.replace('+', '')} />
                  <div><Select label="For Parameter" placeholder="Choose parameters to add" options={PARAMETERS} onChange={(v) => setChips((c) => c.includes(v) ? c : [...c, v])} />
                    <div className="flex gap-2 pt-2">{chips.map((c) => <Chip key={c} onRemove={() => setChips((all) => all.filter((x) => x !== c))}>{c}</Chip>)}</div></div>
                </div>
              </div>
            )}
            <p className="text-text-regular text-text-title">One-time per completed participant</p>
          </section>
        </>
      )}
      {key === 'participant-fees' && (
        <div className="grid grid-cols-3 gap-3"><Edit label="Withdrawal" value={FEE.withdrawal} note="One-time charge per withdrawal" /><Edit label="Reward Points Value" value={FEE.pointValue} note="For = 100 Reward Coins" /><Edit label="Minimum Points To Redeem" value={FEE.minimumRedeem} note="Minimum points required to redeem at a time" /></div>
      )}
      {key === 'tiers' && <div className="grid grid-cols-3 gap-3">{TIERS_EDIT.map(([l, v]) => <Edit key={l} label={l!} value={v!} unit="Trust Score" note="Equal or above trust score to reach this tier" />)}</div>}
      {key === 'reward-points' && (
        <div className="flex flex-col gap-3"><div className="grid grid-cols-3 gap-3">{POINTS.map(([l, v, n]) => <Edit key={l} label={l!} value={v!} unit="Points" note={n} />)}</div><Notes items={POINT_NOTES} /></div>
      )}
      {key === 'trust-score' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 items-stretch gap-3">
            <Box title="Earned For"><Edit plain label="Onboarding" value={EARNED[0]![1]!} /><div className="border-t-1 border-stroke-input pt-4"><Edit plain label="Study Completion" value={EARNED[1]![1]!} /></div>
              <Sub note="Counts For Last 10 studies">Participation Ratings</Sub>{EARNED_STARS.map(([l, v]) => <Edit key={l} plain label={l!} value={v!} />)}</Box>
            <Box title="Deducted For"><p className="text-body-medium text-text-title">Participation Ratings</p><Edit plain label="2-star rating" value={DEDUCTED_VIEW[0]![1]!} /><Edit plain label="1-star rating" value={DEDUCTED_VIEW[1]![1]!} />
              <div className="border-t-1 border-stroke-input" />{DEDUCTED_EDIT.map(([l, v]) => <Edit key={l} plain label={l!} value={v!} />)}</Box>
          </div>
          <Notes items={TRUST_NOTES} />
        </div>
      )}
      <Modal open={saved} onClose={() => setSaved(false)} layout="titled" title="Changes not saved"
        footer={<><Button variant="tertiary" onClick={() => setSaved(false)}>Keep Editing</Button><Button onClick={() => { setSaved(false); navigate(s.back) }}>Back to Pricing &amp; Rewards</Button></>}>
        <p className="text-text-regular leading-5 text-text-title">Nothing was saved. These values come from the signed Trust and Rewards policy and the platform's pricing rules, and this build cannot change them from the console. A change needs the policy updated and a new release of the platform.</p>
      </Modal>
    </EditShell>
  )
}
