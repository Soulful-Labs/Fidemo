import { useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import { StudyFrame } from '../../components/client/StudyFrame'
import RevisionsTimeline from '../../components/client/RevisionsTimeline'
import { usePlatform, useStudy } from '../../platform'

/** Revisions History (2322:211934), a tab on every study type, between Results and Pay. */
export default function RevisionsTab() {
  const { id = '' } = useParams()
  const study = useStudy(id)
  const state = usePlatform()
  const client = state.clients.find((c) => c.id === study.clientId)
  return (
    <AppShell hideCreate crumbs={[{ label: 'Studies', to: '/studies' }, { label: study.breadcrumb }]}>
      <StudyFrame study={study} active="revisions" muted={study.state === 'paused'}>
        <div className="p-4">
          <RevisionsTimeline study={study} viewer="client" firstName={client?.name.split(' ')[0] ?? ''} />
        </div>
      </StudyFrame>
    </AppShell>
  )
}
