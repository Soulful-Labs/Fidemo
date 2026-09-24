import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import RespondentCard from '../../components/client/RespondentCard'
import { StudyFrame } from '../../components/client/StudyFrame'
import { ChevronRight } from '../../components/ui/icons'
import { RECOMMENDED } from '../../mock/dashboard'
import { managedStudy } from '../../mock/studies'

/**
 * Matched (1627:96237) and Invited (1627:96329) are one tab with a segmented
 * switch, not two screens: same heading, same description, same filters, same
 * nine cards. Only each card's action row changes.
 */
export default function MatchedTab() {
  const { id } = useParams()
  const s = managedStudy(id)
  const [state, setState] = useState<'matched' | 'invited'>('matched')

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="matched" minH="min-h-[1307px]" bodyMinH="min-h-[1057px]">
        <div className="flex flex-col px-4 pt-4">
          <h2 className="text-title-s leading-[22px] text-text-title">Matched Respondents</h2>
          <p className="pt-2 text-text-regular text-text-subtitle">
            Surfaced from the Pool who are matching with target audience criteria. Invite those who you like to get insights from.
          </p>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Tabs variant="segmented" value={state} onChange={(k) => setState(k as 'matched' | 'invited')}
              items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
            <div className="flex items-center gap-3">
              <Select value="Sort: Score" className="w-[180px]" />
              <Select value="Tier: All" className="w-[160px]" />
              <Select value="Location: All" className="w-[180px]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6">
            {RECOMMENDED.map((r) => (
              <RespondentCard key={r.id} respondent={r} actions={
                state === 'matched' ? (
                  <>
                    <Button variant="secondary" size="none" className="h-11 flex-1">Invite To Study</Button>
                    <Button variant="tertiary" size="none" className="h-11 flex-1"
                      rightIcon={<ChevronRight className="h-4 w-4" />}>View Profile</Button>
                  </>
                ) : (
                  <Button variant="tertiary" size="none" className="h-11 flex-1" disabled>Invitation Sent!</Button>
                )
              } />
            ))}
          </div>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
