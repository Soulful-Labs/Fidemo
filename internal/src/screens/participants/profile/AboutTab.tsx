import type { ReactNode } from 'react'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { ChevronRight, InfoIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { ACCOUNT, METRICS, PERSON, PERSONAL, PROFESSIONAL, RATINGS, TOPICS, VERIFIED } from '../../../mock/profile'

const BAR = { green: ['bg-brand-secondary', 'text-brand-secondary'], blue: ['bg-blue-600', 'text-blue-600'], purple: ['bg-purple-600', 'text-purple-600'], yellow: ['bg-yellow-500', 'text-brand-primary'] }

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-lg bg-bg-1 p-4">
    <h2 className="border-b-1 border-stroke-input pb-3 text-body-regular leading-[22px] text-text-subtitle">{title}</h2>
    <div className="flex flex-col gap-3 pt-3.5">{children}</div>
  </section>
)
const Field = ({ label, value }: { label: string; value: string }) => (
  <div><p className="text-text-regular leading-5 text-text-subtitle">{label}</p><p className={cn('pt-1 text-body-regular leading-[22px]', value === 'N/A' ? 'text-text-body' : 'text-text-title')}>{value}</p></div>
)
const File = ({ thumb, name, meta }: { thumb: string; name: string; meta: string }) => (
  <div className="flex h-[52px] items-center gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 p-1.5 text-text-regular leading-5">
    <img src={thumb} alt="" className="h-10 w-[54px] rounded-xs object-cover" /><div><p className="text-text-title">{name}</p><p className="text-text-subtitle">{meta}</p></div>
  </div>
)
const Check = ({ children }: { children: string }) => (
  <span className="inline-flex h-7 items-center gap-1 self-start rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-state-success"><VerifiedIcon className="h-4 w-4" />{children}</span>
)

/**
 * About (2017:148911): four bg-1 cards in two columns. Professional Details
 * and Trust Score (score, tier, Reviews, four ratings, three metrics, four
 * verifications); Personal Details and Account Details (email, phone, date of
 * birth, the ID documents and the selfie check). Everything is read only.
 */
export default function AboutTab({ onReviews }: { onReviews: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card title="Professional Details">
        {PROFESSIONAL.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
        <div className="border-t-1 border-stroke-input pt-3"><Field label="Topics You Are Good In" value={TOPICS} /></div>
        <div className="h-3" />
      </Card>
      <Card title="Trust Score">
        <p className="flex items-center gap-3 text-title-l leading-[31px] text-text-title">{PERSON.score}<TierTag tier="Platinum" size={32} />
          <Button variant="tertiary" size="sm" className="rounded-sm bg-bg-1 px-2.5 text-text-regular" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onReviews}>Reviews</Button></p>
        <p className="pt-3 text-text-regular leading-5 text-text-subtitle">Performance Ratings</p>
        {RATINGS.map(([label, value, colour]) => (
          <div key={label} className="text-text-regular leading-5">
            <p className="flex justify-between text-text-title"><span className="flex items-center gap-1">{label}<InfoIcon className="h-4 w-4 text-text-subtitle" /></span><span className={BAR[colour][1]}>{value}</span></p>
            <div className="mt-1 h-1 rounded-full bg-stroke-input"><div className={cn('h-1 rounded-full', BAR[colour][0])} style={{ width: value }} /></div>
          </div>
        ))}
        <dl className="flex flex-col gap-[3px] pt-6 text-text-regular leading-5">
          {METRICS.map(([l, v]) => <div key={l} className="flex justify-between"><dt className="text-text-subtitle">{l}</dt><dd className="text-text-title">{v}</dd></div>)}
        </dl>
        <ul className="flex flex-col gap-[3px] border-t-1 border-stroke-input pt-4 text-text-regular leading-5 text-text-title">
          {VERIFIED.map((v) => <li key={v} className="flex items-center gap-1"><VerifiedIcon className="h-4 w-4 text-state-success" />{v}</li>)}
        </ul>
      </Card>
      <Card title="Personal Details">
        <div><p className="pb-1 text-text-regular leading-5 text-text-subtitle">Intro Video</p><File thumb="/img/participants/intro.png" name="samuel-intro.mp4" meta="5 MB  |  Updated on Jan 10, 2026" /></div>
        {PERSONAL.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
      </Card>
      <Card title="Account Details">
        {ACCOUNT.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}
        <div className="flex flex-col gap-1.5 border-t-1 border-stroke-input pt-3">
          <Field label="ID Verification" value="Passport" />
          <File thumb="/img/participants/passport.png" name="Passport front.pdf" meta="5 MB" /><File thumb="/img/participants/passport.png" name="Passport back.pdf" meta="5 MB" />
          <Check>Govt. ID Verified</Check>
          <p className="pt-1 text-text-regular leading-5 text-text-subtitle">Selfie Verification</p>
          <div className="flex h-10 items-center gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 px-2 text-body-regular text-text-title"><img src="/img/participants/selfie.png" alt="" className="h-6 w-6 rounded-full object-cover" />Selfie photo verified</div>
          <Check>Human Verified</Check>
        </div>
      </Card>
    </div>
  )
}
