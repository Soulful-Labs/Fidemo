import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import RespondentCard from '../../components/client/RespondentCard'
import type { Respondent } from '../../components/client/RespondentCard'
import RespondentPanel from '../dashboard/RespondentPanel'
import { StudyFrame } from '../../components/client/StudyFrame'
import { SentModal } from '../pool/PoolModals'
import { ChevronRight } from '../../components/ui/icons'
import { useStudies, useStudy } from '../../mock/store'
import { recruits } from '../../lib/derive'
import { useToast } from '../../components/ui/Toast'

/**
 * Matched (1627:96237) and Invited (1627:96329) are one tab with a segmented
 * switch, not two screens: same heading, same description, same filters, same
 * nine cards. Only each card's action row changes.
 *
 * Both halves now read the study's own participant list. Workflow step 24
 * ranks by score and tier, which is what the Sort control does; step 27 has
 * the client selecting rather than contacting, so Invite To Study moves the
 * person to `invited` and the platform does the sending.
 */
export default function MatchedTab() {
  const { id } = useParams()
  const s = useStudy(id)
  const { pathname } = useLocation()
  // Matched and Invited are one tab with a switch; the route map names both.
  const [state, setState] = useState<'matched' | 'invited'>(pathname.endsWith('/invited') ? 'invited' : 'matched')
  const [tier, setTier] = useState('All')
  const { moveRespondent } = useStudies()
  const toast = useToast()
  /** The frame draws nine cards; the rest are behind Load more. */
  const [shown, setShown] = useState(9)
  const matched = recruits(s, state)
    .filter((r) => tier === 'All' || r.tier === tier.toLowerCase())
    .sort((a, b) => b.score - a.score)
  const people = matched.slice(0, shown)
  /** Respondent Profile Details (1627:98130) is the Dashboard's panel, reused. */
  const [profile, setProfile] = useState<Respondent | null>(null)
  const [sent, setSent] = useState(false)

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="matched" minH="min-h-[1307px]" bodyMinH="min-h-[1057px]">
        <div className="flex flex-col px-4 pt-4">
          <h2 className="text-title-s leading-[22px] text-text-title">Matched Respondents</h2>
          <p className="pt-2 text-text-regular text-text-subtitle">
            Surfaced from the Pool who are matching with target audience criteria. Invite those who you like to get insights from.
          </p>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Tabs variant="segmented" className="w-[238px]" value={state} onChange={(k) => setState(k as 'matched' | 'invited')}
              items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
            <div className="flex items-center gap-3">
              <Select value="Sort: Score" className="w-[180px]" onClick={() => toast('Ranked by score and tier, as the matching does')} />
              <Select value={`Tier: ${tier}`} className="w-[160px]"
                onClick={() => setTier((t) => (t === 'All' ? 'Platinum' : t === 'Platinum' ? 'Gold' : t === 'Gold' ? 'Silver' : 'All'))} />
              <Select value="Location: All" className="w-[180px]" onClick={() => toast('Every matched respondent is in the study’s target locations')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6">
            {people.length === 0 && (
              <p className="col-span-3 py-10 text-center text-body-regular text-text-subtitle">
                {state === 'matched' ? 'Nobody new is waiting to be invited.' : 'No invitations have gone out yet.'}
              </p>
            )}
            {people.map((r) => (
              <RespondentCard key={r.id} respondent={r} actions={
                state === 'matched' ? (
                  <>
                    <Button variant="secondary" size="none" className="h-11 flex-1" onClick={() => {
                      const res = moveRespondent(s.id, r.id, 'invited')
                      if (res.ok) setSent(true); else toast(res.why)
                    }}>Invite To Study</Button>
                    <Button variant="tertiary" size="none" className="h-11 flex-1" onClick={() => setProfile(r)}
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Profile</Button>
                  </>
                ) : (
                  <Button variant="tertiary" size="none" className="h-11 flex-1" disabled>Invitation Sent!</Button>
                )
              } />
            ))}
            {matched.length > people.length && (
              <button type="button" onClick={() => setShown((n) => n + 9)}
                className="col-span-3 py-4 text-body-medium text-brand-primary hover:underline">
                Load more ({matched.length - people.length} more)
              </button>
            )}
          </div>
        </div>
      </StudyFrame>
      <RespondentPanel open={!!profile} respondent={profile} onClose={() => setProfile(null)} />
      <SentModal open={sent} onClose={() => setSent(false)} />
    </AppShell>
  )
}
