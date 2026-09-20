import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/app/StudyCard'
import { useStore } from '../../mock/store'
import SectionHeader, { ViewAll } from './SectionHeader'

/** Invite and scheduled cards (PRD 5.1), using the one StudyCard. */
export default function UpdatesSection() {
  const navigate = useNavigate()
  const { studies, toggleSaved, toast } = useStore()

  const updates = studies
    .filter((s) => ['invited_to_schedule', 'invited_to_apply', 'invited_to_complete', 'scheduled'].includes(s.status))
    .slice(0, 3)

  if (updates.length === 0) return null

  const primaryFor = (id: string, status: string) => {
    if (status === 'invited_to_schedule') return () => navigate(`/studies/${id}/schedule`)
    if (status === 'invited_to_apply') return () => navigate(`/studies/${id}/screener`)
    return () => navigate(`/studies/${id}`)
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Updates" />
      {updates.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          showActions={study.status !== 'scheduled'}
          onOpen={() => navigate(`/studies/${study.id}`)}
          onToggleSave={() => toggleSaved(study.id)}
          onPrimary={primaryFor(study.id, study.status)}
          onSecondary={() => navigate(`/studies/${study.id}`)}
          onMatchScore={() => toast('Match score shows how relevant this study is to your profile')}
        />
      ))}
      <ViewAll to="/studies/mine/invites" />
    </section>
  )
}
