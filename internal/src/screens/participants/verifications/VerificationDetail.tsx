import { avatarFor } from '@shared/avatar'
import IntroVideo from '../../../components/app/IntroVideo'
import { sharedVideo } from '@shared/derive'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { ChevronRight, CloseIcon, ExternalIcon, EyeIcon, SupportIcon, VerifiedIcon } from '../../../components/ui/icons'
import { UnderlineTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import { useProfile } from '../../../mock/profile'
import { monthDayYear, useVerificationCase } from '../../../mock/verifications'
import { ticketsOf } from '@shared/derive'
import { platform } from '@shared/store'
import { TEAM, usePlatform } from '../../../platform'
import { Card, Check, Field, File } from '../profile/AboutTab'
import { AccountFlow } from '../profile/accountDialogs'
import type { AccountStep } from '../profile/accountDialogs'
import DecisionFlow from './dialogs'
import type { Decision, Step } from './dialogs'
import PersonLink from '../../../components/app/PersonLink'

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
function Report({ decided, children, reason, detail, at, by, onStudy }: { decided: boolean; children?: ReactNode; reason: string; detail: string; at: string; by: string; onStudy?: () => void }) {
  return (
    <section className={cn('rounded-lg p-4 text-text-regular leading-5', decided ? 'bg-bg-1' : 'bg-yellow-40')}>
      <h3 className="text-body-medium leading-[22px] text-text-title">{reason}</h3>
      <p className="pt-2 text-text-title">{detail}</p>
      {decided && <Button variant="tertiary" size="md" className="mt-2 rounded-sm bg-bg-1 px-3" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={onStudy}>View Study</Button>}
      <p className="pt-2 text-text-subtitle">{at}</p>
      {decided && <><p className="pt-2 text-text-body">Reported By</p>
        <span className="mt-1.5 inline-flex h-7 items-center gap-2 rounded-full bg-bgAlt-2 px-2.5 text-text-title"><img src={avatarFor(String(by))} alt="" className="h-4 w-4 rounded-full" />{by}<ChevronRight className="h-4 w-4 text-text-subtitle" /></span></>}
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
  const { id = 'iv-samuel-l' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const c = useVerificationCase(id)
  const { kind, outcome, who, person } = c
  const { ACCOUNT, PERSONAL, PROFESSIONAL, TOPICS, PERSON } = useProfile(person.id)
  const state = usePlatform()
  const [flow, setFlow] = useState<{ kind: Decision; step: Step } | null>(null)
  const [deact, setDeact] = useState<AccountStep>(null)
  const profile = kind !== 'report' && params.get('tab') === 'profile'
  const start = (k: Decision) => setFlow({ kind: k, step: 'form' })
  const pending = outcome === 'pending'
  const isId = kind === 'identity'
  const by = c.decidedBy ? ` · by ${c.decidedBy}` : ''
  /** Chat opens this person's support ticket, or opens one for them. */
  const chat = () => {
    const open = ticketsOf(state, 'participant', person.id)[0]
    if (open) { navigate(`/support/${open.id}`); return }
    const made = platform().createTicket({ kind: 'participant', id: person.id }, { subject: `${isId ? 'Identity verification' : 'Profession credential'}: more information needed`, message: c.check?.reason ?? 'We need a little more information to finish your verification.' }, TEAM)
    if (made.ok) navigate(`/support/${made.id}`)
  }
  /** Every decision goes to the shared platform, which records who took it. */
  const decide = (k: Decision, statement: string) => {
    const p = platform()
    switch (k) {
      case 'verify-id': return p.decideCheck(person.id, 'identity', 'verified', statement, TEAM)
      case 'verify-profession': return p.decideCheck(person.id, 'profession', 'verified', statement, TEAM)
      case 'reject-verification': return p.decideCheck(person.id, isId ? 'identity' : 'profession', 'rejected', statement, TEAM)
      case 'reject-report': return p.decideReport(id, 'rejected', statement, TEAM)
      case 'restrict': return p.decideReport(id, 'restricted', statement, TEAM)
    }
  }

  /** The participant's intro video, only while they consent to share it. */
  const shownVideo = sharedVideo(person)
  const subject = isId
    ? { title: person.profile.idType || 'Government ID', text: c.check?.reason ?? '' }
    : { title: 'Professional License', text: c.check?.reason ?? '' }

  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: kind === 'report' ? 'Reported' : 'Onboarding', to: `/participants/verifications${kind === 'report' ? '?tab=reported' : ''}` }, { label: who.name }]}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={who.photo} alt="" className="h-[87px] w-[87px] rounded-sm object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title-s leading-[25px] text-text-title"><PersonLink id={person.id}>{who.name}</PersonLink></h1>
          <p className="flex items-center gap-2 pt-1 text-text-regular leading-[22px] text-text-subtitle"><span className="text-body-regular">{who.role}</span><span aria-hidden="true">•</span>{who.place}<span aria-hidden="true">•</span>Cert. ID: HL-R-9F2A-3K7P</p>
          <div className="flex gap-3 pt-2">
            <span className="flex h-7 items-center rounded-full bg-yellow-50 px-2.5 text-text-regular text-brand-primary">{PERSON.completion}</span>
            {who.verified && <span className="flex h-7 items-center gap-1 rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle"><VerifiedIcon className="h-4 w-4 text-state-success" />Profession Verified</span>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="pt-1 text-title-l leading-[31px] text-text-title">{who.score}</span><span className="pt-[3px]"><TierTag tier={who.tier} size={32} /></span>
          <Button variant="tertiary" size="md" className="bg-bgAlt-1 px-3" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate(`/participants/${person.id}`)}>Go To Full Profile</Button>
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
            <div><h3 className="text-body-medium leading-[22px] text-text-title">{subject.title}</h3><p className="pt-1.5 text-text-subtitle">{subject.text}</p><p className="pt-1.5 text-text-subtitle">{monthDayYear(c.check?.flaggedAt)}</p></div>
            {pending ? (
              <div className="flex shrink-0 gap-3">
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" leftIcon={<CloseIcon className="h-5 w-5" />} onClick={() => start('reject-verification')}>Reject</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-success!" leftIcon={<VerifiedIcon className="h-5 w-5" />} onClick={() => start(isId ? 'verify-id' : 'verify-profession')}>Mark Verified</Button>
                <Button className="px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={chat}>Chat</Button>
              </div>
            ) : <Button variant="tertiary" className="bg-bg-1 px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={chat}>View Support Chat</Button>}
          </section>
          {outcome === 'verified' && <Note tone="good" title="Marked as verified!" when={`${monthDayYear(c.check?.decidedAt)}${by}`}>{c.check?.note}</Note>}
          {outcome === 'rejected' && <Note tone="bad" title={`Rejected the ${subject.title} verification.`} when={`${monthDayYear(c.check?.decidedAt)}${by}`}>{c.check?.note}</Note>}
          {isId ? (
            <>
              <Label>Uploaded Documents</Label>
              <div className="-mt-1 flex gap-3"><Doc name="Passport front.pdf" /><Doc name="Passport back.pdf" /></div>
              {outcome === 'verified' ? <Good>Marked as Verified</Good> : <Bad>{outcome === 'rejected' ? 'ID Could not be verified with records neither manually!' : 'ID Could not be verified with records!'}</Bad>}
              <Label>Selfie Verification</Label>
              <div className="-mt-1 flex h-[46px] w-[318px] items-center gap-2 rounded-md border-1 border-stroke-1 px-3 text-text-regular text-state-success">
                <img src={avatarFor(person.id)} alt="" className="h-6 w-6 rounded-full object-cover" /><span className="flex-1">Selfie photo verified</span><VerifiedIcon className="h-5 w-5" />
              </div>
            </>
          ) : (
            <>
              <Field label="Occupation" value={person.profile.occupation} />
              <Field label="License/Certificate Number" value={person.profile.licenseId || 'N/A'} />
              {outcome === 'verified' ? <Good>Marked as Verified</Good> : <Bad>{outcome === 'rejected' ? 'Medical License could not be verified with records neither manually!' : 'Medical License could not be verified with records!'}</Bad>}
              <Field label="Work Functions" value={person.profile.industry} /><Field label="Experience" value={person.profile.experience} />
            </>
          )}
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-2 items-start gap-3 pt-5">
          <div className="flex flex-col gap-3">
            <Card title="Account Details">
              <Field label="ID Verification" value={person.profile.idType || 'Government ID'} />
              <File thumb="/img/participants/passport.png" name="Passport front.pdf" meta="5 MB" /><File thumb="/img/participants/passport.png" name="Passport back.pdf" meta="5 MB" />
              {person.identity.state === 'verified' ? <Good>ID Verified</Good> : <Bad>ID Could not be verified with records!</Bad>}
              <Label>Selfie Verification</Label>
              <div className="-mt-2 flex h-10 items-center gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 px-2 text-body-regular text-text-title"><img src={avatarFor(person.id)} alt="" className="h-6 w-6 rounded-full object-cover" />Selfie photo verified</div>
              <Check>Human Verified</Check>
              <div className="flex flex-col gap-3 border-t-1 border-stroke-input pt-3">{ACCOUNT.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}</div>
            </Card>
            <Card title="Personal Details">
              <div><p className="pb-1 text-text-regular leading-5 text-text-subtitle">Intro Video</p>{shownVideo ? <IntroVideo video={shownVideo} /> : <p className="text-body-regular leading-[22px] text-text-body">Not shared</p>}</div>
              {PERSONAL.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            </Card>
          </div>
          <Card title="Professional Details">
            {PROFESSIONAL.slice(0, 2).map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            {person.profession.state === 'verified' ? <Good>Profession Verified</Good> : <Bad>Professional License could not be verified with records!</Bad>}
            {PROFESSIONAL.slice(2).map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
            <div className="border-t-1 border-stroke-input pt-3"><Field label="Topics You Are Good In" value={TOPICS} /></div>
          </Card>
        </div>
      )}

      {kind === 'report' && (
        <div className="flex flex-col gap-3 pt-4">
          <h2 className="text-body-regular leading-[22px] text-text-subtitle">Reported For</h2>
          <Report decided={!pending} reason={c.report?.reason ?? ''} detail={c.report?.detail ?? ''} at={monthDayYear(c.report?.at)} by={c.reporter} onStudy={() => c.report?.studyId && navigate(`/studies/${c.report.studyId}`)}>
            {pending && (
              <div className="flex gap-3 pt-4">
                <Button className="px-5" onClick={() => start('reject-report')}>Reject Report</Button>
                <Button variant="secondary" className="px-5" onClick={() => start('restrict')}>Restrict Account</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" onClick={() => setDeact('form')}>Deactivate Account</Button>
              </div>
            )}
            <div className="pt-4 empty:hidden">
              {outcome === 'rejected' && <Note tone="good" title="Rejected the report!" when={`${monthDayYear(c.report?.decidedAt)}${by}`}>{c.report?.note}</Note>}
              {outcome === 'restricted' && <Note tone="warn" title="Restricted the account!" when={`${monthDayYear(c.report?.decidedAt)}${by}`}>{c.report?.note}</Note>}
              {outcome === 'deactivated' && <Note tone="bad" title="Deactivated the account." when={`${monthDayYear(c.report?.decidedAt)}${by}`}>{c.report?.note}</Note>}
            </div>
          </Report>
          {c.earlier.map((r) => (
            <Report key={r.id} decided reason={r.reason} detail={r.detail} at={monthDayYear(r.at)} by={c.reporter}>
              <div className="pt-4"><Note tone={r.outcome === 'deactivated' ? 'bad' : 'warn'} title={r.outcome === 'deactivated' ? 'Deactivated the account.' : 'Restricted the account!'} when={monthDayYear(r.decidedAt)}>{r.note}</Note></div>
            </Report>
          ))}
        </div>
      )}

      {flow && <DecisionFlow kind={flow.kind} name={who.first} prior={c.restrictions ?? 0} step={flow.step} onStep={(s) => setFlow(s ? { ...flow, step: s } : null)}
        onDecide={(statement) => decide(flow.kind, statement)} onDone={() => setFlow(null)} />}
      <AccountFlow kind="deactivate" name={who.first} step={deact} onStep={setDeact} onReason={(reason) => platform().decideReport(id, 'deactivated', reason, TEAM)} onDone={() => setDeact(null)} />
    </AppShell>
  )
}
