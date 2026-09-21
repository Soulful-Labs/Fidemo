import { useNavigate } from 'react-router-dom'
import { TIER_LABEL } from '../../components/app/TierChip'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { cn } from '../../lib/cn'
import { TIERS, tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * Policy section 3 is the only source for what a tier is: a Trust Score
 * band. The drawn descriptors ("You're in top expert participants", "In Top
 * 20%", "Higher tiers unlock better opportunities and rewards") are not in
 * the policy and are not shown.
 */
const TIER_ROWS = [
  { key: 'platinum', text: 'text-tier-platinum', bg: 'bg-purple-fade', ring: 'border-tier-platinum' },
  { key: 'gold', text: 'text-tier-gold', bg: 'bg-yellow-fade', ring: 'border-tier-gold' },
  { key: 'silver', text: 'text-tier-silver', bg: '', ring: 'border-tier-silver' },
] as const

const NOTES = [
  'Tier is determined by the current Trust Score.',
  'Tier thresholds are based only on Trust Score.',
  'Adding a credential does not affect Trust Score or tier.',
]

/** PRD 7.4, Figma 1114:95843, with the policy's tier bands and notes. */
export default function HowTiersWork() {
  const navigate = useNavigate()
  const { user } = useStore()
  const current = tierFor(user.trustScore)

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="How Tiers Works" onBack={() => navigate('/trust-score')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <p className="flex items-center gap-3 text-body-medium text-brand-primary">
          <span className="h-px flex-1 bg-stroke-3" />Tiers Progress<span className="h-px flex-1 bg-stroke-3" />
        </p>

        <ol className="relative flex flex-col gap-3">
          <span className="absolute bottom-8 left-9 top-8 w-0.5 bg-yellow-700" aria-hidden="true" />
          {TIER_ROWS.map((t) => {
            const active = t.key === current
            const { name } = TIER_LABEL[t.key]
            return (
              <li key={t.key} className={cn('relative flex items-center gap-3 rounded-lg p-3', active ? cn('bg-bgAlt-2', t.bg) : '')}>
                <span className={cn('relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-bgAlt-0', t.ring, t.text)}>
                  <TierGlyph tier={t.key} />
                  {active && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cta-primary px-2 text-label text-cta-primaryText">{user.trustScore}</span>
                  )}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className={cn('text-title-s', t.text)}>{name}</span>
                    {active && <Tag tone={t.key === 'platinum' ? 'purple' : t.key === 'gold' ? 'yellow' : 'neutral'}>Your tier</Tag>}
                  </span>
                  <span className="text-text-regular text-text-title">Trust Score {TIERS[t.key]}+</span>
                </span>
              </li>
            )
          })}
        </ol>

        <p className="pt-2 text-center text-text-regular text-text-subtitle">Tier is determined by your current Trust Score.</p>

        <ol className="flex flex-col gap-2">
          {NOTES.map((note, i) => (
            <li key={note} className="flex items-center gap-3 rounded-lg bg-bgAlt-2 p-3">
              <span className="text-body-medium text-brand-secondary">{i + 1}</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-900/40 text-brand-secondary"><TierGlyph tier="silver" /></span>
              <span className="text-text-regular text-text-subtitle">{note}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function TierGlyph({ tier }: { tier: 'silver' | 'gold' | 'platinum' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' } as const
  if (tier === 'gold') return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" {...common} /></svg>
  if (tier === 'platinum') return <svg viewBox="0 0 24 24" width="24" height="24"><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" {...common} /></svg>
  return <svg viewBox="0 0 24 24" width="24" height="24"><path d="m12 3 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8L12 3Z" {...common} /></svg>
}
