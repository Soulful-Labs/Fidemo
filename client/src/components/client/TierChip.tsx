import Tag from '../ui/Tag'
import { GoldMark, PlatinumMark, SilverMark } from '../ui/icons'
import { TIER } from '../../lib/studyTypes'
import type { Tier } from '../../lib/studyTypes'

const MARK = { silver: SilverMark, gold: GoldMark, platinum: PlatinumMark }

/** The tier chip beside a respondent's match score. */
export default function TierChip({ tier }: { tier: Tier }) {
  const Mark = MARK[tier]
  return <Tag tone={TIER[tier].tone} icon={<Mark className="h-4 w-4" />}>{TIER[tier].label}</Tag>
}
