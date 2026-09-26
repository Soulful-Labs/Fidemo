import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import { Clock, Info, PaymentsIcon, PoolIcon, StudiesIcon, SurveyIcon } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'
import CreateShell from './CreateShell'
import BreakdownPanel from './BreakdownPanel'
import { useStudies } from '../../mock/store'
import { AddCardPanel } from '../payments/PaymentPanels'
import { useWorkspace } from '../../mock/workspace'

const FORM = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 6h10M4 12h16M4 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/** A summary chip: a grey label and the value in the title colour. */
function Chip({ label, value, icon }: { label?: string; value: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-input bg-bg px-3 text-text-regular">
      {icon && <span className="text-text-subtitle">{icon}</span>}
      {label && <span className="text-text-subtitle">{label}:</span>}
      <span className="text-text-title">{value}</span>
    </span>
  )
}

/** One review card down the left column. */
function Review({ icon, title, action, children }: {
  icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5 rounded-lg border-1 border-stroke-input bg-bg-0 p-4">
      <div className="flex items-center gap-3">
        <span className="text-brand-secondary">{icon}</span>
        <h2 className="text-body-medium text-text-title">{title}</h2>
        {action}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  )
}

/** A labelled box in the card form. */
function CardField({ label, placeholder, className, value, onChange }: {
  label: string; placeholder: string; className?: string
  value?: string; onChange?: (v: string) => void
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <input placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}
        className="h-12 w-full rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title placeholder:text-text-body" />
    </label>
  )
}

/**
 * 2.1.4 Payment and Publish. The four type frames (1518:92247 survey,
 * 1622:84446 video, 1622:86775 diary, 1622:87629 in-person) are pixel
 * identical apart from whether Publish Study is enabled, so this is one
 * screen; `?state=ready` draws it enabled.
 */
export default function Publish() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { draft } = useDraft()
  const { submitStudy } = useStudies()
  const { cards } = useWorkspace()
  const [breakdown, setBreakdown] = useState(false)
  const [addCard, setAddCard] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [card, setCard] = useState<Record<string, string>>({})
  const cardField = (k: string) => ({ value: card[k], onChange: (v: string) => setCard((c) => ({ ...c, [k]: v })) })

  /**
   * What unlocks Publish Study. The frame draws it disabled on three types
   * and enabled on the fourth, and its own secondary button says why: "Add
   * Card to Publish". So it opens once this study has a card to charge,
   * either typed into the form here or added through the panel. `?state=ready`
   * still forces it, which is how the enabled frame is compared.
   */
  const cardsAtOpen = useRef(cards.length)
  const typed = (card['Card Number'] ?? '').replace(/\D/g, '').length >= 12
    && /\d{2}\s*\/\s*\d{2,4}/.test(card['Expiry Date'] ?? '')
    && (card['CVV'] ?? '').length >= 3
    && (card['Name on Card'] ?? '').trim().length > 0
  const ready = params.get('state') === 'ready' || typed || cards.length > cardsAtOpen.current

  /**
   * Workflow steps 7 and 11, which the frame already agrees with: Publish
   * Study submits, it does not go live. The Published frame says so in its
   * own words, "Your study has been summited for review!". The study is
   * created `in_review` and the team takes it to recruiting.
   */
  const publish = () => {
    submitStudy({
      title: draft.title || 'Untitled study',
      description: draft.description,
      type: draft.type === 'video_call' && draft.groupVideo ? 'group_video_call'
        : draft.type === 'in_person' && draft.groupInPerson ? 'in_person_group'
        : draft.type,
      required: Number(draft.participants) || 0,
      incentive: draft.incentive,
      duration: `${draft.duration} mins`,
    })
    navigate('/studies/create/published')
  }

  return (
    <CreateShell step="publish" action={
      <>
        <Button variant="tertiary" size="row" onClick={() => navigate('/studies/drafts')}>Save Draft &amp; Exit</Button>
        <Button size="row" disabled={!ready} onClick={publish}>Publish Study</Button>
      </>
    }>
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col gap-2">
          <Review icon={<Info className="h-5 w-5" />} title="About">
            <Chip value="Survey" icon={<SurveyIcon className="h-4 w-4 text-brand-secondary" />} />
            <Chip value={`${draft.duration} mins`} icon={<Clock className="h-4 w-4" />} />
          </Review>

          <Review icon={<PoolIcon className="h-5 w-5" />} title="Audience" action={
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-1 px-3 text-text-regular text-text-subtitle">
              Estimated Audience: <span className="text-text-title">1K</span>
              <Info className="h-4 w-4 text-text-body" />
            </span>
          }>
            <Chip value={draft.participants} icon={<PoolIcon className="h-4 w-4" />} />
            <Chip value="Worldwide" icon={
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>} />
            <Chip label="Gender" value="All" />
            <Chip label="Education" value="High school graduate" />
            <Chip label="Age" value="18-22, 31-40" />
            <Chip label="Age" value="18-22, 31-40" />
            <Chip label="Work Functions" value="Consultation" />
            <Chip label="Roles" value="Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner" />
            <Chip label="Industry" value="Healthcare, Pharma" />
            <Chip label="Organization Size" value="Self employed, 1-10, 10-50" />
          </Review>

          <Review icon={<StudiesIcon className="h-5 w-5" />} title="Screener">
            <Chip label="Screening" value="8 inputs" />
          </Review>

          <Review icon={FORM} title="Study">
            <Chip label="Survey Form" value="10 inputs" />
            <Chip label="Incentive" value={`$${draft.incentive}`} />
          </Review>
        </div>

        <aside className="sticky top-[88px] flex w-[488px] shrink-0 flex-col gap-2.5 rounded-lg bg-bg-1 p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-body-medium text-text-title">
              <span className="text-brand-secondary">{FORM}</span>Payment Summary
            </h2>
            <button type="button" onClick={() => setBreakdown(true)}
              className="flex items-center gap-1 text-text-medium text-text-title hover:text-brand-primary">
              View Breakdown
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col">
            {[['Total Study Cost', '$1,900'], ['To pay upfront', '$475']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 border-b-1 border-stroke-input py-2 last:border-b-0">
                <span className="text-text-regular text-text-title">{k}</span>
                <span className="text-text-regular text-text-title">{v}</span>
              </div>
            ))}
          </div>

          <h2 className="flex items-center gap-3 text-body-medium text-text-title">
            <PaymentsIcon className="h-5 w-5 text-brand-secondary" />Payment Method
          </h2>

          <div className="flex flex-col gap-2.5">
            <CardField label="Card Number" placeholder="0000 0000 0000 0000" {...cardField('Card Number')} />
            <div className="grid grid-cols-2 gap-3">
              <CardField label="Expiry Date" placeholder="MM / YYYY" {...cardField('Expiry Date')} />
              <CardField label="CVV" placeholder="000" {...cardField('CVV')} />
            </div>
            <CardField label="Name on Card" placeholder="Enter name" {...cardField('Name on Card')} />
            <div className="grid grid-cols-2 gap-3">
              <CardField label="Billing Address" placeholder="Enter street or area" {...cardField('Billing Address')} />
              <CardField label="Zip Code" placeholder="Enter zip code" {...cardField('Zip Code')} />
            </div>
          </div>

          <Checkbox checked={saveCard} label="Save this card" onChange={() => setSaveCard((v) => !v)} />

          <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" onClick={() => setAddCard(true)}>Add Card to Publish</Button>

          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-regular text-text-subtitle marker:text-text-body">
            <li>
              3% merchant processing fee applies when using a credit card.{' '}
              {/* Drawn as emphasised text, but it reads as a link and the screen
                  already holds what it promises: the Payment Breakdown panel
                  itemises the fee this sentence is about. Same classes, so the
                  frame is unchanged. */}
              <button type="button" onClick={() => setBreakdown(true)}
                className="text-text-title hover:underline">Learn about payment options</button>
            </li>
          </ul>
          <span className="border-t-1 border-stroke-input" />
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-regular text-text-subtitle marker:text-text-body">
            <li>The remaining project costs ($1,050 for incentives and $375 for recruitment) will be billed as participants complete their sessions.</li>
            <li>You are only charged for participants that complete your research. If available, add the estimated recruitment and incentives credits to &ldquo;study deposits&rdquo; upon publishing.</li>
            <li>Studies recruits until filled or till defined deadline or <span className="text-text-title">max 60 days from publish.</span></li>
            <li>This card will be added to your team for future payments.</li>
          </ul>
        </aside>
      </div>

      <BreakdownPanel open={breakdown || params.get('panel') === 'breakdown'} onClose={() => setBreakdown(false)} />
      <AddCardPanel open={addCard} onClose={() => setAddCard(false)} />
    </CreateShell>
  )
}
