import { cn } from '../../lib/cn'
import IntroVideo from './IntroVideo'
import { sharedPhoto, sharedVideo } from '@shared/derive'
import Button from '../ui/Button'
import TierChip from './TierChip'
import { Star, VerifiedMark, Info } from '../ui/icons'
import { RATE_PROMPT } from '../../mock/respondent'
import { personById } from '@shared/derive'
import { usePlatform, useProfile } from '../../platform'
import { PersonName } from '../../app/ProfileHost'

/** A section of the rail, under the hairline that separates it from the one above. */
function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t-1 border-stroke-1 px-3 pb-[13px] pt-3">
      {title && <h3 className="text-text-regular text-text-subtitle">{title}</h3>}
      {children}
    </section>
  )
}

/** The green card inviting the client to rate, in the rail and above the Activity list. */
export function RatePrompt({ wide, onRate, name }: {
  wide?: boolean; onRate?: () => void
  /** Whoever is being rated; the seeded prompt names the frame's person. */
  name?: string
}) {
  const title = name ? `Rate ${name} for this study` : RATE_PROMPT.title
  const cta = name ? `Rate ${name.split(' ')[0]}` : RATE_PROMPT.cta
  return (
    <div className={wide
      ? 'flex h-20 items-center justify-between gap-4 rounded-lg bg-green-50 px-4'
      : 'm-3 mb-0 flex flex-col gap-2 rounded-md bg-green-50 p-4'}>
      <div className="flex flex-col gap-1">
        <p className={cn('inline-flex items-center gap-2 text-text-title', wide ? 'text-body-large' : 'text-text-medium')}>
          <Star className="h-5 w-5 text-brand-secondary" />{title}
        </p>
        <p className={wide ? 'text-text-regular text-text-subtitle' : 'max-w-[248px] text-text-regular text-text-subtitle'}>
          {wide ? RATE_PROMPT.wide : RATE_PROMPT.rail}
        </p>
      </div>
      <Button size="none" className={wide ? 'h-12 px-6' : 'mt-2 h-[38px] w-full'} onClick={onRate}>{cta}</Button>
    </div>
  )
}

/**
 * The 304px rail beside a respondent's result (1627:97305). It is the same
 * facts as the Respondent Profile Details panel, stacked for a narrow column.
 */
export default function RespondentRail({ rate, onRate, person, onReport }: {
  rate?: boolean; onRate?: () => void
  /** Report Participant (19 Oct 2026), the rail's last row. */
  onReport?: () => void
  /**
   * Who the rail is describing. The frames draw it seeded with John M, and
   * open it from rows naming someone else, so without this the rail named the
   * frame's person while the client acted on a different one. The four facts
   * the participant list actually carries come from `person`; the rest stays
   * the frame's detail, because a Person does not hold it.
   */
  person?: { id: string; name: string; role: string; score: number; tier: 'silver' | 'gold' | 'platinum' }
}) {
  /** Everything the rail says about this person is the platform's record of them. */
  const r = useProfile(person?.id)
  /** The picture and the intro video, each only if the participant consented to share it; otherwise an initial, and no video block. */
  const record = personById(usePlatform(), person?.id ?? '')
  const photo = record && sharedPhoto(record)
  const video = record && sharedVideo(record)
  if (!r) return null
  return (
    <aside className="flex h-fit w-[304px] shrink-0 self-start flex-col overflow-hidden rounded-lg border-1 border-stroke-1 bg-bg-0">
      {rate && <RatePrompt onRate={onRate} name={person?.name} />}

      <div className="flex flex-col gap-2 px-3 pb-[13px] pt-3">
        <p className="flex items-center gap-2">
          {photo
            ? <img src={photo} alt="" className="h-6 w-6 rounded-full object-cover" />
            : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-2 text-label text-text-subtitle">{r.name[0]}</span>}
          {person ? <PersonName id={person.id} className="text-body-medium text-text-title">{r.name}</PersonName> : <span className="text-body-medium text-text-title">{r.name}</span>}
        </p>
        <p className="text-title-s leading-[26px] text-text-title">{r.role}</p>
        <p className="text-text-regular text-text-title">{r.experience}</p>
        <p className="text-text-regular text-text-title">{r.location}</p>
        <p className="text-text-regular text-text-subtitle">{r.cert}</p>
      </div>

      <Block title="Trust Score">
        <p className="flex items-center gap-3">
          <span className="text-[26px] font-semibold leading-8 tracking-[-0.02em] text-text-title">{r.trustScore}</span>
          <TierChip tier={r.tier} />
        </p>
        <h3 className="pt-1 text-text-regular text-text-subtitle">Performance Ratings</h3>
        <div className="flex flex-col gap-3">
          {r.ratingRows.map((x) => {
            const [bar, text] = x.tone.split(' ')
            return (
              <div key={x.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-text-regular text-text-title">
                    {x.label} <Info className="h-4 w-4 text-text-subtitle" />
                  </span>
                  <span className={`text-text-regular ${text}`}>{x.value}</span>
                </div>
                <span className="h-1 w-full rounded-full bg-bg-3">
                  <span className={`block h-full rounded-full ${bar}`} style={{ width: x.value }} />
                </span>
              </div>
            )
          })}
        </div>
      </Block>

      {/* Only with the participant's consent: sharedVideo gives nothing otherwise, and nothing is drawn. */}
      {video && <IntroVideo video={video} compact />}

      <Block title="About">
        <dl className="flex flex-col">
          {[['Education', r.about.education || '—'], ['Gender', r.about.gender || '—'], ['Age', r.about.age ? `${r.about.age} years` : '—']].map(([label, value]) => (
            <div key={label} className="flex h-[33px] items-center justify-between gap-3 border-t-1 border-stroke-1 first:h-7 first:border-t-0 last:h-7">
              <dt className="text-text-regular text-text-subtitle">{label}</dt>
              <dd className="text-text-regular text-text-title">{value}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="Verified">
        <ul className="flex flex-col gap-2">
          {r.verified.map((v) => (
            <li key={v} className="inline-flex items-center gap-2 text-text-regular text-text-title">
              <VerifiedMark className="h-[18px] w-[18px] text-green-ok" />{v}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Metrics">
        <dl className="flex flex-col gap-2">
          {r.metricRows.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-3">
              <dt className="text-text-regular text-text-subtitle">{m.label}</dt>
              <dd className="text-text-regular text-text-title">{m.value}</dd>
            </div>
          ))}
        </dl>
      </Block>

      {onReport && (
        <button type="button" onClick={onReport}
          className="flex h-12 items-center border-t-1 border-stroke-1 px-3 text-left text-text-medium text-text-title hover:text-red-600">
          Report Participant
        </button>
      )}
    </aside>
  )
}
