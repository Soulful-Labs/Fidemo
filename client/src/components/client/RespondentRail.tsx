import Button from '../ui/Button'
import TierChip from './TierChip'
import { Star, VerifiedMark, Info } from '../ui/icons'
import { RATE_PROMPT, RESPONDENT } from '../../mock/respondent'

/** A section of the rail, under the hairline that separates it from the one above. */
function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t-1 border-stroke-1 px-4 py-4">
      {title && <h3 className="text-text-regular text-text-subtitle">{title}</h3>}
      {children}
    </section>
  )
}

/** The green card inviting the client to rate, in the rail and above the Activity list. */
export function RatePrompt({ wide, onRate }: { wide?: boolean; onRate?: () => void }) {
  return (
    <div className={wide
      ? 'flex h-20 items-center justify-between gap-4 rounded-lg bg-green-50 px-4'
      : 'flex flex-col gap-2 bg-green-50 px-3 py-4'}>
      <div className="flex flex-col gap-1">
        <p className="inline-flex items-center gap-2 text-body-large text-text-title">
          <Star className="h-5 w-5 text-brand-secondary" />{RATE_PROMPT.title}
        </p>
        <p className={wide ? 'text-text-regular text-text-subtitle' : 'max-w-[248px] text-text-regular text-text-subtitle'}>
          {wide ? RATE_PROMPT.wide : RATE_PROMPT.rail}
        </p>
      </div>
      <Button size="none" className={wide ? 'h-12 px-6' : 'mt-3 h-12 w-full'} onClick={onRate}>{RATE_PROMPT.cta}</Button>
    </div>
  )
}

/**
 * The 304px rail beside a respondent's result (1627:97305). It is the same
 * facts as the Respondent Profile Details panel, stacked for a narrow column.
 */
export default function RespondentRail({ rate, onRate }: { rate?: boolean; onRate?: () => void }) {
  const r = RESPONDENT
  return (
    <aside className="flex h-fit w-[304px] shrink-0 self-start flex-col overflow-hidden rounded-lg border-1 border-stroke-input bg-bg-0">
      {rate && <RatePrompt onRate={onRate} />}

      <div className="flex flex-col gap-2 px-4 pb-4 pt-4">
        <p className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-2 text-label text-text-subtitle">
            {r.name[0]}
          </span>
          <span className="text-text-large text-text-title">{r.name}</span>
        </p>
        <p className="text-title-s leading-[22px] text-text-title">{r.role}</p>
        <p className="text-text-regular text-text-subtitle">{r.experience}</p>
        <p className="text-text-regular text-text-subtitle">{r.location}</p>
        <p className="text-text-regular text-text-body">{r.cert}</p>
      </div>

      <Block title="Trust Score">
        <p className="flex items-center gap-3">
          <span className="text-title-l text-text-title">{r.trustScore}</span>
          <TierChip tier={r.tier} />
        </p>
        <h3 className="pt-1 text-text-regular text-text-subtitle">Performance Ratings</h3>
        <div className="flex flex-col gap-3">
          {r.ratings.map((x) => {
            const [bar, text] = x.tone.split(' ')
            return (
              <div key={x.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-text-regular text-text-subtitle">
                    {x.label} <Info className="h-4 w-4 text-text-body" />
                  </span>
                  <span className={`text-text-medium ${text}`}>{x.value}</span>
                </div>
                <span className="h-1 w-full rounded-full bg-bg-3">
                  <span className={`block h-full rounded-full ${bar}`} style={{ width: x.value }} />
                </span>
              </div>
            )
          })}
        </div>
      </Block>

      <Block title="About">
        <dl className="flex flex-col gap-2">
          {r.about.map((a) => (
            <div key={a.label} className="flex items-center justify-between gap-3">
              <dt className="text-text-regular text-text-subtitle">{a.label}</dt>
              <dd className="text-text-regular text-text-title">{a.value}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="Verified">
        <ul className="flex flex-col gap-2">
          {r.verified.map((v) => (
            <li key={v} className="inline-flex items-center gap-2 text-text-regular text-text-title">
              <VerifiedMark className="h-5 w-5 text-brand-secondary" />{v}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Metrics">
        <dl className="flex flex-col gap-2">
          {r.metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-3">
              <dt className="text-text-regular text-text-subtitle">{m.label}</dt>
              <dd className="text-text-regular text-text-title">{m.value}</dd>
            </div>
          ))}
        </dl>
      </Block>
    </aside>
  )
}
