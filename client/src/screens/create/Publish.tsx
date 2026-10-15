import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Clock, DiaryBookIcon, InPersonIcon, Info, PaymentsIcon, PoolIcon, StudiesIcon, SurveyIcon, VideoIcon } from '../../components/ui/icons'
import { summarise } from '@shared/studyForm'
import { useDraft } from '../../mock/createStore'
import CreateShell, { SaveDraftButton } from './CreateShell'
import BreakdownPanel from './BreakdownPanel'
import { laterLine, useQuote } from './StudyBits'
import { money } from '@shared/format'
import { useStudies } from '../../platform'
import { AddCardPanel, CardMark } from '../payments/PaymentPanels'
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
  const { draft, form, draftId, reset } = useDraft()
  const { submitStudy, state, study } = useStudies()
  const resubmitting = study(draftId)?.state === 'in_review'
  /** The four steps as they were built, in the frame's own chips (shared/studyForm.ts). */
  const built = summarise(state, form())
  const TypeIcon = draft.type === 'survey' ? SurveyIcon : draft.type === 'video_call' ? VideoIcon : draft.type === 'in_person' ? InPersonIcon : DiaryBookIcon
  const toast = useToast()
  const { cards, addCard: saveCardToAccount } = useWorkspace()
  const [breakdown, setBreakdown] = useState(false)
  const quote = useQuote()
  const [addCard, setAddCard] = useState(false)
  const [card, setCard] = useState<Record<string, string>>({})
  const cardField = (k: string) => ({ value: card[k], onChange: (v: string) => setCard((c) => ({ ...c, [k]: v })) })
  /**
   * The card this study is charged to. A card saved at onboarding or on the
   * account is already selected (the default one), so nothing is typed again.
   * "Use a different card" opens the form instead.
   */
  const [picked, setPicked] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const chosen = typing ? undefined : cards.find((c) => c.last4 === picked) ?? cards.find((c) => c.isDefault) ?? cards[0]

  /**
   * What unlocks Publish Study: a card to charge. Either a saved card is
   * selected, or a full card is typed into the form, which is then saved to
   * the account on publish. With neither, Publish stays disabled: a client
   * who skipped the card at onboarding cannot publish until they add one.
   * `?state=ready` still forces it, which is how the enabled frame is compared.
   */
  const digits = (card['Card Number'] ?? '').replace(/\D/g, '')
  const typed = digits.length >= 12
    && /\d{2}\s*\/\s*\d{2,4}/.test(card['Expiry Date'] ?? '')
    && (card['CVV'] ?? '').length >= 3
    && (card['Name on Card'] ?? '').trim().length > 0
  const ready = params.get('state') === 'ready' || Boolean(chosen) || typed || resubmitting

  /**
   * Workflow steps 7 and 11, which the frame already agrees with: Publish
   * Study submits, it does not go live. The Published frame says so in its
   * own words, "Your study has been summited for review!". The study is
   * created `in_review` and the team takes it to recruiting.
   */
  const publish = () => {
    if (!chosen && !typed && !resubmitting && params.get('state') !== 'ready') { toast('Add a card to publish this study'); return }
    // A card typed here is kept on the account for future payments, as the note under the form says.
    if (!chosen && typed && !cards.some((c) => c.last4 === digits.slice(-4))) {
      const [mm, yy] = (card['Expiry Date'] ?? '').replace(/\s/g, '').split('/')
      saveCardToAccount({ brand: digits.startsWith('4') ? 'VISA' : 'Mastercard', last4: digits.slice(-4), expires: `Expires ${mm}/${(yy ?? '').slice(-2)}` })
    }
    /** The store refuses a study it cannot ask the screener of, and says which question. Nothing is created then. */
    const made = submitStudy(form(), draftId)
    if (!made.ok) { toast(made.why); return }
    reset()
    navigate('/studies/create/published')
  }

  return (
    <CreateShell step="publish" action={
      <>
        <SaveDraftButton />
        <Button size="row" disabled={!ready} onClick={publish}>Publish Study</Button>
      </>
    }>
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col gap-2">
          <Review icon={<Info className="h-5 w-5" />} title="About">
            <Chip value={built.typeLabel} icon={<TypeIcon className="h-4 w-4 text-brand-secondary" />} />
            <Chip value={`About ${draft.duration} mins`} icon={<Clock className="h-4 w-4" />} />
          </Review>

          <Review icon={<PoolIcon className="h-5 w-5" />} title="Audience" action={
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-1 px-3 text-text-regular text-text-subtitle">
              Estimated Audience: <span className="text-text-title">{built.estimatedAudience}</span>
              <Info className="h-4 w-4 text-text-body" />
            </span>
          }>
            {built.audience.map((a, i) => (
              <Chip key={i} label={a.label} value={a.value} icon={a.icon === 'people' ? <PoolIcon className="h-4 w-4" /> : a.icon === 'pin' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>) : undefined} />
            ))}
          </Review>

          <Review icon={<StudiesIcon className="h-5 w-5" />} title="Screener">
            <Chip label="Screening" value={built.screenerSummary} />
          </Review>

          <Review icon={FORM} title="Study">
            <Chip label={built.studySummary.label} value={built.studySummary.value} />
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
            {[['Total Study Cost', money(quote.total)], ['To pay upfront', money(quote.deposit)]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 border-b-1 border-stroke-input py-2 last:border-b-0">
                <span className="text-text-regular text-text-title">{k}</span>
                <span className="text-text-regular text-text-title">{v}</span>
              </div>
            ))}
          </div>

          <h2 className="flex items-center gap-3 text-body-medium text-text-title">
            <PaymentsIcon className="h-5 w-5 text-brand-secondary" />Payment Method
          </h2>

          {cards.length > 0 && !typing ? (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Card to charge">
              {cards.map((c) => {
                const on = chosen?.last4 === c.last4
                return (
                  <button key={c.last4} type="button" role="radio" aria-checked={on} onClick={() => setPicked(c.last4)}
                    className={`flex h-14 items-center gap-3 rounded-md border-1 px-4 text-left ${on ? 'border-brand-primary bg-yellow-30' : 'border-stroke-input bg-bg'}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5 ${on ? 'border-cta-primary' : 'border-neutral-1000'}`}>
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-cta-primary" />}
                    </span>
                    <CardMark brand={c.brand} />
                    <span className="flex flex-1 flex-col">
                      <span className="text-text-regular text-text-title">{c.brand} &bull; **** {c.last4}</span>
                      <span className="text-text-regular text-text-subtitle">{c.expires}{c.isDefault ? ' · Default' : ''}</span>
                    </span>
                  </button>
                )
              })}
              <button type="button" onClick={() => setTyping(true)} className="self-start text-text-medium text-text-title underline hover:text-brand-primary">Use a different card</button>
            </div>
          ) : (
          <div className="flex flex-col gap-2.5">
            {cards.length === 0 && <p className="text-text-regular text-text-subtitle">No card is on file yet. Add one to publish this study.</p>}
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
            {cards.length > 0 && (
              <button type="button" onClick={() => setTyping(false)} className="self-start text-text-medium text-text-title underline hover:text-brand-primary">Use a saved card</button>
            )}
          </div>
          )}

          {!chosen && <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" onClick={() => setAddCard(true)}>Add Card to Publish</Button>}

          {/* The frame's first note, a 3% card processing fee, is not here: no fee table holds it and nothing charges it. */}
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-regular text-text-subtitle marker:text-text-body">
            <li>{laterLine(quote)}</li>
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
