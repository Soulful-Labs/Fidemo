import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { ChevronRight, CloseIcon, ExternalIcon, EyeIcon, SupportIcon, VerifiedIcon } from '../../../components/ui/icons'
import { UnderlineTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import { ACCOUNT, PERSONAL, PROFESSIONAL, TOPICS } from '../../../mock/profile'
import { SUBJECT } from '../../../mock/verifications'
import { Card, Check, Field, File } from '../profile/AboutTab'
import { AccountFlow } from '../profile/accountDialogs'
import type { AccountStep } from '../profile/accountDialogs'
import DecisionFlow from './dialogs'
import type { Decision, Step } from './dialogs'

type Outcome = 'pending' | 'verified' | 'rejected' | 'restricted' | 'deactivated'
const Bad = ({ children }: { children: string }) => <span className="inline-flex h-7 items-center gap-1 self-start rounded-full bg-red-50 px-2.5 text-text-regular text-state-danger"><CloseIcon className="h-4 w-4" />{children}</span>
const Good = ({ children }: { children: string }) => <span className="inline-flex h-7 items-center gap-1 self-start rounded-full bg-state-successBg px-2.5 text-text-regular text-state-success"><VerifiedIcon className="h-4 w-4" />{children}</span>
const Doc = ({ name }: { name: string }) => (
  <div className="flex h-[62px] w-[318px] items-center gap-2 rounded-md border-1 border-stroke-1 p-2 text-text-regular leading-5">
    <img src="/img/participants/passport.png" alt="" className="h-[46px] w-16 rounded-xs object-cover" />
    <div className="flex-1"><p className="text-text-title">{name}</p><p className="pt-0.5 text-text-subtitle">5 MB</p></div>
    <button type="button" aria-label={`View ${name}`} className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke"><EyeIcon className="h-5 w-5" /></button>
  </div>
)
const Note = ({ tone, title, children, when }: { tone: 'good' | 'bad' | 'warn'; title: string; children: ReactNode; when: string }) => (
  <div className="rounded-md border-1 border-stroke-1 bg-bg-0 p-3 text-text-regular leading-5">
    <p className={cn('text-text-medium', tone === 'good' ? 'text-state-success' : tone === 'bad' ? 'text-state-danger' : 'text-state-destructive')}>{title}</p>
    <p className="pt-1.5 text-text-title">{children}</p><p className="pt-1.5 text-text-subtitle">{when}</p>
  </div>
)
const Label = ({ children }: { children: string }) => <p className="text-text-regular leading-5 text-text-subtitle">{children}</p>

/** One report against a participant: what, when, by whom, and the decision once taken. */
function Report({ decided, children }: { decided: boolean; children?: ReactNode }) {
  return (
    <section className={cn('rounded-lg p-4 text-text-regular leading-5', decided ? 'bg-bg-1' : 'bg-yellow-40')}>
      <h3 className="text-body-medium leading-[22px] text-text-title">AI/Bot Activity</h3>
      <p className="pt-2 text-text-title">Study answers were found AI-generated</p>
      {decided && <Button variant="tertiary" size="md" className="mt-2 rounded-sm bg-bg-1 px-3" leftIcon={<ExternalIcon className="h-4 w-4" />}>View Study</Button>}
      <p className="pt-2 text-text-subtitle">Oct 1, 2026</p>
      {decided && <><p className="pt-2 text-text-body">Reported By</p>
        <span className="mt-1.5 inline-flex h-7 items-center gap-2 rounded-full bg-bgAlt-2 px-2.5 text-text-title"><img src="/img/verifications/robert.png" alt="" className="h-4 w-4 rounded-full" />Robert Andrew<ChevronRight className="h-4 w-4 text-text-subtitle" /></span></>}
      {children}
    </section>
  )
}

/**
 * A verification's detail (`/participants/verifications/:id`): three kinds on
 * one screen. `iv-*` an identity check, `pc-*` a profession credential, `rp-*`
 * a report; an id ending `h` comes from History and opens already decided.
 * - Identity (2035:109172): the flagged document's card with Reject, Mark
 *   Verified and Chat; the uploaded files; the selfie check's result.
 * - Profession (2036:134318): the same card for the licence, over the
 *   occupation and licence number.
 * - Report (2036:144297): "Reported For", with Reject Report, Restrict
 *   Account and Deactivate Account.
 * Once decided, the card turns grey, the buttons become "View Support Chat"
 * (or View Study), and a note records the decision and its date.
 * The header's score is drawn 50 Silver on the Flagged tab and 95 Platinum on
 * Samuel's Profile Details tab; built as drawn.
 */
export default function VerificationDetail() {
  const { id = 'iv-1' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const kind = id.startsWith('rp') ? 'report' : id.startsWith('pc') ? 'profession' : 'identity'
  const history = id.endsWith('h')
  const [outcome, setOutcome] = useState<Outcome>(params.get('state') === 'rejected' ? 'rejected' : !history ? 'pending' : kind === 'report' ? (id === 'rp-2h' ? 'restricted' : id === 'rp-3h' ? 'deactivated' : 'rejected') : id === 'iv-3h' ? 'rejected' : 'verified')
  const [flow, setFlow] = useState<{ kind: Decision; step: Step } | null>(null)
  const [deact, setDeact] = useState<AccountStep>(null)
  const profile = kind !== 'report' && params.get('tab') === 'profile'
  const maya = kind === 'report' || (kind === 'profession' && outcome === 'pending')
  const who = maya ? SUBJECT.maya : SUBJECT.samuel
  const score = profile && !maya ? ['95', 'Platinum'] as const : outcome === 'deactivated' ? ['62', 'Silver'] as const : ['50', 'Silver'] as const
  const start = (k: Decision) => setFlow({ kind: k, step: 'form' })
  const pending = outcome === 'pending'
  const isId = kind === 'identity'

  const subject = isId
    ? { title: 'Passport', text: 'Uploaded passport file could not be verified with the govt. records. Verify it manually.' }
    : { title: 'Medical License', text: 'Uploaded Medical License document could not be verified with the official records. Verify it manually.' }

  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: kind === 'report' ? 'Reported' : 'Onboarding', to: `/participants/verifications${kind === 'report' ? '?tab=reported' : ''}` }, { label: 'Samuel Lee' }]}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={who.photo} alt="" className="h-[87px] w-[87px] rounded-sm object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title-s leading-[25px] text-text-title">{who.name}</h1>
          <p className="flex items-center gap-2 pt-1 text-text-regular leading-[22px] text-text-subtitle"><span className="text-body-regular">{who.role}</span><span aria-hidden="true">•</span>New York, USA<span aria-hidden="true">•</span>Cert. ID: HL-R-9F2A-3K7P</p>
          <div className="flex gap-3 pt-2">
            <span className="flex h-7 items-center rounded-full bg-yellow-50 px-2.5 text-text-regular text-brand-primary">60% profile completed</span>
            {who.verified && <span className="flex h-7 items-center gap-1 rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle"><VerifiedIcon className="h-4 w-4 text-state-success" />Profession Verified</span>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="pt-1 text-title-l leading-[31px] text-text-title">{score[0]}</span><span className="pt-[3px]"><TierTag tier={score[1]} size={32} /></span>
          <Button variant="tertiary" size="md" className="bg-bgAlt-1 px-3" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate('/participants/p-1')}>Go To Full Profile</Button>
        </div>
      </header>

      {kind !== 'report' && (
        <UnderlineTabs className="mt-4" value={profile ? 'profile' : 'flagged'} onChange={(k) => setParams(k === 'profile' ? { tab: 'profile' } : {}, { replace: true })}
          items={[{ key: 'flagged', label: profile ? 'Status' : 'Flagged' }, { key: 'profile', label: 'Profile Details' }]} />
      )}

      {kind !== 'report' && !profile && (
        <div className="flex flex-col gap-3 pt-6">
          <h2 className="text-body-regular leading-[22px] text-text-subtitle">{isId ? 'Identity Verification' : 'Profession Credential'}</h2>
          <section className={cn('flex items-center justify-between gap-4 rounded-lg px-4 py-3.5 text-text-regular leading-5', pending ? 'bg-yellow-40' : 'border-1 border-stroke-1 bg-bg-1')}>
            <div><h3 className="text-body-medium leading-[22px] text-text-title">{subject.title}</h3><p className="pt-1.5 text-text-subtitle">{subject.text}</p><p className="pt-1.5 text-text-subtitle">Oct 1, 2026</p></div>
            {pending ? (
              <div className="flex shrink-0 gap-3">
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" leftIcon={<CloseIcon className="h-5 w-5" />} onClick={() => start('reject-verification')}>Reject</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-success!" leftIcon={<VerifiedIcon className="h-5 w-5" />} onClick={() => start(isId ? 'verify-id' : 'verify-profession')}>Mark Verified</Button>
                <Button className="px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={() => navigate('/support/tk-1?state=ongoing')}>Chat</Button>
              </div>
            ) : <Button variant="tertiary" className="bg-bg-1 px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={() => navigate('/support/tk-1?state=ongoing')}>View Support Chat</Button>}
          </section>
          {outcome === 'verified' && <Note tone="good" title="Marked as verified!" when="Oct 5, 2026">An OCR error, manually verified and matched with record.</Note>}
          {outcome === 'rejected' && <Note tone="bad" title="Rejected the Passport ID verification." when="Oct 30, 2026">{isId ? 'Did not submitted the document as required.' : 'Did not submitted the License document for verification as required.'}</Note>}
          {isId ? (
            <>
              <Label>Uploaded Documents</Label>
              <div className="-mt-1 flex gap-3"><Doc name="Passport front.pdf" /><Doc name="Passport back.pdf" /></div>
              {outcome === 'verified' ? <Good>Marked as Verified</Good> : <Bad>{outcome === 'rejected' ? 'ID Could not be verified with records neither manually!' : 'ID Could not be verified with records!'}</Bad>}
              <Label>Selfie Verification</Label>
              <div className="-mt-1 flex h-[46px] w-[318px] items-center gap-2 rounded-md border-1 border-stroke-1 px-3 text-text-regular text-state-success">
                <img src="/img/participants/selfie.png" alt="" className="h-6 w-6 rounded-full object-cover" /><span className="flex-1">Selfie photo verified</span><VerifiedIcon className="h-5 w-5" />
              </div>
            </>
          ) : (
            <>
              <Field label="Occupation" value="General Physician" />
              <Field label="License/Certificate Number" value="98765012345678" />
              {outcome === 'verified' ? <Good>Marked as Verified</Good> : <Bad>{outcome === 'rejected' ? 'Medical License could not be verified with records neither manually!' : 'Medical License could not be verified with records!'}</Bad>}
              <Field label="Work Functions" value="Healthcare Provider, Consulting" /><Field label="Experience" value="10 years" />
              {pending && <Field label="Work Functions" value="Healthcare Provider, Consulting" />}
            </>
          )}
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-2 items-start gap-3 pt-5">
          <div className="flex flex-col gap-3">
            <Card title="Account Details">
              <Field label="ID Verification" value="Passport" />
              <File thumb="/img/participants/passport.png" name="Passport front.pdf" meta="5 MB" /><File thumb="/img/participants/passport.png" name="Passport back.pdf" meta="5 MB" />
              {maya ? <Good>ID Verified</Good> : <Bad>ID Could not be verified with records!</Bad>}
              <Label>Selfie Verification</Label>
              <div className="-mt-2 flex h-10 items-center gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 px-2 text-body-regular text-text-title"><img src="/img/participants/selfie.png" alt="" className="h-6 w-6 rounded-full object-cover" />Selfie photo verified</div>
              <Check>Human Verified</Check>
              <div className="flex flex-col gap-3 border-t-1 border-stroke-input pt-3">{ACCOUNT.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}</div>
            </Card>
            <Card title="Personal Details">
              <div><p className="pb-1 text-text-regular leading-5 text-text-subtitle">Intro Video</p><File thumb="/img/participants/intro.png" name="samuel-intro.mp4" meta="5 MB  |  Updated on Jan 10, 2026" /></div>
              {PERSONAL.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            </Card>
          </div>
          <Card title="Professional Details">
            {PROFESSIONAL.slice(0, 2).map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            {maya ? <Bad>Medical License could not be verified with records!</Bad> : <Good>Profession Verified</Good>}
            {PROFESSIONAL.slice(2).map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            <div className="border-t-1 border-stroke-input pt-3"><Field label="Topics You Are Good In" value={TOPICS} /></div>
          </Card>
        </div>
      )}

      {kind === 'report' && (
        <div className="flex flex-col gap-3 pt-4">
          <h2 className="text-body-regular leading-[22px] text-text-subtitle">Reported For</h2>
          <Report decided={!pending}>
            {pending && (
              <div className="flex gap-3 pt-4">
                <Button className="px-5" onClick={() => start('reject-report')}>Reject Report</Button>
                <Button variant="secondary" className="px-5" onClick={() => start('restrict')}>Restrict Account</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" onClick={() => setDeact('form')}>Deactivate Account</Button>
              </div>
            )}
            <div className="pt-4 empty:hidden">
              {outcome === 'rejected' && <Note tone="good" title="Rejected the report!" when="Oct 3, 2026">This report has been rejected as there’s no AI activity found.</Note>}
              {outcome === 'restricted' && <Note tone="warn" title="Restricted the account for 15 days!" when="Oct 3, 2026">This report has been found correct and has restricted the account for the 1st time.</Note>}
              {outcome === 'deactivated' && <Note tone="bad" title="Deactivated the account." when="Oct 3, 2026">This report has been found correct and due to repeated reports this user has been deactivated for now.</Note>}
            </div>
          </Report>
          {outcome === 'deactivated' && [['30 days', '3rd time.'], ['15 days', '2nd time.'], ['15 days', '1st time.']].map(([days, nth]) => (
            <Report key={nth} decided><div className="pt-4"><Note tone="warn" title={`Restricted the account for ${days}!`} when="Oct 3, 2026">This report has been found correct and has restricted the account for the <strong className="font-semibold">{nth}</strong></Note></div></Report>
          ))}
        </div>
      )}

      {flow && <DecisionFlow kind={flow.kind} step={flow.step} onStep={(s) => setFlow(s ? { ...flow, step: s } : null)}
        onDone={() => { setOutcome(flow.kind.startsWith('verify') ? 'verified' : flow.kind === 'restrict' ? 'restricted' : 'rejected'); setFlow(null) }} />}
      <AccountFlow kind="deactivate" step={deact} onStep={setDeact} onDone={() => { setDeact(null); setOutcome('deactivated') }} />
    </AppShell>
  )
}
