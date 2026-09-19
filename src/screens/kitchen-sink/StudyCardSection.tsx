import { useState } from 'react'
import StudyCard from '../../components/app/StudyCard'
import { STATUS } from '../../lib/studyState'
import type { StudyStatus } from '../../mock/types'
import { ALL_STATUSES, withStatus } from './fixtures'
import Section, { Row } from './Section'

export default function StudyCardSection({ toast }: { toast: (msg: string) => void }) {
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const card = (status: StudyStatus, extra?: { footnote?: string; showStatus?: boolean }) => {
    const study = withStatus(status, { saved: saved[status] ?? false })
    return (
      <StudyCard
        key={status}
        study={study}
        showStatus={extra?.showStatus}
        footnote={extra?.footnote}
        onOpen={() => toast(`Open study (${status})`)}
        onToggleSave={() => {
          setSaved((s) => ({ ...s, [status]: !s[status] }))
          toast(saved[status] ? 'Removed from saved' : 'Saved')
        }}
        onPrimary={() => toast(`${STATUS[status].primary} tapped`)}
        onSecondary={() => toast(`${STATUS[status].secondary} tapped`)}
        onReject={() => toast('Reject Invitation opened')}
        onMatchScore={() => toast('Match score explainer opened')}
      />
    )
  }

  return (
    <Section title="StudyCard — one component, every state">
      <Row label="Explore and invitations">
        <div className="flex w-full flex-col gap-3">
          {card('available')}
          {card('invited_to_apply')}
          {card('invited_to_schedule')}
        </div>
      </Row>

      <Row label="In flight">
        <div className="flex w-full flex-col gap-3">
          {card('draft')}
          {card('applied', { footnote: 'Applied on Wed, Mar 5', showStatus: true })}
          {card('scheduled', { footnote: 'Tue, May 20 10:30 AM ET' })}
        </div>
      </Row>

      <Row label="History, with status tags">
        <div className="flex w-full flex-col gap-3">
          {card('in_process', { showStatus: true })}
          {card('paid', { showStatus: true })}
          {card('rejected', { showStatus: true })}
          {card('no_show', { showStatus: true })}
        </div>
      </Row>

      <Row label="Compact, the Recommended rail">
        <div className="flex w-full gap-3 overflow-x-auto pb-2">
          {ALL_STATUSES.slice(0, 4).map((s) => (
            <StudyCard
              key={s}
              study={withStatus(s)}
              variant="compact"
              showActions={false}
              onOpen={() => toast(`Open study (${s})`)}
              onToggleSave={() => toast('Saved')}
              onMatchScore={() => toast('Match score explainer opened')}
            />
          ))}
        </div>
      </Row>
    </Section>
  )
}
